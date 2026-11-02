# Build a Sandy Flats episode: voice every line, lip-sync, timing, and the page from a film's shell.
# usage: build.py TEMPLATE_FILM.html EPISODE_DIR OUT.html COO_SOURCE_FILM.html
import asyncio, base64, json, os, re, sys
import edge_tts
TPL, EPD, OUT, COOF = sys.argv[1:5]
CACHE = os.path.join(EPD, 'audio'); os.makedirs(CACHE, exist_ok=True)
# the cast's voices: Priya, Effie and Chip match the existing films; the others are the nearest matches found
VOICES = {
    'zero':    ('en-US-AnaNeural', '+25%', '+0Hz'),
    'priya':   ('en-US-EmmaNeural', '+3%', '+0Hz'),
    'effie':   ('en-GB-SoniaNeural', '-1%', '+2Hz'),
    'marcus':  ('en-US-AvaMultilingualNeural', '+25%', '+0Hz'),
    'dunmore': ('en-US-ChristopherNeural', '+8%', '-2Hz'),
    'anchor':  ('en-US-BrianNeural', '+5%', '+0Hz'),
    'one':     ('en-US-AndrewNeural', '+1%', '+8Hz'),
    'sam':     ('en-US-RogerNeural', '+1%', '-7Hz'),
}
FPS = 12
BPS = 48000 / 8
def spoken(t): return re.sub(r'\s{2,}', ' ', re.sub(r'\s*\([^)]*\)\s*', ' ', t)).strip()
def envelope(words, n):
    e = ['0'] * n
    for a, b in words:
        for f in range(int(a * FPS), int(b * FPS) + 1):
            if f < n and f % 3: e[f] = '1'
    return ''.join(e)

beats = json.load(open(os.path.join(EPD, 'beats.json'), encoding='utf-8'))
# Doug's own "Coo", from an earlier film
cs = open(COOF, encoding='utf-8').read()
cb = json.loads(re.search(r'var BEATS=(\[.*?\]);', cs).group(1))
csrc = json.loads(re.search(r'var AUDSRC=(\{.*?\});', cs).group(1))
coo = next(str(i) for i, b in enumerate(cb) if b.get('s') == 'pigeon' and str(i) in csrc and 'Coo' in b.get('t', ''))
COO = csrc[coo]

async def voice(i, who, text):
    fn = os.path.join(CACHE, '%03d.mp3' % i); meta = fn + '.json'
    key = json.dumps([who, text, VOICES[who]])
    if os.path.exists(meta) and json.load(open(meta))['key'] == key:
        return open(fn, 'rb').read(), json.load(open(meta))['words']
    v, r, p = VOICES[who]
    audio, words = b'', []
    async for ch in edge_tts.Communicate(text, v, rate=r, pitch=p, boundary='WordBoundary').stream():
        if ch['type'] == 'audio': audio += ch['data']
        elif ch['type'] == 'WordBoundary': words.append((ch['offset'] / 1e7, (ch['offset'] + ch['duration']) / 1e7))
    open(fn, 'wb').write(audio); json.dump({'key': key, 'words': words}, open(meta, 'w'))
    return audio, words

async def main():
    AUD, SRC, DUR = {}, {}, []
    sem = asyncio.Semaphore(6)
    async def one(i, b):
        async with sem: return i, await voice(i, b['s'], spoken(b['t']))
    jobs = [one(i, b) for i, b in enumerate(beats) if b.get('t') and b.get('s') in VOICES]
    got = dict(await asyncio.gather(*jobs))
    for i, b in enumerate(beats):
        if b.get('title'): DUR.append(b.get('d', 3.0)); continue
        if b.get('s') == 'pigeon':
            SRC[str(i)] = COO; d = 1.1; AUD[str(i)] = {'d': d, 'e': '0110110'}
        elif i in got:
            audio, words = got[i]; d = round(len(audio) / BPS, 2)
            SRC[str(i)] = 'data:audio/mpeg;base64,' + base64.b64encode(audio).decode()
            AUD[str(i)] = {'d': d, 'e': envelope(words, int(d * FPS) + 1)}
        else:
            d = None
        DUR.append(round(max(b.get('d') or 0, (d + 0.45 + b.get('hold', 0)) if d else 0) or 2.0, 2))
    ep = open(os.path.join(EPD, 'episode.js'), encoding='utf-8').read()
    ep = ep.replace('__DUR__', json.dumps(DUR)).replace('__BEATS__', json.dumps(beats, ensure_ascii=False, indent=0))
    s = open(TPL, encoding='utf-8').read()
    a = s.index('var DUR=[')
    m = re.search(r'var BEATS=EP\.BEATS, AUD=\{.*?\}, SC=EP\.SCENES, FX=EP\.FX\|\|\{\};', s, re.S)
    s = s[:a] + ep + '\nvar BEATS=EP.BEATS, AUD=' + json.dumps(AUD, separators=(',', ':')) + ', SC=EP.SCENES, FX=EP.FX||{};' + s[m.end():]
    s = re.sub(r'<script>var AUDSRC=\{.*?\};</script>', lambda _: '<script>var AUDSRC=' + json.dumps(SRC, separators=(',', ':')) + ';</script>', s, count=1, flags=re.S)
    s = re.sub(r'\}\)\(\{"54": \{"cut": 1\}[^)]*\}\);', '})({});', s, count=1)   # the old film's review patches don't apply
    meta = json.load(open(os.path.join(EPD, 'meta.json'), encoding='utf-8'))
    old = {'<title>One Alone</title>': '<title>%s</title>' % meta['title'],
           '<div class="kicker">The Undefined Saga · Film 5½</div>': '<div class="kicker">%s</div>' % meta['kicker'],
           '<h1>One Alone</h1>': '<h1>%s</h1>' % meta['title'],
           'aria-label="Animated cartoon: One Alone"': 'aria-label="Animated cartoon: %s"' % meta['title'],
           'aria-label="Play One Alone"><span>▶ Play One Alone</span>': 'aria-label="Play %s"><span>▶ Play %s</span>' % (meta['title'], meta['title'])}
    for k, v in old.items():
        assert s.count(k) == 1, k; s = s.replace(k, v)
    s = re.sub(r'(<header>.*?<h1>.*?</h1>\s*<p>).*?(</p>)', lambda m: m.group(1) + meta['blurb'] + m.group(2), s, count=1, flags=re.S)
    s = re.sub(r'<p class="note">.*?</p>', '<p class="note">' + meta['note'] + '</p>', s, count=1, flags=re.S)
    open(OUT, 'w', encoding='utf-8', newline='').write(s)
    print('beats', len(beats), 'voiced', len(SRC), 'length %d:%02d' % divmod(int(sum(DUR)), 60), 'bytes', len(s))
asyncio.run(main())
