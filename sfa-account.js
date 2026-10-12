/* Sandy Flats Arcade: sign-in strip (student code from Mr. Crowell's email, or school Google account).
   Hub: a full sign-in card in #sfaAccount. Games: a small status chip in the top bar.
   Needs sfa-sync.js first. */
(function () {
  'use strict';
  var SFA = window.SFA, S = SFA && SFA.sync, CFG = window.SFA_CONFIG || {};
  if (!S || !S.on) return;
  var el = SFA.el;

  // roster names are "Last, First Middle": show the first name on the chip
  function first(n) { n = String(n || ''); return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || n; }
  function nice(n) { n = String(n || ''); if (n.indexOf(',') < 0) return n; var p = n.split(','); return (p[1].trim().split(' ')[0] + ' ' + p[0].trim()).trim(); }
  function jwt(t) { try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); } catch (e) { return {}; } }
  function credExpSoon() { var c = SFA.store.get('sync.cred', null); return c && c.kind === 'google' && (jwt(c.token).exp || 0) * 1000 < Date.now() + 5 * 60 * 1000; }

  /* ---------- Google Identity Services ---------- */
  var gisReady = null;
  function loadGis() {
    if (gisReady) return gisReady;
    gisReady = new Promise(function (res, rej) {
      if (window.google && google.accounts && google.accounts.id) return res();
      var s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    }).then(function () {
      google.accounts.id.initialize({
        client_id: CFG.clientId, auto_select: true, cancel_on_tap_outside: true, use_fedcm_for_prompt: true,
        hd: CFG.domain || undefined, context: 'signin', itp_support: true,
        callback: function (r) { onToken(r.credential); }
      });
    });
    return gisReady;
  }
  var waiting = [];
  function onToken(tok) {
    var first = !S.me;
    S.signInGoogle(tok).then(function (st) {
      if (first) SFA.toast('Signed in as ' + nice(st.name) + '. Your progress saves to your class.');
      waiting.splice(0).forEach(function (f) { f(null); });
    }, function (e) {
      var m = /not on roster/.test(e.message) ? 'That account isn\'t on the class list yet. Tell Mr. Crowell.' : /school account/.test(e.message) ? 'Use your school Google account.' : 'Sign-in didn\'t work. Try again.';
      SFA.toast(m, 5000); waiting.splice(0).forEach(function (f) { f(e); });
    });
  }
  // quietly refresh an expired token (Google tokens last an hour)
  // gives up after 8 s: Google can quietly skip the prompt (dismissed before, cooldown), and nothing would ever answer
  S.refresh = function () {
    return loadGis().then(function () {
      return new Promise(function (res) {
        var done = false, fin = function (e) { if (!done) { done = true; res(e); } };
        waiting.push(fin); setTimeout(function () { fin(new Error('timeout')); }, 8000);
        google.accounts.id.prompt();
      });
    }, function () { return new Error('offline'); });
  };
  // backup sign-in: the student code from the Roster tab (works when Google sign-in is blocked for students)
  function codeBox() {
    var inp = el('input', { type: 'text', placeholder: 'Student code', maxlength: '10', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': 'Student code', style: 'width:8.5em;text-transform:uppercase;font-family:var(--mono,monospace)' });
    var b = el('button', { type: 'button', 'class': 'btn small', text: 'Sign in' });
    function go() {
      var c = inp.value.trim(); if (c.length < 4) { inp.focus(); return; }
      b.disabled = true;
      S.signInCode(c).then(function (st) { SFA.toast('Signed in as ' + nice(st.name) + '. Your work saves to your class.', 4000); }, function (e) {
        b.disabled = false;
        SFA.toast(/bad code/.test(e.message) ? 'That code didn\'t work. Check the email from Mr. Crowell and type it again.' : /sign in/.test(e.message) ? 'Code sign-in isn\'t switched on yet. Tell Mr. Crowell.' : 'Sign-in didn\'t work: ' + e.message, 5000);
      });
    }
    b.addEventListener('click', go); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    return el('div', { 'class': 'codebox', style: 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px' }, [el('small', { text: CFG.auth === 'code' ? 'Your student code (check your school email):' : 'Google not working? Use your student code:' }), inp, b]);
  }
  // a Google sign-in button anywhere on the page (the lesson slides put one under an answer that couldn't send)
  S.button = function (box) {
    var g = el('span', { style: 'display:inline-block;vertical-align:middle' }); box.appendChild(g);
    if (CFG.auth !== 'code') loadGis().then(function () { google.accounts.id.renderButton(g, { theme: 'filled_black', size: 'medium', shape: 'pill', text: 'signin_with' }); }, function () { g.textContent = 'Google sign-in couldn\'t load.'; });
    if (CFG.auth === 'both' || CFG.auth === 'code') box.appendChild(codeBox());
  };
  S.credExpired = function () { var c = SFA.store.get('sync.cred', null); return !!(c && c.kind === 'google' && (jwt(c.token).exp || 0) * 1000 < Date.now()); };
  S.onChange(function (s) { if (CFG.auth !== 'code' && s.status === 'signedout' && SFA.store.get('sync.me', null) && credExpSoon()) S.refresh(); });

  /* ---------- hub card ---------- */
  function hubCard(box) {
    function draw() {
      box.innerHTML = '';
      if (S.me) {
        if (S.status === 'signedout') {
          // the saved sign-in stopped working (an old Google sign-in, or a changed code): sign in again without losing anything
          box.appendChild(el('div', { 'class': 'acct out' }, [
            el('div', {}, [el('b', { text: nice(S.me.name) + ', your work isn\'t saving right now' }), el('small', { text: 'Type your student code again (it\'s in your school email from Mr. Crowell). Nothing you did on this computer is lost: it sends as soon as you\'re back in.' })]),
            codeBox()
          ]));
          return;
        }
        var st = { saved: 'Saved to your class ✓', saving: 'Saving…', offline: 'Offline: saves will send when you\'re back', signedout: 'Signed out' }[S.status] || '';
        box.appendChild(el('div', { 'class': 'acct' }, [
          el('div', {}, [el('b', { text: 'Signed in as ' + nice(S.me.name) }), el('small', { text: st })]),
          el('div', { 'class': 'row' }, [
            el('a', { 'class': 'btn primary', href: 'results.html', text: 'My results' }),
            el('button', { type: 'button', 'class': 'btn', text: 'Sign out', onclick: function () { if (S.unsent && S.unsent() && !window.confirm('Some of your work hasn\'t reached Mr. Crowell yet. If you sign out now, it is lost.\n\nSign out anyway?')) return; S.signOut(); location.reload(); } })
          ])
        ]));
      } else {
        if (CFG.auth === 'code') {
          box.appendChild(el('div', { 'class': 'acct out' }, [
            el('div', {}, [el('b', { text: 'Sign in with your student code' }), el('small', { text: 'Check your school email: Mr. Crowell sent you a 6-character code. Type it below. Your levels and certificates follow you to any computer, and Mr. Crowell can see how you\'re doing.' })]),
            codeBox()
          ]));
          return;
        }
        var gbtn = el('div', { id: 'gsiBtn' });
        box.appendChild(el('div', { 'class': 'acct out' }, [
          el('div', {}, [el('b', { text: 'Sign in to save your progress' }), el('small', { text: 'Use your school Google account. Your levels and certificates follow you to any computer, and Mr. Crowell can see how you\'re doing.' })]),
          gbtn
        ].concat(CFG.auth === 'both' || CFG.auth === 'code' ? [codeBox()] : [])));
        loadGis().then(function () { google.accounts.id.renderButton(gbtn, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with' }); }, function () { gbtn.textContent = 'Google sign-in couldn\'t load. Check the internet connection.'; });
      }
    }
    S.onChange(draw);
  }

  /* ---------- game chip ---------- */
  function gameChip(bar) {
    var chip = el('a', { 'class': 'chip', href: 'index.html#signin' });
    bar.appendChild(chip);
    S.onChange(function (s) {
      if (!s.me) { chip.textContent = 'Not saving: sign in'; chip.style.borderColor = 'var(--red)'; chip.href = 'index.html#signin'; return; }
      chip.style.borderColor = '';
      chip.textContent = s.status === 'saving' ? 'Saving…' : s.status === 'offline' ? 'Not saved yet (retrying)' : s.status === 'signedout' ? 'Not saving: sign in again' : '✓ Saved · ' + first(s.me.name);
      chip.style.borderColor = s.status === 'offline' || s.status === 'signedout' ? 'var(--red)' : '';
      chip.href = s.status === 'signedout' ? 'index.html#signin' : 'results.html';
    });
  }

  function boot() {
    var hub = document.getElementById('sfaAccount');
    if (hub) hubCard(hub);
    else { var bar = document.querySelector('.topbar .chips'); if (bar) gameChip(bar); }
    if (CFG.auth !== 'code' && S.me && credExpSoon()) S.refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
