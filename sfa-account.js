/* Sandy Flats Arcade: sign-in strip (school Google account).
   Hub: a full sign-in card in #sfaAccount. Games: a small status chip in the top bar.
   Needs sfa-sync.js first. */
(function () {
  'use strict';
  var SFA = window.SFA, S = SFA && SFA.sync, CFG = window.SFA_CONFIG || {};
  if (!S || !S.on) return;
  var el = SFA.el;

  // roster names are "Last, First Middle": show the first name on the chip
  function first(n) { n = String(n || ''); return (n.indexOf(',') >= 0 ? n.split(',')[1] : n).trim().split(' ')[0] || n; }
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
      if (first) SFA.toast('Signed in as ' + st.name + '. Your progress saves to your class.');
      waiting.splice(0).forEach(function (f) { f(null); });
    }, function (e) {
      var m = /not on roster/.test(e.message) ? 'That account isn\'t on the class list yet. Tell Mr. Crowell.' : /school account/.test(e.message) ? 'Use your school Google account.' : 'Sign-in didn\'t work. Try again.';
      SFA.toast(m, 5000); waiting.splice(0).forEach(function (f) { f(e); });
    });
  }
  // quietly refresh an expired token (Google tokens last an hour)
  S.refresh = function () { return loadGis().then(function () { return new Promise(function (res) { waiting.push(res); google.accounts.id.prompt(); }); }); };
  S.onChange(function (s) { if (s.status === 'signedout' && SFA.store.get('sync.me', null) && credExpSoon()) S.refresh(); });

  /* ---------- hub card ---------- */
  function hubCard(box) {
    function draw() {
      box.innerHTML = '';
      if (S.me) {
        var st = { saved: 'Saved to your class ✓', saving: 'Saving…', offline: 'Offline: saves will send when you\'re back', signedout: 'Signed out' }[S.status] || '';
        box.appendChild(el('div', { 'class': 'acct' }, [
          el('div', {}, [el('b', { text: 'Signed in as ' + S.me.name }), el('small', { text: st })]),
          el('div', { 'class': 'row' }, [
            el('a', { 'class': 'btn primary', href: 'results.html', text: 'My results' }),
            el('button', { type: 'button', 'class': 'btn', text: 'Sign out', onclick: function () { S.signOut(); location.reload(); } })
          ])
        ]));
      } else {
        var gbtn = el('div', { id: 'gsiBtn' });
        box.appendChild(el('div', { 'class': 'acct out' }, [
          el('div', {}, [el('b', { text: 'Sign in to save your progress' }), el('small', { text: 'Use your school Google account. Your levels and certificates follow you to any computer, and Mr. Crowell can see how you\'re doing.' })]),
          gbtn
        ]));
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
      chip.textContent = s.status === 'saving' ? 'Saving…' : s.status === 'offline' ? 'Offline (will save)' : s.status === 'signedout' ? 'Sign in again' : '✓ ' + first(s.me.name);
      chip.href = s.status === 'signedout' ? 'index.html#signin' : 'results.html';
    });
  }

  function boot() {
    var hub = document.getElementById('sfaAccount');
    if (hub) hubCard(hub);
    else { var bar = document.querySelector('.topbar .chips'); if (bar) gameChip(bar); }
    if (S.me && credExpSoon()) S.refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
