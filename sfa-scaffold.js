/* Sandy Flats scaffold layer: supports that help a student get started, added on top of every lesson with no
   per-lesson work. Loaded by one script tag after sfa-lesson.js (lesson.html, lesson-practice.html) and also by the
   teacher planner and guide, which reuse the word list and the help ladder.

   1. Tap-to-define words. Math and instruction words in the slide text are found automatically and underlined; a tap
      shows a one-sentence meaning, a small picture or example, and the word in the student's own language.
   2. The help ladder. On every question a student answers, "Help me start" opens up to three steps:
      understand the question (key words, the question in pieces, a first move) -> see one like it (the worked example
      or teaching slide before the question) -> set it up (the hint, one option to cross out, or a sentence frame).
      Help never changes a score. What was opened is saved on the student's device next to the lesson record, in
      SFA.store 'les.help.<lesson id>':  { <question id>: { n: steps opened, at: time, frame: true }, _words: { slope: 2 } }.
   3. Read aloud (the browser's own speech) and a text-size switch.

   It never edits sfa-lesson.js. It reads the lesson through window.SFA_LESSON_API and watches the slide area for
   changes, so the lesson player can change freely. Slides may carry two optional fields the player ignores:
   opt: true (can be skipped when time is short) and wedo: true (a faded example the class finishes together). */
(function () {
  'use strict';
  var SFA = window.SFA || {}, VER = '20261120b';
  // one script tag is enough: the styles are fetched from next to this file
  (function () {
    var me = document.currentScript, href = (me && me.src ? me.src.replace(/[^\/]*$/, '') : '') + 'sfa-scaffold.css?v=' + VER;
    if (document.querySelector('link[data-sg]')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.setAttribute('data-sg', ''); document.head.appendChild(l);
  })();
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(s) { return esc(s).replace(/\*([^*]+)\*/g, '<b>$1</b>').replace(/_([^_]+)_/g, '<i>$1</i>'); }
  function plain(s) { return String(s || '').replace(/[*_]/g, ''); }
  // worked-example text with its blanks filled in: [[6]], [[~6]] and [[dashed|dotted]] all show the first answer
  function filled(s) { return String(s || '').split(/(\[\[[^\]]+\]\])/).map(function (p) { var m = /^\[\[~?([^\]]+)\]\]$/.exec(p); return m ? '<b class="sg-fill">' + esc(m[1].split('|')[0]) + '</b>' : fmt(p); }).join(''); }
  function filledPlain(s) { return plain(String(s || '').replace(/\[\[~?([^\]|]+)[^\]]*\]\]/g, '$1')); }

  /* ---------------- the word list ----------------
     re: what to look for (a regular expression, whole words). d: one plain sentence. ex: a tiny example.
     pic: a small drawing (see PICS). tr: the word in Arabic, Korean, Chinese, Spanish and French.
     cs: match lower case only. need: only when the slide also has this word (run needs rise). */
  var LANGS = [['ar', 'العربية'], ['ko', '한국어'], ['zh', '中文'], ['es', 'Español'], ['fr', 'Français']];
  var TERMS = [
    { id: 'slope-intercept form', re: 'slope-intercept(?: form)?', d: 'A line written as y = mx + b, so you can read the slope (m) and the y-intercept (b) straight away.', ex: 'y = 2x + 3: slope 2, crosses the y-axis at 3.', pic: 'yint', tr: { ar: 'صيغة الميل والمقطع', ko: '기울기-절편 형태 (y = mx + b)', zh: '斜截式', es: 'forma pendiente-intersección', fr: 'forme pente-ordonnée à l\'origine' } },
    { id: 'standard form', re: 'standard form', d: 'A line written as Ax + By = C: x and y on the same side, whole numbers, A not negative.', ex: '2x + 3y = 12 is in standard form.', tr: { ar: 'الصيغة القياسية', ko: '표준형', zh: '标准式', es: 'forma estándar', fr: 'forme standard' } },
    { id: 'rate of change', re: 'rates? of change', d: 'How much one amount changes when the other goes up by 1. On a line it is the slope.', ex: '$12 per month: the cost changes by 12 for each 1 month.', pic: 'slope', tr: { ar: 'معدل التغير', ko: '변화율', zh: '变化率', es: 'tasa de cambio', fr: 'taux de variation' } },
    { id: 'y-intercept', re: 'y-intercepts?', d: 'Where the line crosses the y-axis: the value of y when x is 0. It is the b in y = mx + b.', ex: 'y = 2x + 3 crosses the y-axis at (0, 3).', pic: 'yint', tr: { ar: 'المقطع الصادي', ko: 'y절편', zh: 'y轴截距', es: 'intersección con el eje y', fr: 'ordonnée à l\'origine' } },
    { id: 'x-intercept', re: 'x-intercepts?', d: 'Where the line crosses the x-axis: the value of x when y is 0.', ex: '3x + 2y = 6 crosses the x-axis at (2, 0).', pic: 'xint', tr: { ar: 'المقطع السيني', ko: 'x절편', zh: 'x轴截距', es: 'intersección con el eje x', fr: 'abscisse à l\'origine' } },
    { id: 'intercept', re: 'intercepts?', d: 'A point where a line crosses an axis.', ex: 'The y-intercept is on the y-axis. The x-intercept is on the x-axis.', pic: 'yint', tr: { ar: 'المقطع', ko: '절편', zh: '截距', es: 'intersección con un eje', fr: 'point d\'intersection avec un axe' } },
    { id: 'slope', re: 'slopes?', d: 'How steep a line is: how much y changes when x goes up by 1.', ex: 'y = 3x + 5 has slope 3: up 3 for every 1 to the right.', pic: 'slope', tr: { ar: 'الميل', ko: '기울기', zh: '斜率', es: 'pendiente', fr: 'pente' } },
    { id: 'coefficient', re: 'coefficients?', d: 'The number that multiplies a letter.', ex: 'In 5x, the coefficient of x is 5.', tr: { ar: 'المعامل', ko: '계수', zh: '系数', es: 'coeficiente', fr: 'coefficient' } },
    { id: 'constant', re: 'constants?', d: 'A number on its own that does not change.', ex: 'In y = 2x + 7, the constant is 7.', tr: { ar: 'الثابت', ko: '상수', zh: '常数', es: 'constante', fr: 'constante' } },
    { id: 'variable', re: 'variables?', d: 'A letter that stands for a number that can change.', ex: 'In y = 2x + 7, x and y are variables.', tr: { ar: 'المتغير', ko: '변수', zh: '变量', es: 'variable', fr: 'variable' } },
    { id: 'inequality', re: 'inequalit(?:y|ies)', d: 'A number sentence with <, >, ≤ or ≥ instead of =. It has many answers, not just one.', ex: 'x ≤ 7 means x can be 7 or any number below 7.', pic: 'shade', tr: { ar: 'المتباينة', ko: '부등식', zh: '不等式', es: 'desigualdad (inecuación)', fr: 'inéquation' } },
    { id: 'equation', re: 'equations?', d: 'A number sentence with an equals sign: both sides have the same value.', ex: 'y = 2x + 3 and 4x = 12 are equations.', tr: { ar: 'المعادلة', ko: '방정식', zh: '方程', es: 'ecuación', fr: 'équation' } },
    { id: 'linear', re: 'linear', d: 'Makes a straight line: y changes by the same amount every time x goes up by 1.', ex: '2, 5, 8, 11 is linear: it goes up 3 each time.', pic: 'linear', tr: { ar: 'خطّي', ko: '일차 (선형)', zh: '线性', es: 'lineal', fr: 'linéaire' } },
    { id: 'proportional', re: 'proportional', d: 'A straight line through (0, 0): double x and y doubles too.', ex: 'y = 4x is proportional. y = 4x + 1 is not.', tr: { ar: 'متناسب', ko: '비례', zh: '成正比', es: 'proporcional', fr: 'proportionnel' } },
    { id: 'function', re: 'functions?', d: 'A rule that gives exactly one output for every input.', ex: 'Double it and add 1: input 3 gives output 7, every time.', tr: { ar: 'الدالة', ko: '함수', zh: '函数', es: 'función', fr: 'fonction' } },
    { id: 'input', re: 'inputs?', d: 'The number you put in. It is usually x.', ex: 'Rule 2x + 1: the input 3 gives the output 7.', tr: { ar: 'المُدخَل', ko: '입력값', zh: '输入', es: 'entrada', fr: 'entrée' } },
    { id: 'output', re: 'outputs?', d: 'The number that comes out. It is usually y.', ex: 'Rule 2x + 1: the input 3 gives the output 7.', tr: { ar: 'المُخرَج', ko: '출력값', zh: '输出', es: 'salida', fr: 'sortie' } },
    { id: 'rule', re: 'rules?', d: 'What you do to the input to get the output.', ex: '"Multiply by 2, then add 1" is the rule y = 2x + 1.', tr: { ar: 'القاعدة', ko: '규칙', zh: '规则', es: 'regla', fr: 'règle' } },
    { id: 'domain', re: 'domain', d: 'All the inputs (x-values) that are allowed.', ex: 'Tickets sold: the domain is 0, 1, 2, 3, ...', tr: { ar: 'المجال', ko: '정의역', zh: '定义域', es: 'dominio', fr: 'ensemble de définition' } },
    { id: 'range', re: 'range', d: 'All the outputs (y-values) you can get.', ex: 'y = 2x for x = 1, 2, 3 has range 2, 4, 6.', tr: { ar: 'المدى', ko: '치역', zh: '值域', es: 'rango', fr: 'ensemble image' } },
    { id: 'origin', re: 'origin', d: 'The point (0, 0), where the x-axis and the y-axis cross.', pic: 'axes', tr: { ar: 'نقطة الأصل', ko: '원점', zh: '原点', es: 'origen', fr: 'origine' } },
    { id: 'y-axis', re: 'y-axis', d: 'The number line that goes up and down on a graph.', pic: 'axes', tr: { ar: 'محور الصادات', ko: 'y축', zh: 'y轴', es: 'eje y', fr: 'axe des y (ordonnées)' } },
    { id: 'x-axis', re: 'x-axis', d: 'The number line that goes left and right on a graph.', pic: 'axes', tr: { ar: 'محور السينات', ko: 'x축', zh: 'x轴', es: 'eje x', fr: 'axe des x (abscisses)' } },
    { id: 'rise', re: 'rise', d: 'How far the line goes up (+) or down (−) between two points.', ex: 'From (1, 2) to (4, 8) the rise is 6.', pic: 'slope', tr: { ar: 'التغير الرأسي (الارتفاع)', ko: '수직 변화량 (y의 변화)', zh: '纵向变化（上升量）', es: 'cambio vertical (elevación)', fr: 'déplacement vertical' } },
    { id: 'run', re: 'run', cs: true, need: /\brise\b/i, d: 'How far the line goes to the right between two points.', ex: 'From (1, 2) to (4, 8) the run is 3.', pic: 'slope', tr: { ar: 'التغير الأفقي', ko: '수평 변화량 (x의 변화)', zh: '横向变化（水平距离）', es: 'cambio horizontal (avance)', fr: 'déplacement horizontal' } },
    { id: 'steep', re: 'steep(?:er|est)?', d: 'A steep line goes up or down fast. The bigger the size of the slope, the steeper the line.', ex: 'Slope 5 is steeper than slope 2.', pic: 'steep', tr: { ar: 'شديد الانحدار', ko: '가파른', zh: '陡', es: 'empinado', fr: 'raide (pentu)' } },
    { id: 'vertical', re: 'vertical', d: 'Straight up and down.', pic: 'vert', tr: { ar: 'رأسي', ko: '수직 (세로)', zh: '竖直', es: 'vertical', fr: 'vertical' } },
    { id: 'horizontal', re: 'horizontal', d: 'Flat, going left to right.', pic: 'vert', tr: { ar: 'أفقي', ko: '수평 (가로)', zh: '水平', es: 'horizontal', fr: 'horizontal' } },
    { id: 'parallel', re: 'parallel', d: 'Lines with the same slope. They never meet.', pic: 'parallel', tr: { ar: 'متوازي', ko: '평행', zh: '平行', es: 'paralelo', fr: 'parallèle' } },
    { id: 'undefined', re: 'undefined', d: 'It has no value. A vertical line has an undefined slope, because you cannot divide by 0.', pic: 'vert', tr: { ar: 'غير معرّف', ko: '정의되지 않음', zh: '无定义', es: 'indefinido', fr: 'non défini' } },
    { id: 'at most', re: 'at most', d: 'That number or less. Use ≤.', ex: 'At most 40 means 40, 39, 38, ... so x ≤ 40.', tr: { ar: 'على الأكثر', ko: '많아야 (최대)', zh: '至多（最多）', es: 'como máximo', fr: 'au plus' } },
    { id: 'at least', re: 'at least', d: 'That number or more. Use ≥.', ex: 'At least 100 means 100, 101, 102, ... so x ≥ 100.', tr: { ar: 'على الأقل', ko: '적어도 (최소)', zh: '至少', es: 'al menos (como mínimo)', fr: 'au moins' } },
    { id: 'solution', re: 'solutions?', d: 'A value that makes the equation or inequality true.', ex: 'x = 4 is the solution of 3x = 12.', tr: { ar: 'الحل', ko: '해', zh: '解', es: 'solución', fr: 'solution' } },
    { id: 'solve', re: 'solv(?:e|es|ed|ing)', d: 'Find the value that makes it true.', ex: 'Solve 3x = 12: x = 4.', tr: { ar: 'حُلّ (أوجد الحل)', ko: '풀다', zh: '解（求解）', es: 'resolver', fr: 'résoudre' } },
    { id: 'substitute', re: 'substitut(?:e|es|ed|ing)', d: 'Put a number in the place of a letter.', ex: 'Substitute x = 2 into 3x + 1: 3(2) + 1 = 7.', tr: { ar: 'عوِّض', ko: '대입하다', zh: '代入', es: 'sustituir', fr: 'remplacer (substituer)' } },
    { id: 'simplify', re: 'simplif(?:y|ies|ied|ying)', d: 'Write it in the shortest way with the same value.', ex: '4/6 simplifies to 2/3.', tr: { ar: 'بسِّط', ko: '간단히 하다', zh: '化简', es: 'simplificar', fr: 'simplifier' } },
    { id: 'both sides', re: 'both sides', d: 'The left of the equals sign and the right of it. Do the same thing to both to keep them equal.', ex: '2y = 10: divide both sides by 2 to get y = 5.', tr: { ar: 'كِلا الطرفين', ko: '양변', zh: '等式两边', es: 'ambos lados', fr: 'les deux membres (côtés)' } },
    { id: 'term', re: 'terms?', d: 'One part of an equation: a number, a letter, or a number times a letter.', ex: '2x + 3y = 12 has three terms: 2x, 3y and 12.', tr: { ar: 'الحدّ', ko: '항', zh: '项', es: 'término', fr: 'terme' } },
    { id: 'subtract', re: 'subtract(?:s|ed|ing)?', d: 'Take away (−).', ex: '8 − 2 = 6.', tr: { ar: 'اطرح', ko: '빼다', zh: '减', es: 'restar', fr: 'soustraire' } },
    { id: 'divide', re: 'divid(?:e|es|ed|ing)', d: 'Share into equal parts (÷).', ex: '12 ÷ 3 = 4.', tr: { ar: 'اقسم', ko: '나누다', zh: '除', es: 'dividir', fr: 'diviser' } },
    { id: 'multiply', re: 'multipl(?:y|ies|ied|ying)', d: 'Times (×).', ex: '3 × 4 = 12.', tr: { ar: 'اضرب', ko: '곱하다', zh: '乘', es: 'multiplicar', fr: 'multiplier' } },
    { id: 'fraction', re: 'fractions?', d: 'A number written as one number over another, like 2/3.', ex: '2/3 means 2 ÷ 3.', tr: { ar: 'كسر', ko: '분수', zh: '分数', es: 'fracción', fr: 'fraction' } },
    { id: 'whole number', re: 'whole numbers?', d: 'A number with no fraction or decimal part.', ex: '3 and 12 are whole numbers. 2.5 is not.', tr: { ar: 'عدد صحيح (بدون كسور)', ko: '정수 (분수가 아닌 수)', zh: '整数', es: 'número entero', fr: 'nombre entier' } },
    { id: 'negative', re: 'negatives?', d: 'Less than zero. A negative slope goes downhill from left to right.', ex: '−3 is negative.', pic: 'posneg', tr: { ar: 'سالب', ko: '음수 (음의)', zh: '负', es: 'negativo', fr: 'négatif' } },
    { id: 'positive', re: 'positive', d: 'More than zero. A positive slope goes uphill from left to right.', ex: '5 is positive.', pic: 'posneg', tr: { ar: 'موجب', ko: '양수 (양의)', zh: '正', es: 'positivo', fr: 'positif' } },
    { id: 'reciprocal', re: 'reciprocals?', d: 'The fraction turned upside down.', ex: 'The reciprocal of 2/3 is 3/2.', tr: { ar: 'المقلوب', ko: '역수', zh: '倒数', es: 'recíproco', fr: 'inverse' } },
    { id: 'dashed', re: 'dashed', d: 'A line drawn with gaps. On an inequality graph it means the points on the line do NOT count (< or >).', pic: 'dash', tr: { ar: 'خط متقطع', ko: '점선', zh: '虚线', es: 'línea discontinua', fr: 'ligne en pointillés' } },
    { id: 'solid', re: 'solid', d: 'A line drawn with no gaps. On an inequality graph it means the points on the line DO count (≤ or ≥).', pic: 'dash', tr: { ar: 'خط متصل', ko: '실선', zh: '实线', es: 'línea continua', fr: 'trait plein' } },
    { id: 'shade', re: 'shad(?:e|ed|es|ing)', d: 'Colour in the side of the line where every point is a solution.', pic: 'shade', tr: { ar: 'ظلِّل', ko: '색칠하다', zh: '涂阴影', es: 'sombrear', fr: 'hachurer (colorier)' } },
    { id: 'rate', re: 'rates?', d: 'How much something changes for each 1 of something else.', ex: '$15 a month, 40 litres per minute.', tr: { ar: 'المعدّل', ko: '비율 (율)', zh: '比率', es: 'tasa', fr: 'taux' } },
    { id: 'per', re: 'per', cs: true, d: 'For each one.', ex: '$12 per month means $12 for each month.', tr: { ar: 'لكل', ko: '~당 (마다)', zh: '每', es: 'por (cada)', fr: 'par' } },
    { id: 'fee', re: 'fees?', d: 'Money you pay for a service. A starting fee is paid once, at the beginning.', ex: 'A $25 sign-up fee, then $12 per month.', tr: { ar: 'رسوم', ko: '요금', zh: '费用', es: 'tarifa (cuota)', fr: 'frais' } },
    { id: 'units', re: 'units', cs: true, d: 'What a number is counting or measuring.', ex: 'dollars, minutes, cm, litres.', tr: { ar: 'وحدات', ko: '단위', zh: '单位', es: 'unidades', fr: 'unités' } },
    { id: 'double', re: 'doubl(?:e|es|ed|ing)|twice', d: 'Two times as much.', ex: 'Double 6 is 12.', tr: { ar: 'ضِعف', ko: '두 배', zh: '两倍', es: 'el doble', fr: 'le double' } },
    { id: 'half', re: 'half|halve[sd]?', d: 'One of two equal parts: divide by 2.', ex: 'Half of 10 is 5.', tr: { ar: 'نصف', ko: '절반', zh: '一半', es: 'la mitad', fr: 'la moitié' } },
    { id: 'table', re: 'tables?', d: 'Numbers set out in rows and columns. Each row is one x with its y.', ex: 'x: 0, 1, 2 and y: 4, 7, 10.', tr: { ar: 'جدول', ko: '표', zh: '表格', es: 'tabla', fr: 'tableau' } },
    { id: 'graph', re: 'graph(?:s|ed|ing)?', d: 'A picture of the points that fit a rule, drawn on the x-axis and y-axis.', pic: 'linear', tr: { ar: 'تمثيل بياني', ko: '그래프', zh: '图像', es: 'gráfica', fr: 'graphique' } }
  ];
  var BY = {}; TERMS.forEach(function (t) { BY[t.id] = t; t.one = new RegExp('^(?:' + t.re + ')$', 'i'); });
  var RX = new RegExp('\\b(?:' + TERMS.map(function (t) { return t.re; }).join('|') + ')\\b', 'gi');
  var idCache = {};
  function idOf(word) {
    if (word in idCache) return idCache[word];
    var hit = null;
    for (var i = 0; i < TERMS.length; i++) { var t = TERMS[i]; if (t.one.test(word) && (!t.cs || word === word.toLowerCase())) { hit = t.id; break; } }
    return (idCache[word] = hit);
  }
  // every word-list term in a piece of text, in the order they appear: [{ id, i, len }]
  function scan(text, ctx) {
    var out = [], m; RX.lastIndex = 0; text = String(text || '');
    while ((m = RX.exec(text))) { var id = idOf(m[0]); if (!id) continue; var t = BY[id]; if (t.need && !t.need.test(ctx == null ? text : ctx)) continue; out.push({ id: id, i: m.index, len: m[0].length }); }
    return out;
  }
  function termsIn(text) { var seen = {}, ids = []; scan(text).forEach(function (h) { if (!seen[h.id]) { seen[h.id] = 1; ids.push(h.id); } }); return ids; }
  function lessonText(L) { return (L.slides || []).map(function (s) { return JSON.stringify(s, function (k, v) { return k === 'fig' ? undefined : v; }); }).join(' ').replace(/\\"/g, '"'); }

  /* small drawings for the word cards */
  var C = { ax: '#8a84a0', ln: '#FFC94A', ac: '#5CE0B8', tx: '#F3EFE7' };
  function svg(inner, cross) {
    var axes = cross ? '<path d="M60 4V76M6 40H114" fill="none" stroke="' + C.ax + '" stroke-width="1.5"/>' : '<path d="M20 4V68H114" fill="none" stroke="' + C.ax + '" stroke-width="1.5"/>';
    return '<svg class="sg-pic" viewBox="0 0 120 80" role="img" aria-hidden="true">' + axes + inner + '</svg>';
  }
  function tx(x, y, s, col) { return '<text x="' + x + '" y="' + y + '" font-size="9" font-family="system-ui,sans-serif" fill="' + (col || C.tx) + '">' + s + '</text>'; }
  function ln(a, b, c, d, col, dash) { return '<path d="M' + a + ' ' + b + 'L' + c + ' ' + d + '" stroke="' + (col || C.ln) + '" stroke-width="2.5" fill="none" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>'; }
  var PICS = {
    slope: function () { return svg(ln(26, 62, 108, 12) + ln(46, 50, 88, 50, C.ac, '3 3') + ln(88, 50, 88, 24, C.ac, '3 3') + tx(60, 61, 'run', C.ac) + tx(92, 40, 'rise', C.ac)); },
    yint: function () { return svg(ln(20, 46, 108, 12) + '<circle cx="20" cy="46" r="4" fill="' + C.ac + '"/>' + tx(27, 58, '(0, b)', C.ac)); },
    xint: function () { return svg(ln(24, 14, 96, 76) + '<circle cx="88.9" cy="68" r="4" fill="' + C.ac + '"/>' + tx(52, 62, 'y = 0 here', C.ac)); },
    axes: function () { return svg('<circle cx="60" cy="40" r="3.5" fill="' + C.ac + '"/>' + tx(64, 51, '(0, 0)', C.ac) + tx(104, 36, 'x') + tx(64, 11, 'y'), true); },
    steep: function () { return svg(ln(22, 66, 52, 8) + ln(22, 66, 110, 46, C.ac) + tx(56, 16, 'steep') + tx(74, 44, 'not steep', C.ac)); },
    vert: function () { return svg(ln(44, 8, 44, 72) + ln(10, 22, 110, 22, C.ac) + tx(48, 68, 'vertical') + tx(66, 18, 'horizontal', C.ac), true); },
    parallel: function () { return svg(ln(24, 60, 84, 12) + ln(48, 64, 108, 16, C.ac)); },
    posneg: function () { return svg(ln(24, 60, 60, 14) + ln(70, 14, 108, 60, C.ac) + tx(24, 76, 'positive') + tx(72, 76, 'negative', C.ac)); },
    dash: function () { return svg(ln(24, 56, 104, 12, C.ln, '6 5') + ln(24, 70, 104, 34, C.ac) + tx(26, 22, 'dashed: < or >') + tx(52, 68, 'solid: ≤ or ≥', C.ac)); },
    shade: function () { return svg('<path d="M20 52L112 14V68H20Z" fill="' + C.ac + '" opacity=".28"/>' + ln(20, 52, 112, 14) + tx(52, 60, 'shaded side', C.ac)); },
    linear: function () { return svg(ln(24, 60, 108, 14) + [[38, 52.3], [59, 40.8], [80, 29.3], [101, 17.8]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.2" fill="' + C.ac + '"/>'; }).join('')); }
  };

  /* ---------------- the help ladder (also shown to the teacher in the planner) ---------------- */
  // the six newer ways to answer (sfa-lesson.js: mistake, order, cross, odd, asn, est) get a first move of their own
  var NEWMOVE = {
    mistake: 'Read the working one line at a time. Do each line yourself on paper. Tap the first line where your answer is different.',
    order: 'Find the step that has to come first. Ask: what do you always do first in a problem like this?',
    cross: 'Find one option you are sure is wrong and cross it out. Then look at the others again.',
    odd: 'Find something that all the others share. The one without it does not belong. Say why in a few words.',
    asn: 'Try one example with easy numbers. Is it true? Then try to find an example where it is false.',
    est: 'Do not calculate yet. Is the answer nearer the small end or the big end? Slide to your best guess first.'
  };
  var NEXTMOVE = {
    odd: 'Check one thing at a time. Write down what is the <b>same</b> for three of them. The one that is left is your answer.',
    cross: 'Test one option with the numbers in the question. Does it fit? If not, cross it out. Then test the next one.',
    asn: '<b>Always</b>: true for every example. <b>Never</b>: false for every example. <b>Sometimes</b>: you found one true example and one false example.'
  };
  function firstMove(s) {
    if (s.help) return s.help;
    if (NEWMOVE[s.k]) return NEWMOVE[s.k];
    if (s.k === 'machine') return 'Feed in 0 first: the output is what the rule adds at the end. Then feed in 1 and see how much the output changes.';
    var q = plain(s.q), pts = q.match(/\(\s*[−-]?\d+(?:\.\d+)?\s*,\s*[−-]?\d+(?:\.\d+)?\s*\)/g);
    if (s.k === 'exit' && pts && pts.length >= 2) return 'Write the two points down and label them: point 1 is ' + pts[0] + ', point 2 is ' + pts[1] + '. Then do one step at a time.';
    if (s.k === 'number' || s.k === 'poll') {
      if (pts && pts.length >= 2) return 'Write the two points down and label them: point 1 is ' + pts[0] + ', point 2 is ' + pts[1] + '.';
      // the table and graph moves are slope moves: only offer them when the question is about slope
      var slopeQ = /slope|steep|\brate\b|\brise\b|\brun\b/i.test(q);
      if (slopeQ && s.fig && s.fig.kind === 'table') return 'Look at two rows of the table that are next to each other. How much does x change? How much does y change?';
      if (slopeQ && s.fig && s.fig.kind === 'graph') return 'Find two points on the line that sit exactly on grid corners. Write them down.';
    }
    if (s.k === 'number') return 'Write down each number in the question and what it is: a start, a change, or a total? The answer is one number.';
    if (s.k === 'poll') return s.ans == null ? 'There is no wrong answer here. Pick the one that is closest to what you think.' : 'Cover the options. Say your own answer first. Then look for the option that matches it.';
    return 'Start with what you know for sure. One short sentence is enough to begin. You can add more after.';
  }
  function pieces(q) {
    // split after . ? ! or : when a new sentence starts (a capital, a bracket or a $ follows); "1.5 cm" stays whole
    // a label such as "Warm-up 1 of 3." is not a piece, and a short question (under three pieces) is already in pieces
    var t = plain(q).replace(/^\s*Warm-up \d+ of \d+\.\s*/i, ''), parts = [], from = 0, m, rx = /[.?!]\s+(?=[A-Z("“$])/g;
    while ((m = rx.exec(t))) { parts.push(t.slice(from, m.index + 1).trim()); from = m.index + m[0].length; }
    parts.push(t.slice(from).trim()); parts = parts.filter(Boolean);
    // never cut through the middle of something a character says
    if (parts.some(function (p) { return (p.match(/["“”]/g) || []).length % 2; })) return null;
    return parts.length >= 3 && parts.length <= 6 ? parts : null;
  }
  // the worked example a question follows: the first example of the run of examples before it
  function exampleFor(L, idx) {
    var i = idx - 1, S = L.slides;
    while (i >= 0 && S[i].k !== 'ex') i--;
    if (i < 0) return null;
    while (i > 0 && S[i - 1].k === 'ex') i--;
    return S[i];
  }
  function textFor(L, idx) { for (var i = idx - 1; i >= 0; i--) if (L.slides[i].k === 'text' && (L.slides[i].points || []).length) return L.slides[i]; return null; }
  function frameFor(s) {
    var ph = String(s.ph || '');
    if (/\.\.\.|…/.test(ph) && ph.length > 8) return ph;
    return 'I think ... because ...';
  }
  /* ladder(lesson, slide index) -> { steps: [{ h, html, frame }], words: [ids] }  (html is safe to insert) */
  function ladder(L, idx, lang) {
    var s = L.slides[idx]; if (!s || !s.id || s.warm || s.k === 'conf') return null;
    if (['number', 'poll', 'open', 'exit', 'machine'].indexOf(s.k) < 0 && !NEWMOVE[s.k]) return null;
    var steps = [], qtext = plain(s.q) + ' ' + (s.opts || []).map(plain).join(' '), words = termsIn(qtext).slice(0, 4);
    // step 1: understand it
    var h1 = '';
    if (words.length) h1 += '<p class="sg-k">Key words</p><ul class="sg-words">' + words.map(function (id) { var t = BY[id], tr = lang && t.tr[lang]; return '<li><b>' + esc(t.id) + '</b>' + (tr ? ' <span class="sg-tr" lang="' + lang + '"' + (lang === 'ar' ? ' dir="rtl"' : '') + '>' + esc(tr) + '</span>' : '') + ': ' + esc(t.d) + '</li>'; }).join('') + '</ul>';
    var pc = pieces(s.q);
    if (pc) h1 += '<p class="sg-k">The question in pieces</p><ul class="sg-pieces">' + pc.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>';
    h1 += '<p class="sg-k">First move</p><p>' + fmt(firstMove(s)) + '</p>';
    steps.push({ h: 'Understand the question', html: h1 });
    // step 2: one like it
    if (s.k === 'exit') {
      steps.push({ h: 'Look back', html: '<p>This is your exit ticket: show what you can do on your own. Use ◀ Back to look at today\'s examples, then come back.</p>' });
    } else if (NEXTMOVE[s.k]) {
      // these three are thinking tasks, not "do the same as the example": the nearest worked example is usually about something else
      steps.push({ h: 'One more move', html: '<p>' + NEXTMOVE[s.k] + '</p>' });
    } else if (s.k !== 'poll' || s.ans != null || NEWMOVE[s.k]) {
      var ex = exampleFor(L, idx), tx_ = ex ? null : textFor(L, idx);
      if (ex) {
        steps.push({ h: 'See one like it', html: '<p class="sg-k">Worked example</p><p class="sg-exq">' + fmt(ex.q || ex.title) + '</p><ol class="sg-ex">' + (ex.steps || []).map(function (x) { x = typeof x === 'string' ? { t: x } : x || {}; return '<li>' + filled(x.t) + (x.eq ? '<span class="sg-eq">' + filled(x.eq) + '</span>' : '') + '</li>'; }).join('') + '</ol><p>Now do the same moves with the numbers in <b>your</b> question.</p>' });
      } else if (tx_) {
        steps.push({ h: 'The idea you need', html: '<p class="sg-k">' + fmt(tx_.title || 'From this lesson') + '</p><ul class="sg-pieces">' + tx_.points.map(function (p) { return '<li>' + fmt(p) + '</li>'; }).join('') + '</ul>' + (tx_.note ? '<p>' + fmt(tx_.note) + '</p>' : '') });
      } else if (s.k === 'machine') {
        steps.push({ h: 'See one like it', html: '<p>A machine gives 0 → 3, 1 → 5, 2 → 7.</p><ol class="sg-ex"><li>At 0 the output is <b>3</b>: the rule ends with + 3.</li><li>Each time the input goes up 1, the output goes up <b>2</b>: the rule starts with 2x.</li><li>Rule: <b>2x + 3</b>. Check: 2(2) + 3 = 7 ✓</li></ol>' });
      }
    }
    // step 3: set it up
    if (s.k === 'open' || s.k === 'exit') {
      var fr = frameFor(s);
      steps.push({ h: 'Start writing', frame: fr, html: '<p class="sg-k">Sentence starter</p><p class="sg-frame">' + esc(fr) + '</p>' });
    } else if ((s.k === 'number' || s.k === 'est' || s.k === 'mistake' || s.k === 'order') && s.hint && s.hint !== s.help) {
      steps.push({ h: 'Set it up', html: '<p>' + fmt(s.hint) + '</p><p>' + (s.k === 'mistake' ? 'Now tap the line that is wrong.' : s.k === 'order' ? 'Now put the steps in order.' : 'Work it out on paper, then type your answer.') + '</p>' });
    } else if (s.k === 'poll' && s.ans != null && (s.opts || []).length >= 3) {
      var w = -1; for (var k = s.opts.length - 1; k >= 0; k--) if (k !== s.ans) { w = k; break; }
      steps.push({ h: 'Cross one out', html: '<p>It is <b>not ' + 'ABCDEFGH'.charAt(w) + '</b>: ' + fmt(s.opts[w]) + '.</p><p>Now choose from the others. Check your choice with the numbers.</p>' });
    } else if (s.k === 'machine') {
      steps.push({ h: 'Test your rule', html: '<p>Pick an input you already fed in. Put it into your rule. Do you get the same output as the machine? If not, change one number in your rule.</p>' });
    }
    return { steps: steps, words: words };
  }

  window.SFA_SCAFFOLD = { TERMS: TERMS, BY: BY, LANGS: LANGS, PICS: PICS, scan: scan, termsIn: termsIn, lessonText: lessonText, ladder: ladder, fmt: fmt, filled: filled, filledPlain: filledPlain, exampleFor: exampleFor };

  /* =====================================================================================================
     Everything below runs only on a lesson page (sfa-lesson.js has loaded and published its API).
     ===================================================================================================== */
  var A = window.SFA_LESSON_API; if (!A || !SFA.store) return;
  var MODE = A.MODE, LID = A.LID, store = SFA.store;
  var lang = store.get('sg.lang', 'ar') || 'ar', fs = +store.get('sg.fs', 0) || 0;
  var help = store.get('les.help.' + LID, {}) || {};
  function saveHelp() { store.set('les.help.' + LID, help); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  /* ---------------- tap-to-define ---------------- */
  // headings and the small label above a question stay clean: a dotted line under a title reads as decoration, and the same word is in the text below
  var SKIP = 'button,a,input,textarea,select,svg,script,style,h1,h2,h3,.kick,.kicker,.sg-term,.sg-ui,.blk,.wall,.spot,.names,.timer,.gbtn,.codebox,[contenteditable]';
  function annotate(root) {
    var have = {}; [].forEach.call(root.querySelectorAll('.sg-term'), function (e) { have[e.getAttribute('data-term')] = 1; });
    var ctx = root.textContent, tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = tw.nextNode())) { var p = n.parentElement; if (p && !p.closest(SKIP) && /[a-z]{3}/i.test(n.nodeValue)) nodes.push(n); }
    nodes.forEach(function (node) {
      var hits = scan(node.nodeValue, ctx).filter(function (h) { if (have[h.id]) return false; have[h.id] = 1; return true; });
      for (var i = hits.length - 1; i >= 0; i--) {
        var h = hits[i], mid = node.splitText(h.i); mid.splitText(h.len);
        var sp = document.createElement('span'); sp.className = 'sg-term'; sp.setAttribute('data-term', h.id); sp.setAttribute('tabindex', '0'); sp.setAttribute('role', 'button');
        sp.setAttribute('aria-label', mid.nodeValue + ': tap for the meaning');
        mid.parentNode.replaceChild(sp, mid); sp.appendChild(mid);
      }
    });
  }
  var pop = null, popFor = null;
  function closePop() { if (pop) { pop.remove(); pop = null; popFor = null; } }
  function langSel(onPick) {
    var sel = el('select', 'sg-lang'); sel.setAttribute('aria-label', 'My language');
    LANGS.forEach(function (l) { var o = el('option', '', esc(l[1])); o.value = l[0]; if (l[0] === lang) o.selected = true; sel.appendChild(o); });
    sel.onchange = function () { lang = sel.value; store.set('sg.lang', lang); onPick(); };
    return sel;
  }
  function trLine(t) { return '<span class="sg-tr" lang="' + lang + '"' + (lang === 'ar' ? ' dir="rtl"' : '') + '>' + esc(t.tr[lang] || '') + '</span>'; }
  function card(t, big) {
    var c = el('div', 'sg-card');
    // the word in the student's own language sits right beside the English word: for many students it is the whole answer
    var hd = el('div', 'sg-cardh'); hd.appendChild(el('b', '', esc(t.id))); if (t.tr[lang]) hd.appendChild(el('span', 'sg-trh', trLine(t)));
    if (canSpeak) { var sb = el('button', 'sg-mini', '🔊'); sb.type = 'button'; sb.setAttribute('aria-label', 'Hear it'); sb.onclick = function (e) { e.stopPropagation(); say([t.id + '. ' + t.d + (t.ex ? ' For example: ' + t.ex : '')]); }; hd.appendChild(sb); }
    c.appendChild(hd);
    var body = el('div', 'sg-cardb'), txt = el('div');
    txt.appendChild(el('p', 'sg-def', esc(t.d)));
    if (t.ex) txt.appendChild(el('p', 'sg-exl', '<span>Example</span> ' + esc(t.ex)));
    body.appendChild(txt);
    if (t.pic && PICS[t.pic]) body.appendChild(el('div', 'sg-picw', PICS[t.pic]()));
    c.appendChild(body);
    return c;
  }
  function openPop(span) {
    var t = BY[span.getAttribute('data-term')]; if (!t) return;
    if (popFor === span) return closePop();
    closePop(); popFor = span;
    pop = el('div', 'sg-pop sg-ui'); pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Meaning of ' + t.id);
    function fill() {
      pop.innerHTML = ''; pop.appendChild(card(t));
      var foot = el('div', 'sg-popf'); foot.appendChild(el('span', '', 'My language'));
      foot.appendChild(langSel(fill));
      var x = el('button', 'sg-mini', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.onclick = closePop; foot.appendChild(x);
      pop.appendChild(foot);
    }
    fill(); document.body.appendChild(pop);
    var r = span.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight, vw = innerWidth, vh = innerHeight;
    if (vw > 620) {
      var left = Math.max(8, Math.min(vw - pw - 8, r.left + r.width / 2 - pw / 2)), top = r.bottom + 8;
      if (top + ph > vh - 8) top = Math.max(8, r.top - ph - 8);
      pop.style.left = left + 'px'; pop.style.top = top + 'px';
    } else pop.classList.add('sheet');
    if (MODE === 'student') { help._words = help._words || {}; help._words[t.id] = (help._words[t.id] || 0) + 1; saveHelp(); }
  }
  document.addEventListener('click', function (e) {
    var sp = e.target.closest && e.target.closest('.sg-term');
    if (sp) { e.preventDefault(); e.stopPropagation(); return openPop(sp); }
    if (pop && !pop.contains(e.target)) closePop();
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closePop(); closeSheet(); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('sg-term')) { e.preventDefault(); e.stopPropagation(); openPop(e.target); }
  }, true);

  /* ---------------- read aloud ---------------- */
  var speaking = false, sayTok = 0, readChip = null;
  // chip labels: the full words on a laptop, one short word on a phone so the tools fit on one row
  function two(ic, wide, narrow) { return ic + ' <span class="sg-w">' + wide + '</span><span class="sg-n">' + narrow + '</span>'; }
  function readLbl(on) { if (readChip) readChip.innerHTML = on ? two('⏹', 'Stop reading', 'Stop') : two('🔊', 'Read to me', 'Read'); }
  function speakable(s) {
    return String(s).replace(/✓/g, ' correct. ').replace(/✗/g, ' not correct. ')
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}️]/gu, ' ')
      .replace(/₁/g, ' 1').replace(/₂/g, ' 2').replace(/\bmx\b/g, 'm x')
      .replace(/(\d)\s*\/\s*(\d)/g, '$1 over $2')
      .replace(/[−-](?=[\d(a-z])/g, function (m, i, all) { return i === 0 || /[\s(=÷×+−,:≤≥<>]/.test(all.charAt(i - 1)) ? ' negative ' : m; })
      .replace(/\s[−–]\s/g, ' minus ').replace(/−/g, ' minus ')
      .replace(/÷/g, ' divided by ').replace(/×/g, ' times ').replace(/\+/g, ' plus ').replace(/=/g, ' equals ')
      .replace(/≤/g, ' is less than or equal to ').replace(/≥/g, ' is greater than or equal to ').replace(/</g, ' is less than ').replace(/>/g, ' is greater than ')
      .replace(/→/g, ', then ').replace(/[·★▶◀]/g, ', ').replace(/\s+/g, ' ').trim();
  }
  function voice() { var v = speechSynthesis.getVoices().filter(function (x) { return /^en[-_]/i.test(x.lang); }); return v.filter(function (x) { return /en[-_]US/i.test(x.lang) && x.localService; })[0] || v[0] || null; }
  function stopSay() { sayTok++; speaking = false; if (canSpeak) speechSynthesis.cancel(); [].forEach.call(document.querySelectorAll('.sg-reading'), function (e) { e.classList.remove('sg-reading'); }); if (readChip) { readLbl(false); readChip.setAttribute('aria-pressed', 'false'); } }
  // items: strings, or [element, text] pairs (the element is highlighted while its text is read)
  function say(items) {
    if (!canSpeak) return;
    stopSay(); var tok = ++sayTok, i = 0; speaking = true;
    (function next() {
      [].forEach.call(document.querySelectorAll('.sg-reading'), function (e) { e.classList.remove('sg-reading'); });
      if (tok !== sayTok) return;
      if (i >= items.length) { speaking = false; if (readChip) { readLbl(false); readChip.setAttribute('aria-pressed', 'false'); } return; }
      var it = items[i++], node = Array.isArray(it) ? it[0] : null, text = speakable(Array.isArray(it) ? it[1] : it);
      if (!text) return next();
      var u = new SpeechSynthesisUtterance(text), v = voice(); if (v) u.voice = v; u.lang = v ? v.lang : 'en-US'; u.rate = 0.88;
      if (node) node.classList.add('sg-reading');
      u.onend = u.onerror = function () { if (tok === sayTok) next(); };
      speechSynthesis.speak(u);
    })();
  }
  function blockText(e) {
    var c = e.cloneNode(true);
    [].forEach.call(c.querySelectorAll('input,textarea'), function (i) { i.replaceWith(document.createTextNode(' blank ')); });
    [].forEach.call(c.querySelectorAll('.blk.mt'), function (i) { i.replaceWith(document.createTextNode(' blank ')); });
    [].forEach.call(c.querySelectorAll('button:not(.opt),select,svg,.sg-popf,.exyou,.pc,.names'), function (i) { i.remove(); });
    return c.textContent;
  }
  function readSlide() {
    var s = curSlide(); if (!s) return;
    var sel = '.kick,h1,h2,.q,.sub,.exq,.pts>li,.note,.opt,.xqq,.fb,.reveal,.sg-step';
    var items = [].filter.call(s.querySelectorAll(sel), function (e) { return e.offsetParent !== null && !e.closest('.lobby,.more .xdone'); }).map(function (e) {
      var t = blockText(e); if (e.classList.contains('opt')) t = 'Option ' + t.trim().charAt(0) + '. ' + t.trim().slice(1); return [e, t];
    });
    if (!items.length) return;
    say(items);
    readLbl(true); readChip.setAttribute('aria-pressed', 'true');
  }

  /* ---------------- the ladder on the slide ---------------- */
  function curSlide() { var all = document.querySelectorAll('.deck > .slide:not(.out)'); return all.length ? all[all.length - 1] : null; }
  function curIndex() { var c = document.querySelector('.ltop .count'), m = c && /^(\d+)\s*\//.exec(c.textContent.trim()); return m ? +m[1] - 1 : -1; }
  function mineOf(id) { var m = A.mine && A.mine(); return m ? m[id] : null; }
  function attachLadder(slideEl, L, idx) {
    var s = L.slides[idx], lad = ladder(L, idx, lang); if (!lad || !lad.steps.length) return;
    var anchor = slideEl.querySelector('.ans'); if (!anchor) { var o = slideEl.querySelector('.opts'); anchor = o && (o.nextElementSibling || o); } if (!anchor) anchor = slideEl.lastElementChild; if (!anchor) return;
    var box = el('div', 'sg-ladder sg-ui'), btn = el('button', 'btn small sg-helpbtn'), panel = el('div', 'sg-steps'), shown = 0;
    btn.type = 'button'; panel.hidden = true; box.appendChild(btn); box.appendChild(panel); anchor.after(box); slideEl.classList.add('sg-on');
    function label() { var seen = (help[s.id] && help[s.id].n) || 0; btn.textContent = panel.hidden ? (seen ? '🪜 Open my help again' : '🪜 Help me start') : '🪜 Hide help'; }
    function draw() {
      panel.innerHTML = '';
      lad.steps.slice(0, shown).forEach(function (st, i) {
        var d = el('div', 'sg-step'); d.appendChild(el('p', 'sg-h', '<span>' + (i + 1) + '</span> ' + esc(st.h))); d.appendChild(el('div', 'sg-body', st.html));
        if (st.frame) {
          var fb = el('button', 'btn small', '✍️ Put this in my answer box'); fb.type = 'button';
          fb.onclick = function () {
            var ta = slideEl.querySelector('.ans textarea'); if (!ta) return;
            if (ta.value.trim() && ta.value.trim() !== st.frame) { if (SFA.toast) SFA.toast('Your box already has writing in it. Copy the starter yourself if you want it.'); return; }
            ta.value = st.frame; ta.dataset.typed = '1'; ta.dispatchEvent(new Event('input', { bubbles: true })); ta.focus();
            var k = st.frame.search(/\.\.\.|…/); if (k >= 0) try { ta.setSelectionRange(k, k + (st.frame.charAt(k) === '…' ? 1 : 3)); } catch (e) { }
            help[s.id] = help[s.id] || { n: shown, at: Date.now() }; help[s.id].frame = true; saveHelp();
          };
          d.appendChild(fb);
        }
        panel.appendChild(d);
      });
      var row = el('div', 'sg-row');
      if (shown < lad.steps.length) { var nb = el('button', 'btn small primary', 'More help ▶ (step ' + (shown + 1) + ' of ' + lad.steps.length + ')'); nb.type = 'button'; nb.onclick = function () { open(shown + 1); }; row.appendChild(nb); }
      row.appendChild(el('span', 'sg-fine', shown < lad.steps.length ? 'Try it now, or take one more step.' : 'That is all the help. Have a go: a wrong answer is fine.'));
      panel.appendChild(row);
      panel.appendChild(el('p', 'sg-fine', 'Using help is a smart move. It never changes your score.'));
      annotate(panel);
    }
    function open(n) {
      shown = Math.max(1, Math.min(lad.steps.length, n)); panel.hidden = false; slideEl.classList.add('sg-open');
      var rec = help[s.id] = help[s.id] || { n: 0, at: Date.now() }; if (shown > rec.n) { rec.n = shown; rec.of = lad.steps.length; saveHelp(); }
      draw(); label();
      setTimeout(function () { var last = panel.querySelectorAll('.sg-step'); last = last[last.length - 1]; if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 60);
    }
    btn.onclick = function () { if (!panel.hidden) { panel.hidden = true; slideEl.classList.remove('sg-open'); label(); return; } open(Math.max(1, (help[s.id] && help[s.id].n) || 1)); };
    box._sync = function () {
      var a = mineOf(s.id); box.hidden = !!(a && a.correct === true) && panel.hidden;
      // the player's own one-line help button gives way to the ladder
      [].forEach.call(slideEl.querySelectorAll('button'), function (b) { if (!b.closest('.sg-ui') && !b.closest('.more') && /Help me start/.test(b.textContent)) b.hidden = true; });
    };
    label(); box._sync();
  }

  /* ---------------- top-bar tools (students) ---------------- */
  var sheet = null;
  function closeSheet() { if (sheet) { sheet.remove(); sheet = null; } }
  function wordSheet() {
    closeSheet(); closePop();
    var L = A.LES(), ids = termsIn(lessonText(L));
    sheet = el('div', 'sg-sheet sg-ui'); var inner = el('div', 'sg-sheetin'); sheet.appendChild(inner);
    sheet.onclick = function (e) { if (e.target === sheet) closeSheet(); };
    function fill() {
      inner.innerHTML = '';
      var hd = el('div', 'sg-sheeth'); hd.appendChild(el('h2', '', '📖 Words in this lesson'));
      var r = el('div', 'sg-popf'); r.appendChild(el('span', '', 'My language')); r.appendChild(langSel(fill));
      var x = el('button', 'btn small', 'Close'); x.type = 'button'; x.onclick = closeSheet; r.appendChild(x); hd.appendChild(r); inner.appendChild(hd);
      inner.appendChild(el('p', 'sg-fine', 'In the slides, tap any word with a dotted line under it to see this card.'));
      var g = el('div', 'sg-grid'); ids.forEach(function (id) { g.appendChild(card(BY[id])); }); inner.appendChild(g);
    }
    fill(); document.body.appendChild(sheet);
  }
  function applyFs() { document.body.classList.remove('sg-fs1', 'sg-fs2'); if (fs) document.body.classList.add('sg-fs' + fs); }
  function tools() {
    var chips = document.querySelector('.ltop .chips'); if (!chips || chips.querySelector('.sg-chip')) return;
    function chip(txt, title, fn) { var b = el('button', 'chip sg-chip sg-ui', txt); b.type = 'button'; b.title = title; b.onclick = fn; chips.appendChild(b); return b; }
    if (canSpeak) { readChip = chip(two('🔊', 'Read to me', 'Read'), 'Read this slide aloud', function () { if (speaking) stopSay(); else readSlide(); }); readChip.setAttribute('aria-pressed', 'false'); }
    var fsChip = chip('', 'Make the slide text bigger', function () { fs = (fs + 1) % 3; store.set('sg.fs', fs); applyFs(); nm(); });
    function nm() { fsChip.innerHTML = fs === 0 ? two('<b>A</b>', 'Text size', 'Size') : fs === 1 ? two('<b>A+</b>', 'Bigger text', 'Size') : two('<b>A++</b>', 'Biggest text', 'Size'); }
    nm();
    chip('📖 Words', 'The math words in this lesson, with meanings', wordSheet);
  }

  /* ---------------- keep up with the slide ---------------- */
  var lastSlide = null, queued = false, obs = null;
  function process() {
    queued = false;
    var L = A.LES && A.LES(), slideEl = curSlide(); if (!L || !slideEl) return;
    if (MODE === 'student') tools();
    var idx = curIndex(), s = L.slides[idx], fresh = slideEl !== lastSlide;
    if (fresh) { lastSlide = slideEl; closePop(); if (speaking) stopSay(); }
    try {
      if (fresh && s && slideEl.classList.contains('k-' + s.k)) {
        if (MODE === 'student') attachLadder(slideEl, L, idx);
        if (MODE === 'teach' && (s.opt || s.wedo) && !slideEl.querySelector('.sg-tag')) slideEl.insertBefore(el('p', 'sg-tag sg-ui', s.opt ? '⏭ Optional: skip this slide if time is short' : '🤝 We do: the class finishes this one together (pairs, then cold call)'), slideEl.firstChild);
        if (MODE === 'student' && s.k === 'end' && !slideEl.querySelector('.sg-endnote')) {
          var used = Object.keys(help).filter(function (k) { return k.charAt(0) !== '_' && help[k] && help[k].n; }).length;
          if (used) { var st = slideEl.querySelector('.st') || slideEl; st.appendChild(el('p', 'sub sg-endnote sg-ui', '🪜 You used the help ladder on <b>' + used + '</b> question' + (used === 1 ? '' : 's') + '. Good learners ask for help, then try.')); }
        }
      }
      var lad = slideEl.querySelector('.sg-ladder'); if (lad && lad._sync) lad._sync();
      annotate(slideEl);
    } catch (e) { if (window.console) console.warn('scaffold', e); }
    if (obs) obs.takeRecords();
  }
  function later() { if (queued) return; queued = true; setTimeout(process, 40); }   // a timer, not an animation frame: those stop in a hidden tab
  var tries = 0, wait = setInterval(function () {
    var main = document.querySelector('.lmain'), deck = document.querySelector('.deck');
    if (!deck) { if (++tries > 300) clearInterval(wait); return; }
    clearInterval(wait); applyFs();
    obs = new MutationObserver(later); obs.observe(main, { childList: true, subtree: true });
    process();
    // hidden tabs pause animation frames: catch up when the student comes back
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') { queued = false; later(); } else if (speaking) stopSay(); });
    window.addEventListener('pagehide', function () { if (canSpeak) speechSynthesis.cancel(); });
  }, 100);
})();
