# Write a readable script (filmN-script.md) from a film's beats.json, so the script always matches what is built.
# usage: python make_script.py f2 "heading line" "change 1" "change 2" ...
import json, re, sys
NM = {'marcus': 'MARCUS', 'pigeon': 'DOUG', 'voice': 'VOICE', 'anchor': 'CHIP', 'priya': 'PRIYA', 'dunmore': 'DUNMORE', 'zero': 'ZERO'}
SC = {'rails': 'The Rails', 'control': 'The control room', 'lift': 'The lift', 'pen': 'The goat pen', 'log': 'The exercise book', 'stairs': 'The stairs',
      'classroom': "Mr. Dunmore's classroom", 'news': "Chip's call", 'station': 'The station', 'bridge': 'The bridge'}
FX = {'roar': 'The Swapper screeches.', 'growl': 'Something growls in the dark.', 'spit': 'The llama spits. PTOO!', 'snatch': 'A Flipper snatches something. YOINK.',
      'drop': 'The track behind them falls away. CRASH!', 'launch': 'The cart rears up and throws him. WHOOPS!', 'launch2': 'The cart sets off from the wrong height and leaves the track. CLANG!',
      'goats': 'Marcus lands in the goat pen.', 'hook': 'A hook hauls the map away.', 'switch': 'A gloved hand pulls a lever. The third span swings down.',
      'rebuild': 'The cavern rebuilds itself behind them.', 'eat': 'Keith eats it.', 'ding': 'The cart rides on. DING.', 'walkback': 'They walk back through the tunnel, one post at a time.',
      'depart': 'The cart leaves station zero and rides the whole track. DING.', 'turn': 'A gloved hand turns the sign round.', 'chalk': 'A gloved hand chalks the floor number.'}
d, head, changes = sys.argv[1], sys.argv[2], sys.argv[3:]
b = json.load(open(d + '/beats.json', encoding='utf-8'))
words = sum(len(re.sub(r'\([^)]*\)', '', x.get('t', '')).split()) for x in b)
out = [head.replace('WORDS', str(words)), '']
clock = None
for x in b:
    if x.get('title'):
        out += ['', '**TITLE: %s%s**' % (x['title'], (' · ' + x['sub']) if x.get('sub') else ''), '']; continue
    if x.get('scene'): out += ['', '### ' + SC.get(x['scene'], x['scene']), '']; clock = None
    st = x.get('set') or {}; notes = []
    ck = st.get('clock')
    if ck:
        if len(ck) > 2 and ck[2]:
            if st.get('freeze'): notes.append('Freeze at 0:%02d.' % round(ck[1]))
        elif clock != ck[0]: notes.append('Clock on screen: %s 0:%02d.' % (ck[0], round(ck[1])))
        clock = ck[0]
    elif 'clock' in st: clock = None
    if st.get('stalker') and st['stalker'][0] < 980: notes.append('A loose red-eyed goat is watching.')
    if st.get('llama'): notes.append('A llama in a staff cap blocks the ledge.')
    if st.get('mites'): notes.append("Rust mites crawl from the old cart. Rust creeps up Marcus's shoes.")
    if st.get('bur') and st['bur'][3] > 0.5: notes.append('The Burrower is in the tunnel.')
    if st.get('swapper') and st['swapper'][3] > 0.5: notes.append('The Swapper is behind them.')
    if st.get('helmet'): notes.append('The helmet: ' + ' / '.join(st['helmet']) + '.')
    for f in x.get('fx') or []:
        if f['n'] in FX: notes.append(FX[f['n']])
    if notes: out += ['*' + ' '.join(notes) + '*', '']
    if x.get('t'):
        t = x['t']; m = re.match(r'\(([^)]*)\)\s*(.*)', t); dirn = ''
        if m: dirn = ' *(%s)*' % m.group(1); t = m.group(2)
        out += ['**%s:**%s %s' % (NM.get(x['s'], x['s'].upper()), dirn, t), '']
if changes: out += ['---', '', '## Notes', ''] + ['- ' + c for c in changes]
name = 'film' + d[1:] + '-script.md'
open(name, 'w', encoding='utf-8').write(re.sub(r'\n{3,}', '\n\n', '\n'.join(out)) + '\n')
print('wrote', name, words, 'words')
