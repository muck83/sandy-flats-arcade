/* 🔠 The Big Board: a class crossword at the start of a live lesson. Loaded by sfa-lesson.js when the teacher starts one.

   Hangman + Wheel of Fortune + a crossword. Every student who is here gets their own long word (8 to 14 letters) in one
   themed crossword. Right answers earn letter guesses (a vowel costs two): five two-step integer warm-ups, then spiral
   review from the lessons already taught, easier to harder in four levels (levels 3 and 4 right first time earn two). When a student solves their word it fills in on the class crossword, and its letters show up for free in every
   word that crosses it. If every active student finds their word, the whole class gets a big celebration.

   How it stays in sync through the Sheet (the same way as the Lane Clash): every screen builds the identical crossword
   from the theme, a seed and the number of words, which ride in the live state (counts zbs). The console keeps who has
   which word (the spotlight, spot.q "zboard": "A:" fingerprints of the students in word order, "#N:" their first names)
   and which words are solved (counts zbw0.., 13 words to a number). Students send one running row (q "zboardx1": the
   results script counts ids ending x1 as go-further extras, so this never counts as a lesson answer). */
(function () {
  'use strict';
  var A = window.SFA_LESSON_API, SFA = window.SFA;
  if (!A || !SFA) return;
  var H = A.H, el = A.el, esc = SFA.esc;
  var QID = 'zboardx1', SPARE = 3, MAXW = 39, PUSH_MS = 1500, VOWELS = 'AEIOU';

  /* ---------------- themes: [WORD, clue] ---------------- */
  var THEMES = [
    { id: 'poke', name: 'Pokémon', e: '⚡', words: [
      ['CHARMANDER', 'Fire lizard starter with a flame on the tip of its tail'], ['BULBASAUR', 'Grass starter with a bulb on its back'], ['SQUIRTLE', 'Water turtle starter from Kanto'],
      ['JIGGLYPUFF', 'Pink balloon Pokémon whose song sends everyone to sleep'], ['GYARADOS', 'Angry sea serpent that evolves from a floppy fish'], ['MAGIKARP', 'Fish whose famous move is Splash'],
      ['DRAGONITE', 'Friendly orange dragon that evolves from Dragonair'], ['CHARIZARD', 'Fire and Flying dragon that evolves from Charmeleon'], ['BLASTOISE', 'Turtle with water cannons on its shell'],
      ['GROWLITHE', 'Loyal fire puppy'], ['SLOWPOKE', 'Very, very slow pink Pokémon'], ['GRENINJA', 'Ninja frog, the final form of Froakie'],
      ['GARCHOMP', 'Land shark dragon from the Sinnoh region'], ['TOTODILE', 'Little blue crocodile starter from Johto'], ['LEGENDARY', 'Very rare Pokémon like Mewtwo and Rayquaza are called this'],
      ['TEAMROCKET', 'Jessie, James and Meowth\'s gang of villains'], ['POKEMONCENTER', 'Where Nurse Joy heals your team'], ['ASHKETCHUM', 'Trainer from Pallet Town who has Pikachu'],
      ['PALLETTOWN', 'Ash\'s home town in Kanto'], ['PROFESSOROAK', 'Kanto professor who gives you your first Pokémon'], ['EVOLUTION', 'When a Pokémon changes into a stronger form'],
      ['GYMLEADER', 'Trainer you beat to win a badge'], ['RAYQUAZA', 'Green sky dragon legendary from Hoenn'], ['ALAKAZAM', 'Psychic Pokémon that holds two spoons'],
      ['ARCANINE', 'Big fire dog that evolves from Growlithe'], ['BUTTERFREE', 'Butterfly that evolves from Metapod'], ['CATERPIE', 'Green bug that evolves into Metapod'],
      ['WIGGLYTUFF', 'Pink balloon that evolves from Jigglypuff'], ['SANDSHREW', 'Ground-type mouse that curls into a ball'], ['NIDOKING', 'Purple Poison and Ground king with a horn'],
      ['VENUSAUR', 'Final form of Bulbasaur, with a giant flower on its back'], ['CHARMELEON', 'Middle form between Charmander and Charizard'], ['WARTORTLE', 'Middle form between Squirtle and Blastoise'],
      ['PIDGEOTTO', 'Bird that evolves from Pidgey'], ['TYRANITAR', 'Huge Rock and Dark monster that evolves from Pupitar'], ['METAGROSS', 'Steel and Psychic Pokémon with four legs'],
      ['VAPOREON', 'Water-type evolution of Eevee'], ['ELITEFOUR', 'The four strongest trainers you face before the Champion'], ['THUNDERBOLT', 'Pikachu\'s famous electric move'],
      ['FLAMETHROWER', 'Fire move that blasts a stream of flame'], ['HYDROPUMP', 'Powerful Water move that blasts a huge jet'], ['SOLARBEAM', 'Grass move that charges up with sunlight first'],
      ['MASTERBALL', 'Purple ball that never fails to catch'], ['SHINYPOKEMON', 'A rare Pokémon with different colours from usual']] },
    { id: 'sport', name: 'Sport and football', e: '⚽', words: [
      ['GOALKEEPER', 'The only player allowed to use their hands in the box'], ['DEFENDER', 'Player whose job is to stop the other team scoring'], ['MIDFIELDER', 'Player in the middle of the pitch, between attack and defence'],
      ['HATTRICK', 'Three goals by one player in one match'], ['CHAMPIONS', 'Winners of the league'], ['MARATHON', 'A running race of about 42 km'],
      ['OLYMPICS', 'Games held every four years, with five rings'], ['FREEKICK', 'Awarded to a team after a foul'], ['SUBSTITUTE', 'Player who comes on from the bench'],
      ['PENALTYKICK', 'Shot from the spot, 11 metres out'], ['WORLDCUP', 'Football\'s biggest tournament, every four years'], ['YELLOWCARD', 'A caution from the referee'],
      ['CORNERKICK', 'Restart taken from the corner flag'], ['BICYCLEKICK', 'Overhead kick with your back to the goal'], ['SCOREBOARD', 'Shows the score at the ground'],
      ['TEAMCAPTAIN', 'Player who wears the armband'], ['TOUCHLINE', 'The side line of a football pitch'], ['CROSSBAR', 'The top bar of the goal'],
      ['GOALPOSTS', 'The two upright parts of the goal'], ['HALFTIME', 'The break in the middle of a match'], ['EXTRATIME', '30 more minutes when a knockout match is level'],
      ['SHOOTOUT', 'Penalties taken one by one to settle a draw'], ['LIONELMESSI', 'Argentina\'s captain when they won the 2022 World Cup'], ['KYLIANMBAPPE', 'French forward who scored a hat-trick in the 2022 World Cup final'],
      ['ERLINGHAALAND', 'Norwegian goal machine at Manchester City'], ['MOHAMEDSALAH', 'Egyptian star forward at Liverpool'], ['BASKETBALL', 'Hoops and a bouncing orange ball'],
      ['VOLLEYBALL', 'Hit the ball over a high net with your hands, no catching'], ['BADMINTON', 'Racket sport played with a shuttlecock'], ['TABLETENNIS', 'Ping-pong'],
      ['SWIMMING', 'Racing in the pool'], ['GYMNASTICS', 'Flips, beams, bars and rings'], ['ATHLETICS', 'Track and field events'],
      ['WICKETKEEPER', 'Cricket player who crouches behind the stumps'], ['SKATEBOARD', 'Board on four wheels for tricks'], ['GOLDMEDAL', 'Prize for first place at the Olympics'],
      ['SILVERMEDAL', 'Prize for second place at the Olympics'], ['STOPWATCH', 'Times a race'], ['STRETCHING', 'What you do to loosen up your muscles before sport'],
      ['RELAYRACE', 'Team race where you pass a baton'], ['SPRINTER', 'Runner of short, fast races'], ['HIGHJUMP', 'Leap over a bar and land on a big mat'],
      ['LONGJUMP', 'Run up and leap as far as you can into a sandpit'], ['PREMIERLEAGUE', 'England\'s top football league'], ['REALMADRID', 'Spanish club that has won the most European Cups'],
      ['BARCELONA', 'Spanish club whose home is the Camp Nou'], ['MANCHESTER', 'English city with two big clubs, United and City']] },
    { id: 'games', name: 'Games and food', e: '🎮', words: [
      ['JOYSTICK', 'Stick you push to steer in an arcade game'], ['HIGHSCORE', 'The best score anyone has got'], ['SPEEDRUN', 'Finishing a game as fast as possible'],
      ['CONTROLLER', 'What you hold to play on a console'], ['CHOCOLATE', 'Sweet treat made from cocoa beans'], ['SHAWARMA', 'Meat sliced off a turning spit, wrapped in bread'],
      ['SMOOTHIE', 'Fruit blended into a thick drink'], ['MILKSHAKE', 'Cold drink of milk and ice cream'], ['CROISSANT', 'Flaky, crescent-shaped French pastry'],
      ['MINECRAFT', 'Block-building game with creepers'], ['FORTNITE', 'Battle royale game with a closing storm and building'], ['SUPERMARIO', 'Nintendo plumber in a red cap'],
      ['LEGENDOFZELDA', 'Nintendo series where Link saves Hyrule'], ['DONKEYKONG', 'Barrel-throwing ape from Nintendo'], ['MARIOKART', 'Nintendo racing game with banana peels and shells'],
      ['ANIMALCROSSING', 'Nintendo game where you build an island village'], ['PLAYSTATION', 'Sony\'s games console'], ['NINTENDOSWITCH', 'Console you can play on the TV or in your hands'],
      ['CHECKPOINT', 'Where you start again after losing a life'], ['MULTIPLAYER', 'A game with lots of players at once'], ['LEADERBOARD', 'Ranked list of the best scores'],
      ['POWERUPS', 'Items that make you stronger for a while'], ['BOSSBATTLE', 'The big fight at the end of a level'], ['CHESSBOARD', '64 black and white squares'],
      ['MONOPOLY', 'Board game with houses, hotels and going to jail'], ['SCRABBLE', 'Board game where you make words from letter tiles'], ['DOMINOES', 'Tiles with dots that you match end to end'],
      ['CHEESEBURGER', 'Burger with a slice of cheese'], ['PEPPERONI', 'Spicy sausage slices on a pizza'], ['SPAGHETTI', 'Long, thin pasta'],
      ['PANCAKES', 'Flat breakfast stack with syrup'], ['DOUGHNUTS', 'Ring-shaped fried sweet treats'], ['FRENCHFRIES', 'Long, thin fried potatoes'],
      ['WATERMELON', 'Big green fruit, red inside with black seeds'], ['STRAWBERRY', 'Red fruit with its seeds on the outside'], ['PINEAPPLE', 'Spiky tropical fruit'],
      ['CHICKENNUGGETS', 'Bite-size pieces of fried chicken'], ['ICECREAM', 'Cold, sweet scoops in a cone'], ['CUPCAKES', 'Small cakes with icing on top'],
      ['MARSHMALLOW', 'Fluffy sweet you toast over a fire'], ['BIRTHDAYCAKE', 'Has candles to blow out'], ['SANDWICH', 'Filling between two slices of bread'],
      ['OMELETTE', 'Beaten eggs fried in a pan and folded'], ['GAMEOVER', 'Words on the screen when you lose your last life'], ['SPACEINVADERS', 'Classic arcade game where you shoot rows of aliens']] },
    { id: 'maths', name: 'Maths words', e: '📐', words: [
      ['INTERCEPT', 'Where a line crosses an axis'], ['FUNCTION', 'A rule that gives exactly one output for each input'], ['NONLINEAR', 'A pattern that does not make a straight line'],
      ['VARIABLE', 'A letter that stands for a number'], ['EQUATION', 'Two expressions with an equals sign between them'], ['NEGATIVE', 'Below zero'],
      ['POSITIVE', 'Above zero'], ['PARALLEL', 'Lines that never meet'], ['HORIZONTAL', 'Flat, like the horizon'],
      ['VERTICAL', 'Straight up and down'], ['COORDINATE', 'One number in an (x, y) pair'], ['QUADRANT', 'One of the four parts of the coordinate plane'],
      ['ABSOLUTEVALUE', 'A number\'s distance from zero'], ['CONSTANT', 'A value that does not change'], ['FRACTION', 'Part of a whole, like 3/4'],
      ['GRADIENT', 'The steepness of a line'], ['RATEOFCHANGE', 'How fast one quantity changes compared with another'], ['INITIALVALUE', 'The starting amount: the output when the input is 0'],
      ['LINEARFUNCTION', 'A function whose graph is a straight line'], ['PERPENDICULAR', 'Lines that meet at a right angle'], ['RIGHTANGLE', 'Exactly 90 degrees'],
      ['TRIANGLE', 'Shape with three sides'], ['RECTANGLE', 'Four right angles, opposite sides equal'], ['PARALLELOGRAM', 'Four-sided shape with two pairs of parallel sides'],
      ['CIRCUMFERENCE', 'The distance around a circle'], ['DIAMETER', 'Straight line across a circle through the centre'], ['PYTHAGORAS', 'Greek mathematician with a famous theorem about right triangles'],
      ['HYPOTENUSE', 'The longest side of a right triangle'], ['PERCENTAGE', 'A part out of a hundred'], ['PROPORTIONAL', 'When y = kx, y is directly ___ to x'],
      ['INEQUALITY', 'A statement that uses < or >'], ['EXPRESSION', 'Numbers, letters and operations with no equals sign'], ['COEFFICIENT', 'The number in front of a variable, like 3 in 3x'],
      ['SCATTERPLOT', 'Graph of dots that shows how two sets of data are related'], ['INTEGERS', 'Whole numbers and their negatives'], ['MULTIPLICATION', 'The operation shown by ×'],
      ['SUBTRACTION', 'Taking away'], ['DENOMINATOR', 'The bottom number of a fraction'], ['NUMERATOR', 'The top number of a fraction'],
      ['PRIMENUMBER', 'A number with exactly two factors, 1 and itself'], ['SQUAREROOT', 'The number that, times itself, gives the number you started with'], ['EXPONENT', 'The small raised number in 2³'],
      ['DECIMALPOINT', 'The dot between the ones and the tenths'], ['TRANSLATION', 'A slide that moves a shape without turning it'], ['REFLECTION', 'A flip over a mirror line']] },
    { id: 'animals', name: 'Animals', e: '🦁', words: [
      ['ELEPHANT', 'Largest land animal, with a trunk'], ['KANGAROO', 'Australian hopper with a pouch'], ['CHAMELEON', 'Lizard that can change colour'],
      ['CROCODILE', 'Big river reptile with powerful jaws'], ['HEDGEHOG', 'Small spiny mammal that curls into a ball'], ['FLAMINGO', 'Pink bird that often stands on one leg'],
      ['SCORPION', 'Desert creature with a stinging tail'], ['BUTTERFLY', 'Insect that was once a caterpillar'], ['JELLYFISH', 'Sea creature with stinging tentacles and no brain'],
      ['SQUIRREL', 'Bushy-tailed nut collector'], ['CHIMPANZEE', 'Great ape, one of our closest relatives'], ['RHINOCEROS', 'Big grey animal with horns on its nose'],
      ['HIPPOPOTAMUS', 'Huge African animal that spends the day in rivers'], ['ALLIGATOR', 'Reptile like a crocodile, with a wider snout'], ['ARMADILLO', 'Mammal covered in bony armour'],
      ['PORCUPINE', 'Rodent covered in sharp quills'], ['ORANGUTAN', 'Red-haired great ape of Borneo and Sumatra'], ['SILVERBACK', 'An adult male gorilla'],
      ['POLARBEAR', 'Big white bear of the Arctic'], ['GRIZZLYBEAR', 'Big brown bear of North America'], ['KOMODODRAGON', 'The world\'s largest lizard, from Indonesia'],
      ['RATTLESNAKE', 'Snake that shakes its tail as a warning'], ['ANACONDA', 'Huge snake of South America'], ['TARANTULA', 'Big, hairy spider'],
      ['GRASSHOPPER', 'Green insect that jumps and chirps'], ['CATERPILLAR', 'Grows up to become a butterfly'], ['DRAGONFLY', 'Insect with four see-through wings that zooms over ponds'],
      ['LADYBIRD', 'Red beetle with black spots (a ladybug)'], ['WOODPECKER', 'Bird that drums on tree trunks'], ['HUMMINGBIRD', 'Tiny bird that can fly backwards'],
      ['PENGUINS', 'Birds that can\'t fly but swim brilliantly'], ['KINGFISHER', 'Bright blue bird that dives for fish'], ['MEERKATS', 'Desert mammals that stand on their back legs to keep lookout'],
      ['DROMEDARY', 'A camel with one hump'], ['SNOWLEOPARD', 'Spotted big cat of the high mountains'], ['PLATYPUS', 'Egg-laying mammal with a duck\'s bill'],
      ['TORTOISE', 'Slow land reptile with a shell'], ['SALAMANDER', 'Amphibian that looks like a lizard'], ['BLUEWHALE', 'The largest animal ever known'],
      ['DALMATIAN', 'Dog breed with black spots'], ['ANTEATER', 'Slurps up ants with a long, sticky tongue'], ['BALDEAGLE', 'National bird of the USA'],
      ['PANGOLIN', 'Scaly mammal that rolls into a ball']] },
    { id: 'space', name: 'Space', e: '🚀', words: [
      ['ASTEROID', 'Rocky lump orbiting the Sun, many between Mars and Jupiter'], ['ASTRONAUT', 'Person trained to travel into space'], ['TELESCOPE', 'Makes faraway stars look closer'],
      ['SATELLITE', 'Anything that orbits a planet, like the Moon or a GPS craft'], ['BLACKHOLE', 'Gravity so strong that not even light escapes'], ['SUPERNOVA', 'The huge explosion of a dying star'],
      ['SPACESUIT', 'What an astronaut wears outside the spacecraft'], ['MILKYWAY', 'Our home galaxy'], ['UNIVERSE', 'Everything that exists'],
      ['LIGHTYEAR', 'The distance light travels in one year'], ['CONSTELLATION', 'Stars that make a picture, like Orion'], ['SOLARSYSTEM', 'The Sun and everything that orbits it'],
      ['ANDROMEDA', 'The nearest big galaxy to the Milky Way'], ['METEORITE', 'A space rock that reaches the ground'], ['METEORSHOWER', 'Lots of shooting stars in one night'],
      ['SPACESTATION', 'The ISS is one, orbiting Earth with a crew on board'], ['SPACESHUTTLE', 'NASA\'s reusable spacecraft, flown from 1981 to 2011'], ['MOONLANDING', 'Apollo 11 made the first one in 1969'],
      ['NEILARMSTRONG', 'The first person to walk on the Moon'], ['YURIGAGARIN', 'The first human in space, in 1961'], ['WEIGHTLESS', 'How astronauts feel, floating in orbit'],
      ['COUNTDOWN', 'Ten, nine, eight... liftoff!'], ['LAUNCHPAD', 'Where a rocket blasts off from'], ['MISSIONCONTROL', 'Team on the ground that guides a space flight'],
      ['EXOPLANET', 'A planet orbiting a star other than the Sun'], ['REDPLANET', 'Nickname for Mars'], ['DWARFPLANET', 'What Pluto has been called since 2006'],
      ['HALLEYSCOMET', 'Famous comet seen from Earth about every 76 years'], ['SUNSPOTS', 'Cooler, dark patches on the Sun'], ['SOLARFLARE', 'Sudden burst of energy from the Sun'],
      ['SOLARECLIPSE', 'When the Moon blocks out the Sun'], ['LUNARECLIPSE', 'When Earth\'s shadow falls on the Moon'], ['PLANETARIUM', 'Dome where star shows are projected'],
      ['OBSERVATORY', 'Building with a big telescope'], ['ASTRONOMY', 'The science of stars and planets'], ['COSMONAUT', 'Russian word for a space traveller'],
      ['MARSROVER', 'Robot car exploring the Red Planet'], ['JAMESWEBB', 'Space telescope launched in 2021, named after a NASA leader'], ['SPACEWALK', 'Going outside a spacecraft in a spacesuit'],
      ['THEBIGBANG', 'How scientists think the universe began'], ['GASGIANT', 'A huge planet made mostly of gas, like Jupiter'], ['INTERSTELLAR', 'Between the stars']] },
    { id: 'heroes', name: 'Superheroes', e: '🦸', words: [
      ['SPIDERMAN', 'Your friendly neighbourhood web-slinger'], ['SUPERMAN', 'Man of Steel from the planet Krypton'], ['WOLVERINE', 'X-Man with metal claws who heals fast'],
      ['SIDEKICK', 'A hero\'s helper, like Robin'], ['KRYPTONITE', 'Green rock that makes Superman weak'], ['GAUNTLET', 'Thanos wears the Infinity ___'],
      ['MULTIVERSE', 'Lots of universes side by side'], ['BATMOBILE', 'Batman\'s car'], ['CATWOMAN', 'Jewel thief in Gotham who dresses like a cat'],
      ['SUPERPOWER', 'An amazing ability no normal person has'], ['WONDERWOMAN', 'Amazon princess with a lasso of truth'], ['TONYSTARK', 'Iron Man\'s real name'],
      ['CAPTAINAMERICA', 'Super soldier with a round shield'], ['BLACKPANTHER', 'King of Wakanda'], ['BLACKWIDOW', 'Natasha Romanoff\'s hero name'],
      ['BRUCEBANNER', 'Scientist who turns into the Hulk'], ['PETERPARKER', 'Spider-Man\'s secret identity'], ['CLARKKENT', 'Superman\'s secret identity'],
      ['BRUCEWAYNE', 'Batman\'s secret identity'], ['GOTHAMCITY', 'Batman\'s home city'], ['THEJOKER', 'Batman\'s grinning enemy'],
      ['DOCTORSTRANGE', 'Marvel\'s Sorcerer Supreme'], ['THEFLASH', 'The fastest man alive in DC comics'], ['GREENLANTERN', 'DC hero with a power ring'],
      ['CAPTAINMARVEL', 'Carol Danvers\' hero name'], ['AVENGERS', 'Marvel team called Earth\'s Mightiest Heroes'], ['JUSTICELEAGUE', 'DC team with Superman, Batman and Wonder Woman'],
      ['SPIDERSENSE', 'The tingle that warns Spider-Man of danger'], ['SECRETIDENTITY', 'A hero\'s normal life, hidden behind a mask'], ['SUPERVILLAIN', 'An evil enemy with powers'],
      ['ARCHENEMY', 'A hero\'s greatest foe'], ['INVISIBILITY', 'The power not to be seen'], ['TELEPORTATION', 'The power to vanish and appear somewhere else'],
      ['TELEKINESIS', 'Moving things with your mind'], ['SUPERSTRENGTH', 'The power to lift a car with ease'], ['PROFESSORX', 'Telepath in a wheelchair who leads the X-Men'],
      ['VIBRANIUM', 'The metal in Captain America\'s shield'], ['UTILITYBELT', 'Batman\'s belt full of gadgets'], ['WEBSHOOTERS', 'Wrist gadgets Spider-Man uses to swing'],
      ['STARLORD', 'Peter Quill\'s name in the Guardians of the Galaxy'], ['GREENGOBLIN', 'Spider-Man villain who flies on a glider'], ['MILESMORALES', 'Spider-Man from Brooklyn in Into the Spider-Verse']] },
    { id: 'anime', name: 'Anime', e: '🍥', words: [
      ['NARUTOUZUMAKI', 'Orange ninja who dreams of becoming Hokage'], ['SUPERSAIYAN', 'Goku\'s golden-haired power-up'], ['PRINCEVEGETA', 'The proud prince of all Saiyans'],
      ['MONKEYDLUFFY', 'Rubber pirate captain in a straw hat'], ['RORONOAZORO', 'Straw Hat swordsman who fights with three swords'], ['SASUKEUCHIHA', 'Naruto\'s rival from the Uchiha clan'],
      ['KAKASHIHATAKE', 'Masked ninja who teaches Team 7'], ['STUDIOGHIBLI', 'Animation studio behind Totoro and Spirited Away'], ['SPIRITEDAWAY', 'Ghibli film where Chihiro works in a bathhouse for spirits'],
      ['HAYAOMIYAZAKI', 'Ghibli director of My Neighbor Totoro'], ['TANJIROKAMADO', 'Demon slayer in a green and black checked jacket'], ['NEZUKOKAMADO', 'Tanjiro\'s sister with a bamboo muzzle'],
      ['DEMONSLAYER', 'Anime with Tanjiro and Nezuko'], ['IZUKUMIDORIYA', 'Deku\'s real name in My Hero Academia'], ['ALLMIGHT', 'Number one hero, the Symbol of Peace'],
      ['MYHEROACADEMIA', 'Anime about students training to be heroes at U.A. High'], ['ONEPUNCHMAN', 'Saitama wins every fight with a single hit'], ['SATORUGOJO', 'Blindfolded strongest sorcerer in Jujutsu Kaisen'],
      ['JUJUTSUKAISEN', 'Anime with Itadori and cursed spirits'], ['YUJIITADORI', 'Swallowed Sukuna\'s cursed finger'], ['ATTACKONTITAN', 'Humans hide behind huge walls from giants'],
      ['ERENYEAGER', 'Wants to wipe out every titan'], ['CAPTAINLEVI', 'Humanity\'s strongest soldier'], ['KAMEHAMEHA', 'Goku\'s energy blast'],
      ['RASENGAN', 'Naruto\'s spinning ball of chakra'], ['SHARINGAN', 'Red eye of the Uchiha clan'], ['DRAGONBALL', 'Collect all seven to make a wish'],
      ['ONEPIECE', 'The great treasure every pirate is chasing'], ['STRAWHAT', 'Luffy\'s favourite hat'], ['NINETAILEDFOX', 'The beast sealed inside Naruto'],
      ['SHONENJUMP', 'Japanese magazine where Naruto and One Piece began'], ['MANGAARTIST', 'Person who draws Japanese comics'], ['COSPLAYER', 'Fan who dresses up as a character'],
      ['ANIMATION', 'Drawings brought to life frame by frame'], ['SAILORMOON', 'Magical girl who fights evil by moonlight'], ['DORAEMON', 'Blue robot cat from the future'],
      ['SPYXFAMILY', 'Anime with Loid, Yor and Anya'], ['ANYAFORGER', 'Pink-haired girl who can read minds'], ['ICHIGOKUROSAKI', 'Orange-haired Soul Reaper in Bleach'],
      ['SOLOLEVELING', 'Sung Jinwoo rises from the weakest hunter'], ['SHURIKEN', 'Ninja throwing star'], ['GUMGUMFRUIT', 'Devil Fruit that made Luffy\'s body rubber']] },
    { id: 'music', name: 'Music', e: '🎵', words: [
      ['HEADPHONES', 'Music just for your ears'], ['MICROPHONE', 'The singer holds it'], ['ORCHESTRA', 'Big group with strings, woodwind, brass and percussion'],
      ['CONDUCTOR', 'Waves a baton in front of the orchestra'], ['SAXOPHONE', 'Curvy jazz instrument made of brass but played with a reed'], ['PLAYLIST', 'Your list of favourite songs'],
      ['ELECTRICGUITAR', 'Plugs into an amp to rock out'], ['BASSGUITAR', 'Plays the lowest notes in a band'], ['DRUMSTICKS', 'What a drummer hits with'],
      ['GRANDPIANO', 'The biggest piano, with a lid that opens'], ['VIOLINIST', 'Plays the violin'], ['TRUMPETER', 'Plays a brass instrument with three valves'],
      ['CLARINET', 'Black woodwind instrument with a single reed'], ['TROMBONE', 'Brass instrument with a slide'], ['XYLOPHONE', 'Hit its wooden bars with mallets'],
      ['TAMBOURINE', 'Shake it to jingle'], ['HARMONICA', 'Mouth organ you blow and suck'], ['ACCORDION', 'Squeeze box with buttons and keys'],
      ['DOUBLEBASS', 'The biggest instrument in the string section'], ['FRENCHHORN', 'Curly brass instrument'], ['SYNTHESIZER', 'Electronic keyboard that makes all kinds of sounds'],
      ['TURNTABLES', 'A DJ scratches records on these'], ['SONGWRITER', 'Writes the words and the tune'], ['SOUNDTRACK', 'The music of a film'],
      ['MUSICVIDEO', 'Short film made for a song'], ['CONCERTHALL', 'Building for live orchestra music'], ['RECORDLABEL', 'Company that releases an artist\'s music'],
      ['LYRICIST', 'Writes the words of songs'], ['MELODIES', 'Tunes you can hum'], ['HARMONIES', 'Notes sung together that sound good'],
      ['TIMESIGNATURE', 'The 4/4 at the start of the music'], ['TREBLECLEF', 'Curly sign at the start of the high staff'], ['SHARPSANDFLATS', 'Symbols that raise or lower a note'],
      ['CRESCENDO', 'Getting gradually louder'], ['METRONOME', 'Ticks to keep a steady beat'], ['BEATBOXING', 'Making drum sounds with your mouth'],
      ['LOUDSPEAKER', 'Where the sound comes out'], ['AMPLIFIER', 'Makes an electric guitar\'s sound louder'], ['SUPERSTAR', 'A hugely famous singer'],
      ['NUMBERONE', 'The top song in the charts'], ['MUSICFESTIVAL', 'Days of outdoor concerts'], ['BACKINGVOCALS', 'Singers behind the lead'],
      ['LEADSINGER', 'The main voice in a band'], ['STREAMING', 'Listening online without downloading'], ['BEETHOVEN', 'Composer who kept writing music after going deaf'],
      ['COMPOSER', 'Writes music'], ['SYMPHONY', 'Long piece for a full orchestra']] },
    { id: 'science', name: 'Science lab', e: '🔬', words: [
      ['MOLECULE', 'Atoms joined together'], ['HYDROGEN', 'The lightest element'], ['MICROSCOPE', 'Makes tiny things look big'],
      ['EXPERIMENT', 'A test to find something out'], ['HYPOTHESIS', 'Your prediction before the test'], ['BACTERIA', 'Tiny living things, some good, some bad'],
      ['FRICTION', 'The force that slows things down when surfaces rub'], ['ELECTRON', 'Tiny negative particle'], ['EVAPORATE', 'What a liquid does when it turns into a gas'],
      ['PERIODICTABLE', 'Chart of all the elements'], ['PHOTOSYNTHESIS', 'How plants make food from sunlight'], ['CARBONDIOXIDE', 'The gas we breathe out, CO2'],
      ['NITROGEN', 'The gas that makes up most of the air'], ['ELECTRICITY', 'Flows through wires to power things'], ['MAGNETISM', 'Force that pulls on iron'],
      ['ISAACNEWTON', 'Scientist who explained gravity and the laws of motion'], ['ALBERTEINSTEIN', 'Scientist famous for E = mc²'], ['MARIECURIE', 'The first person to win two Nobel Prizes'],
      ['CHARLESDARWIN', 'Scientist of evolution by natural selection'], ['BUNSENBURNER', 'Gas burner in the school lab'], ['TESTTUBE', 'Thin glass tube for small experiments'],
      ['SAFETYGOGGLES', 'Protect your eyes in the lab'], ['THERMOMETER', 'Measures temperature'], ['CONDENSATION', 'Gas turning back into liquid, like drops on a cold window'],
      ['MELTINGPOINT', 'The temperature where a solid turns liquid'], ['BOILINGPOINT', '100 °C for water at sea level'], ['NEUTRONS', 'Particles with no charge in the nucleus'],
      ['CHROMOSOME', 'Thread of DNA in a cell\'s nucleus'], ['SKELETON', '206 bones in an adult human'], ['ECOSYSTEM', 'Living things and their surroundings working together'],
      ['FOODCHAIN', 'Grass, rabbit, fox: who eats whom'], ['INSULATOR', 'Material that blocks electricity, like rubber'], ['ERUPTION', 'When a volcano blows'],
      ['EARTHQUAKE', 'Shaking ground when the plates move'], ['TECTONICPLATES', 'Giant slabs of Earth\'s crust'], ['FOSSILFUELS', 'Coal, oil and gas'],
      ['RENEWABLE', 'Energy from sun or wind that won\'t run out'], ['SOLARPANEL', 'Turns sunlight into electricity'], ['WINDTURBINE', 'Giant spinning blades that make electricity'],
      ['VACCINATION', 'Training your immune system with a jab'], ['MICROORGANISM', 'Living thing too small to see without a microscope'], ['REACTION', 'Chemical ___: substances change into new ones'],
      ['SPECTRUM', 'Red to violet: light split into its colours'], ['WAVELENGTH', 'Distance from one wave peak to the next'], ['LABORATORY', 'Room where scientists do experiments'],
      ['STATESOFMATTER', 'Solid, liquid and gas'], ['ACCELERATION', 'How fast speed is changing']] },
    { id: 'world', name: 'Around the world', e: '🌍', words: [
      ['PASSPORT', 'Little book you show at the border'], ['CONTINENT', 'Africa, Asia or Europe, for example'], ['AUSTRALIA', 'Country and continent of kangaroos'],
      ['EIFFELTOWER', 'Iron tower in Paris'], ['LONDONEYE', 'Giant wheel beside the River Thames'], ['NEWYORKCITY', 'Home of the Statue of Liberty'],
      ['GREATWALL', 'China\'s ancient barrier, thousands of km long'], ['TAJMAHAL', 'White marble tomb in Agra, India'], ['PYRAMIDS', 'Ancient tombs at Giza in Egypt'],
      ['COLOSSEUM', 'Ancient arena in Rome'], ['MACHUPICCHU', 'Inca city high in the Andes of Peru'], ['BURJKHALIFA', 'The world\'s tallest building, in Dubai'],
      ['SAHARADESERT', 'Largest hot desert, across North Africa'], ['RAINFOREST', 'Hot, wet forest like the Amazon'], ['MOUNTEVEREST', 'Tallest mountain on Earth'],
      ['KILIMANJARO', 'Africa\'s highest mountain, in Tanzania'], ['NIAGARAFALLS', 'Waterfalls on the border of the USA and Canada'], ['GRANDCANYON', 'Huge gorge carved by the Colorado River'],
      ['SAUDIARABIA', 'Kingdom whose capital is Riyadh'], ['UNITEDKINGDOM', 'England, Scotland, Wales and Northern Ireland'], ['SOUTHAFRICA', 'Country with three capital cities'],
      ['ARGENTINA', 'South American country, home of the tango'], ['SWITZERLAND', 'Alpine country of chocolate and watches'], ['NETHERLANDS', 'Country of windmills and tulips'],
      ['PHILIPPINES', 'Asian country of over 7,000 islands'], ['NEWZEALAND', 'Island country of kiwis and the All Blacks'], ['INDONESIA', 'Huge island country that includes Bali'],
      ['PORTUGAL', 'Spain\'s neighbour, with Lisbon as its capital'], ['ISTANBUL', 'Turkish city on two continents'], ['SINGAPORE', 'Island city-state in South-East Asia'],
      ['HONGKONG', 'City of skyscrapers on China\'s south coast'], ['WASHINGTONDC', 'Capital of the USA'], ['CAPETOWN', 'South African city below Table Mountain'],
      ['RIODEJANEIRO', 'Brazilian city with the Christ the Redeemer statue'], ['BUENOSAIRES', 'Capital of Argentina'], ['NORTHPOLE', 'The top of the world, in the Arctic'],
      ['ANTARCTICA', 'Frozen continent around the South Pole'], ['MEDITERRANEAN', 'Sea between Europe and Africa'], ['PACIFICOCEAN', 'The largest ocean'],
      ['ATLANTICOCEAN', 'Ocean between the Americas and Europe'], ['TIMEZONES', 'Why it\'s night in one country and day in another'], ['LATITUDE', 'Lines on a map that run east to west'],
      ['LONGITUDE', 'Lines on a map that run from pole to pole']] },
    { id: 'ocean', name: 'Under the sea', e: '🌊', words: [
      ['SEAHORSE', 'The dad carries the babies'], ['STARFISH', 'Sea star with five arms'], ['SUBMARINE', 'Ship that travels underwater'],
      ['SHIPWRECK', 'Sunken ship on the seabed'], ['TREASURE', 'Chest of pirate gold'], ['STINGRAY', 'Flat fish with a barb in its tail'],
      ['PUFFERFISH', 'Blows itself up like a ball'], ['PLANKTON', 'Tiny drifting life that whales eat'], ['LIGHTHOUSE', 'Tower that warns ships'],
      ['CORALREEF', 'Colourful underwater city built by tiny animals'], ['HAMMERHEAD', 'Shark with a T-shaped head'], ['WHALESHARK', 'The biggest fish in the sea'],
      ['KILLERWHALE', 'Black and white orca'], ['HUMPBACKWHALE', 'Whale famous for its long songs'], ['DOLPHINS', 'Clever, playful mammals that use echolocation'],
      ['OCTOPUSES', 'Eight-armed animals that squirt ink'], ['GIANTSQUID', 'Huge deep-sea animal with eyes as big as plates'], ['SEAURCHIN', 'Spiny ball on the seabed'],
      ['SEACUCUMBER', 'Squishy, sausage-shaped seabed animal'], ['HERMITCRAB', 'Lives in an empty shell and moves house'], ['LOBSTERS', 'Big-clawed shellfish that turn red when cooked'],
      ['KELPFOREST', 'Underwater forest of giant seaweed'], ['SEATURTLE', 'Reptile that swims thousands of km to lay eggs on a beach'], ['CLOWNFISH', 'Orange and white fish that lives in an anemone'],
      ['SEAANEMONE', 'Stinging animal that looks like a flower'], ['BARRACUDA', 'Long, toothy hunting fish'], ['SWORDFISH', 'Fish with a long, flat, pointed bill'],
      ['ANGLERFISH', 'Deep-sea fish with a glowing lure'], ['NARWHALS', 'Tusked whales called unicorns of the sea'], ['MANATEES', 'Gentle plant-eaters called sea cows'],
      ['WALRUSES', 'Tusked, whiskered animals of the Arctic'], ['SEALIONS', 'Noisy, flippered animals that can walk on land'], ['SCUBADIVER', 'Swims deep with an air tank'],
      ['OXYGENTANK', 'What a scuba diver breathes from'], ['SURFBOARD', 'Ride the waves on it'], ['TIDEPOOL', 'Rocky puddle left when the sea goes out'],
      ['HIGHTIDE', 'When the sea comes furthest up the beach'], ['SANDCASTLE', 'Build it on the beach with a bucket'], ['SEASHELLS', 'Found on the beach; hold one to your ear'],
      ['MARIANATRENCH', 'The deepest place in the ocean'], ['SAILBOAT', 'Pushed along by the wind'], ['PIRATESHIP', 'Flies the skull and crossbones'],
      ['SEAGULLS', 'Noisy beach birds that steal chips'], ['PELICANS', 'Birds with a big pouch under their beaks'], ['OCEANCURRENT', 'A river of moving water inside the sea']] },
    { id: 'tech', name: 'Tech and the internet', e: '💻', words: [
      ['KEYBOARD', 'Where you type'], ['PASSWORD', 'Keep it secret'], ['DOWNLOAD', 'Get a file from the internet'],
      ['STREAMER', 'Plays games live online'], ['SMARTPHONE', 'Phone that is also a computer'], ['BLUETOOTH', 'Connects your earbuds without wires'],
      ['ALGORITHM', 'Step-by-step rules a computer follows'], ['USERNAME', 'Your name online'], ['FOLLOWERS', 'People who subscribe to your account'],
      ['FIREWALL', 'Keeps hackers out of a network'], ['TOUCHSCREEN', 'Screen you tap and swipe'], ['WEBBROWSER', 'App for visiting websites'],
      ['SEARCHENGINE', 'Type a question and it finds web pages'], ['SOCIALMEDIA', 'Apps for sharing posts with friends'], ['VIDEOCALL', 'Talking face to face over the internet'],
      ['NOTIFICATION', 'A ping telling you something new arrived'], ['ROBOTICS', 'Building and programming robots'], ['PROGRAMMING', 'Writing code'],
      ['JAVASCRIPT', 'Programming language that runs in web browsers'], ['COMPUTER', 'Machine that runs programs'], ['MICROCHIP', 'Tiny slice of silicon full of circuits'],
      ['PROCESSOR', 'The brain of a computer'], ['MOTHERBOARD', 'The main circuit board inside a computer'], ['HARDDRIVE', 'Stores the files inside a computer'],
      ['USBSTICK', 'Plug-in memory you can carry on a keyring'], ['SCREENSHOT', 'A picture of what\'s on your screen'], ['WALLPAPER', 'The picture behind your apps'],
      ['SPREADSHEET', 'Rows and columns of cells, like Excel'], ['CYBERSECURITY', 'Protecting computers from attacks'], ['ANTIVIRUS', 'Software that finds and removes malware'],
      ['PHISHING', 'Fake emails that try to steal your password'], ['ENCRYPTION', 'Scrambling data so only the right person can read it'], ['BROADBAND', 'Fast home internet connection'],
      ['INTERNET', 'Worldwide network of computers'], ['HYPERLINK', 'Click it to jump to another page'], ['CLOUDSTORAGE', 'Keeping your files on servers online'],
      ['VIRTUALREALITY', 'Headset that puts you inside a 3D world'], ['QUADCOPTER', 'Drone with four spinning rotors'], ['SELFIESTICK', 'Pole to hold your phone out for a photo'],
      ['HASHTAGS', 'Words with # in front on social media'], ['SUBSCRIBERS', 'People who follow a YouTube channel'], ['LIVESTREAM', 'Video broadcast online as it happens'],
      ['CHARGINGCABLE', 'Plug it in to fill your battery'], ['POWERBANK', 'Portable battery for charging on the go'], ['SOFTWARE', 'The programs on a computer'],
      ['HARDWARE', 'The physical parts of a computer']] },
    { id: 'cars', name: 'Cars and racing', e: '🏎️', words: [
      ['HORSEPOWER', 'How strong an engine is'], ['MECHANIC', 'Fixes cars'], ['SEATBELT', 'Buckle up!'],
      ['OVERTAKE', 'Pass the car in front'], ['SUPERCAR', 'Super fast, super expensive car'], ['LAMBORGHINI', 'Italian supercar maker with a raging bull badge'],
      ['MASERATI', 'Italian luxury car with a trident badge'], ['ROLLSROYCE', 'British luxury car maker'], ['ASTONMARTIN', 'British sports car driven by James Bond'],
      ['MERCEDESBENZ', 'German car maker with a three-pointed star'], ['VOLKSWAGEN', 'German maker of the Beetle and the Golf'], ['LANDCRUISER', 'Toyota\'s tough off-road SUV'],
      ['FORMULAONE', 'The top level of single-seater racing'], ['PITSTOPS', 'New tyres in about two seconds'], ['CHEQUEREDFLAG', 'Black and white flag waved at the finish'],
      ['LEWISHAMILTON', 'British Formula 1 driver with seven world titles'], ['MAXVERSTAPPEN', 'Dutch Formula 1 world champion with Red Bull'], ['GRANDPRIX', 'A Formula 1 race'],
      ['RACETRACK', 'Circuit the cars go round'], ['STEERINGWHEEL', 'Turn it to change direction'], ['SPEEDOMETER', 'Dial that shows how fast you\'re going'],
      ['ACCELERATOR', 'Pedal that makes the car go faster'], ['HANDBRAKE', 'Lever that holds a parked car still'], ['WINDSCREEN', 'The glass at the front of a car'],
      ['HEADLIGHTS', 'Lights at the front for driving at night'], ['SPARKPLUG', 'Makes the spark that lights the fuel'], ['GEARSTICK', 'Lever you move to change gear'],
      ['EXHAUSTPIPE', 'Where the fumes come out'], ['DRIFTING', 'Sliding sideways round a corner on purpose'], ['TURBOCHARGER', 'Uses exhaust gas to give the engine more power'],
      ['NITROBOOST', 'Button for a burst of speed in racing games'], ['SPORTSCAR', 'Low, fast two-seater'], ['CONVERTIBLE', 'Car with a roof that folds down'],
      ['MOTORBIKE', 'Two wheels and an engine'], ['MONSTERTRUCK', 'Pickup on giant wheels that crushes cars'], ['GOKARTING', 'Racing small, low cars round a track'],
      ['DRIVINGTEST', 'Pass it to get your licence'], ['NUMBERPLATE', 'Shows a car\'s registration'], ['PETROLSTATION', 'Where you fill up with fuel'],
      ['HYBRIDCAR', 'Car with petrol and electric power'], ['ELECTRICCAR', 'Runs on a battery, not petrol'], ['DASHBOARD', 'Panel of dials in front of the driver'],
      ['SUSPENSION', 'Springs that smooth out the bumps'], ['PODIUMFINISH', 'Coming in the top three'], ['POLEPOSITION', 'Starting at the front of the grid']] }
  ];
  // the mystery picture behind each theme's board
  var PIC = { poke: ['⚡', '🔥', '💧', '🌿', '⭐', '🥚', '🐉', '🎒'], sport: ['⚽', '🏆', '🥅', '🏃', '🥇', '📣', '🏀', '🎾'], games: ['🎮', '🍕', '🍔', '🍩', '💎', '👾', '🌮', '🍿'], maths: ['📈', '📐', '➗', '✖️', '📊', '🔢', '📏', '🧮'],
    animals: ["🦁", "🐘", "🦒", "🐧", "🐙", "🐬", "🦓", "🦉"], space: ["🚀", "🪐", "🌙", "⭐", "☄️", "🛰️", "👽", "🌍"], heroes: ["🦸", "🦹", "🛡️", "⚡", "🕷️", "🦇", "💥", "🔨"], anime: ["🍥", "🍜", "⚔️", "🥷", "🐉", "🔥", "🌸", "🏴‍☠️"], music: ["🎵", "🎸", "🥁", "🎹", "🎤", "🎧", "🎺", "🎻"], science: ["🔬", "🧪", "⚗️", "🧬", "🧲", "💡", "🦠", "🌋"], world: ["🌍", "🗺️", "✈️", "🗼", "🏝️", "🏜️", "🧭", "🏔️"], ocean: ["🌊", "🐠", "🦀", "🐚", "🦑", "🐡", "⚓", "🐳"], tech: ["💻", "📱", "🖱️", "🎧", "🤖", "📶", "☁️", "🔋"], cars: ["🏎️", "🚗", "🏁", "🛞", "🏍️", "🚙", "🔧", "🏆"] };
  window.SFA_BOARD_THEMES = THEMES;

  /* ---------------- the crossword: the same on every screen from (theme, seed, n) ---------------- */
  function rng(seed) { var s = (seed >>> 0) || 1; return function () { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return ((s >>> 8) & 0xffff) / 65536; }; }
  function shuffle(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var built = {};
  function build(theme, seed, n) {
    var key = theme + ':' + seed + ':' + n; if (built[key]) return built[key];
    var T = THEMES[theme % THEMES.length], r = rng(seed * 7919 + theme * 31 + 7), pool = shuffle(T.words, r);
    var grid = {}, placed = [], used = {}, box = { r0: 0, r1: 0, c0: 0, c1: 0 };
    function at(rr, cc) { return grid[rr + ',' + cc]; }
    function fits(w, r0, c0, d) {
      var dr = d === 'D' ? 1 : 0, dc = d === 'A' ? 1 : 0, cross = 0;
      if (at(r0 - dr, c0 - dc) || at(r0 + dr * w.length, c0 + dc * w.length)) return -1;
      for (var k = 0; k < w.length; k++) {
        var rr = r0 + dr * k, cc = c0 + dc * k, g = at(rr, cc);
        if (g) { if (g.ch !== w[k] || g[d] != null) return -1; cross++; }
        else if (d === 'A' ? (at(rr - 1, cc) || at(rr + 1, cc)) : (at(rr, cc - 1) || at(rr, cc + 1))) return -1;
      }
      return cross;
    }
    function put(it) {
      var dr = it.d === 'D' ? 1 : 0, dc = it.d === 'A' ? 1 : 0;
      for (var k = 0; k < it.w.length; k++) { var rr = it.r + dr * k, cc = it.c + dc * k, kk = rr + ',' + cc, g = grid[kk] || (grid[kk] = { ch: it.w[k] }); g[it.d] = placed.length; box.r0 = Math.min(box.r0, rr); box.r1 = Math.max(box.r1, rr); box.c0 = Math.min(box.c0, cc); box.c1 = Math.max(box.c1, cc); }
      placed.push(it);
    }
    // a long word across the middle, then each next word where it crosses the most and keeps the grid compact
    var first = 0; for (var f = 1; f < Math.min(8, pool.length); f++) if (pool[f][0].length > pool[first][0].length) first = f;
    put({ w: pool[first][0], clue: pool[first][1], r: 0, c: 0, d: 'A' }); used[first] = 1;
    n = Math.min(n, pool.length);
    while (placed.length < n) {
      var best = null, tried = 0;
      for (var i = 0; i < pool.length && tried < 24; i++) {
        if (used[i]) continue; tried++;
        var w = pool[i][0];
        Object.keys(grid).forEach(function (kk) {
          var g = grid[kk], rc = kk.split(',').map(Number);
          for (var k = 0; k < w.length; k++) {
            if (w[k] !== g.ch) continue;
            ['A', 'D'].forEach(function (d) {
              if (g[d] != null) return;
              var r0 = d === 'D' ? rc[0] - k : rc[0], c0 = d === 'A' ? rc[1] - k : rc[1], cr = fits(w, r0, c0, d); if (cr <= 0) return;
              var rr1 = d === 'D' ? r0 + w.length - 1 : r0, cc1 = d === 'A' ? c0 + w.length - 1 : c0;
              var hgt = Math.max(box.r1, rr1) - Math.min(box.r0, r0) + 1, wid = Math.max(box.c1, cc1) - Math.min(box.c0, c0) + 1;
              var sc = cr * 30 - (hgt + wid) * 6 - Math.abs(hgt * 1.6 - wid) * 3;   // crossings, then compact and wider than tall (a screen): long words, so compact matters
              if (!best || sc > best.s) best = { i: i, r: r0, c: c0, d: d, s: sc };
            });
          }
        });
      }
      if (!best) {   // nothing crosses any more: start a new block under the grid
        for (var j = 0; j < pool.length; j++) if (!used[j]) { best = { i: j, r: box.r1 + 2, c: box.c0, d: 'A' }; break; }
        if (!best) break;
      }
      used[best.i] = 1; put({ w: pool[best.i][0], clue: pool[best.i][1], r: best.r, c: best.c, d: best.d });
    }
    // to the top-left corner; number the clues in reading order
    var cells = {}, starts = {};
    placed.forEach(function (it) { it.r -= box.r0; it.c -= box.c0; starts[it.r + ',' + it.c] = 1; });
    Object.keys(grid).forEach(function (kk) { var rc = kk.split(',').map(Number), g = grid[kk]; cells[(rc[0] - box.r0) + ',' + (rc[1] - box.c0)] = { ch: g.ch, A: g.A, D: g.D }; });
    var num = 0, numAt = {};
    Object.keys(starts).map(function (kk) { return kk.split(',').map(Number); }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).forEach(function (rc) { numAt[rc[0] + ',' + rc[1]] = ++num; });
    placed.forEach(function (it, i) { it.i = i; it.no = numAt[it.r + ',' + it.c]; it.len = it.w.length; });
    return (built[key] = { theme: T, words: placed, cells: cells, rows: box.r1 - box.r0 + 1, cols: box.c1 - box.c0 + 1, numAt: numAt });
  }
  function cellsOf(it) { var out = []; for (var k = 0; k < it.len; k++) out.push(it.d === 'A' ? [it.r, it.c + k] : [it.r + k, it.c]); return out; }
  // the letters a student gets for free: every cell of their word that a solved word crosses
  function freeLetters(B, wi, solved) { var it = B.words[wi], out = {}; cellsOf(it).forEach(function (rc, k) { var g = B.cells[rc[0] + ',' + rc[1]], other = it.d === 'A' ? g.D : g.A; if (other != null && solved[other]) out[k] = 1; }); return out; }

  /* ---------------- the board in the live state ---------------- */
  function sh3(sid) { var h = 5381, t = String(sid); for (var i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0; return (h % 46656).toString(36); }
  function sNow() { return Date.now() + (A.srvSkew() || 0); }
  function boardOf(Lv) {
    var c = Lv && Lv.counts; if (!c || Lv.lesson !== A.LID || !Array.isArray(c.zbs) || !Array.isArray(c.zbid)) return null;
    var z = c.zbs, id = A.decRun(c.zbid), start = A.MODE === 'screen' ? id : A.decRun(c.zbst) || id, solved = {};
    for (var k = 0; Array.isArray(c['zbw' + k]); k++) c['zbw' + k].forEach(function (v, j) { for (var b = 0; b < 13; b++) if (v >> b & 1) solved[k * 13 * 12 + j * 13 + b] = 1; });
    var gifts = []; for (var g = 0; Array.isArray(c['zbg' + g]); g++) c['zbg' + g].forEach(function (v, j) { gifts[g * 12 + j] = v; });
    var sp = Lv.spot && Lv.spot.q === 'zboard' ? String(Lv.spot.text || '') : '', owners = [], names = [];
    sp.split('#').forEach(function (part) { var k2 = part.slice(0, 2), v = part.slice(2); if (k2 === 'A:') owners = v.split(',').map(function (x) { return x ? x.split('+') : []; }); if (k2 === 'N:') names = v.split(','); });
    return { id: id, start: start, state: z[0], theme: z[1], seed: z[2], n: z[3], dur: z[4], all: !!z[5], solved: solved, gifts: gifts, owners: owners, names: names };
  }
  function leftOf(b) { return Math.max(0, Math.round((b.start + b.dur * 1000 - sNow()) / 1000)); }
  function solvedCount(b, B) { var n = 0, of = 0; B.words.forEach(function (w, i) { if (b.owners[i] && b.owners[i].length) { of++; if (b.solved[i]) n++; } }); return { n: n, of: of }; }

  /* =========================== student page and class screen =========================== */
  var root = null, V = null, ST = null, POOL = null, poolLoading = false;
  function key() { return 'board.' + A.LID; }
  function keep() { if (ST) SFA.store.set(key(), ST); }
  function myIdx(b) { if (!A.S.me) return -1; var f = sh3(A.S.me.sid); for (var i = 0; i < b.owners.length; i++) if (b.owners[i].indexOf(f) >= 0) return i; return -1; }

  // ⭐ arcade XP (kept across lessons by sfa-lesson.js); once = a one-time bonus tag
  function xp(n, once) { if (A.hero && ST) A.hero.add('b', String(Math.round(ST.id / 1000)) + (once || ''), n, !!once); }
  function sync() {
    var Lv = A.live(), b = A.isLive() || A.MODE === 'screen' ? boardOf(Lv) : null;
    if (b && A.MODE !== 'teach' && b.state === 2 && sNow() - b.start > b.dur * 1000 + 150000) b = null;   // long over: gone
    if (A.MODE === 'student' && A.saving() && !A.S.me) b = null;
    if (!b) { close(); return; }
    if (!root || V.id !== b.id) open(b);
    V.b = b; V.B = build(b.theme, b.seed, b.n);
    if (A.MODE === 'student') {
      var wi = myIdx(b);
      if (wi < 0 && b.state === 1 && leftOf(b) >= 60 && Date.now() - (V.joinAt || 0) > 15000) { V.joinAt = Date.now(); ST.askedLate = true; keep(); send(-1); }
      if (ST.w !== wi) {
        ST.w = wi; ST.guessed = {}; ST.gifted = {}; ST.solved = false; ST.misses = 0; ST.giftSeen = 0;
        if (wi >= 0 && ST.askedLate) { ST.askedLate = false; ST.credits += 3; SFA.toast('🎒 You joined late, so you start with 3 bonus letter guesses. Go!', 4500); }
        keep();
      }
      receiveGifts(b);
      if (ST.solved) xp(20, 's');   // cracking your own word: a bonus, once
      if (b.state === 2 && ST.right) xp(30 + (b.all ? 30 : 0), 'e');   // finishing bonus, more if the class found every word
    }
    // what's new since the last update: a banner for every word solved and every gift letter sent
    if (V.prev) {
      Object.keys(b.solved).forEach(function (i) { if (!V.prev.solved[i] && V.B.words[i]) { var it = V.B.words[i]; banner('⚡ <b>' + esc(b.names[i] || 'Someone') + '</b> cracked ' + it.no + (it.d === 'A' ? ' ACROSS' : ' DOWN') + ': <b>' + it.w + '</b>!', 'solve'); } });
      b.gifts.forEach(function (g, i) { if (g > (V.prev.gifts[i] || 0) && b.owners[i] && b.owners[i].length && !b.solved[i]) banner('🎁 <b>' + esc(b.names[i] || 'A classmate') + '</b> got a gift letter!', 'gift'); });
    }
    V.prev = { solved: Object.assign({}, b.solved), gifts: b.gifts.slice() };
    var sig = [b.state, b.all, Object.keys(b.solved).join('.'), b.owners.map(function (o) { return o.join('+'); }).join(','), ST.w, A.MODE === 'student' ? ST.giftSeen : '', b.state === 1 && leftOf(b) < 60].join('|');
    if (sig !== V.sig) { V.sig = sig; draw(); }
  }
  function open(b) {
    close();
    var saved = SFA.store.get(key(), null);
    ST = saved && saved.id === b.id ? saved : { id: b.id, w: -1, guessed: {}, gifted: {}, credits: 1, right: 0, streak: 0, misses: 0, solved: false, qi: 0, tries: 0, fb: null, cool: 0, solveCool: 0, giftCred: 0, gifts: [], giftSeen: 0 };
    V = { id: b.id, b: b, B: build(b.theme, b.seed, b.n) };
    root = H('div', 'bb' + (A.MODE === 'screen' ? ' screen' : '')); root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'The Big Board: class crossword');
    document.body.appendChild(root); document.body.classList.add('boarding');
    if (A.MODE === 'student') loadPool();
    V.tick = setInterval(function () { if (root) drawTop(); }, 1000);
  }
  // a classmate sent gift letters to my word: reveal that many letters I don't have yet
  function receiveGifts(b) {
    var it = V.B.words[ST.w]; if (!it) return;
    var got = b.gifts[ST.w] || 0, fresh = got - (ST.giftSeen || 0); if (fresh <= 0) return;
    ST.giftSeen = got; ST.gifted = ST.gifted || {};
    var news = [];
    for (var n = 0; n < fresh; n++) {
      var hidden = []; for (var k = 0; k < it.len; k++) if (!shown(k) && hidden.indexOf(it.w[k]) < 0) hidden.push(it.w[k]);
      if (!hidden.length) break;
      var ch = hidden[Math.floor(Math.random() * hidden.length)]; ST.guessed[ch] = true; ST.gifted[ch] = 1; news.push(ch);
    }
    if (news.length) { SFA.toast('🎁 A classmate sent you ' + (news.length === 1 ? 'a letter: ' : 'letters: ') + news.join(', '), 4000); snd('gift'); }
    var all = true; for (var j = 0; j < it.len; j++) if (!shown(j)) all = false;
    if (all && !ST.solved) { ST.solved = true; A.confetti(); send(); }
    keep();
  }
  // banners across the top of every screen: who cracked what, who got a gift
  function banner(html, kind) { V.bq = V.bq || []; V.bq.push({ html: html, kind: kind }); nextBanner(); }
  function nextBanner() {
    if (!root || V.bbusy || !V.bq || !V.bq.length) return;
    var o = V.bq.shift(); V.bbusy = true; snd(o.kind);
    var b = H('div', 'bbban ' + o.kind + (A.MODE === 'screen' ? ' big' : ''), o.html); document.body.appendChild(b);   // outside the board, so a redraw can't wipe it
    setTimeout(function () { b.classList.add('out'); }, A.MODE === 'screen' ? 2600 : 2000);
    setTimeout(function () { b.remove(); if (V) { V.bbusy = false; nextBanner(); } }, A.MODE === 'screen' ? 3000 : 2400);
  }
  // sound: little synthesised effects, off until someone turns them on
  var AC = null;
  function soundOn() { return !!SFA.store.get('board.sound', false); }
  function snd(k) {
    if (!soundOn()) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var t = AC.currentTime, notes = { solve: [523, 659, 784], gift: [880, 1175], tick: [440], party: [523, 659, 784, 1047, 1319] }[k] || [600];
      notes.forEach(function (f, i) { var o = AC.createOscillator(), g = AC.createGain(); o.type = k === 'tick' ? 'square' : 'triangle'; o.frequency.value = f; o.connect(g); g.connect(AC.destination); var t0 = t + i * 0.11; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(k === 'tick' ? 0.05 : 0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28); o.start(t0); o.stop(t0 + 0.3); });
    } catch (e) { }
  }
  function close() { if (!root) return; clearInterval(V.tick); [].forEach.call(document.querySelectorAll('.bbban'), function (x) { x.remove(); }); root.remove(); root = null; V = null; document.body.classList.remove('boarding'); }

  /* spiral review: number and multiple-choice questions (and their ★ go-further extras) from the five lessons before this
     one, in four levels from easier to harder. A question's level = 1 + one step each for: from the two newest lessons, a
     typed answer (not multiple choice), and two steps for a ★ extra (top level 4). So level 1 is multiple choice from the
     older lessons and level 4 is the ★ extras. A student's run climbs: 3 of level 1, 4 of level 2, 5 of level 3, every
     level 4, then the rest climbing again. Shuffled within each level, so every student's order differs. */
  var RAMP = [3, 4, 5];
  function loadPool() {
    if (POOL || poolLoading) return; poolLoading = true;
    var me = A.LES(), plan = (window.SFA_PLAN || []).filter(function (p) { return p.n < me.n; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 5), got = [], k = 0, keepFn = window.SFA_LESSON;
    function take(L, pos) {
      var from = L.label || 'Lesson ' + L.n, newer = pos < Math.floor(plan.length / 2) ? 1 : 0;
      var lv = function (q, star) { return 1 + Math.min(3, newer + (q.k === 'number' ? 1 : 0) + (star ? 2 : 0)); };
      L.slides.forEach(function (s) {
        if (s.k === 'number' && s.ans != null) got.push({ k: 'number', q: s.q, ans: s.ans, tol: s.tol, fig: s.fig, why: s.why, from: from, lv: lv(s) });
        if (s.k === 'poll' && s.ans != null && !s.warm) got.push({ k: 'poll', q: s.q, opts: s.opts, ans: s.ans, fig: s.fig, why: s.why, from: from, lv: lv(s) });
        (s.more || []).forEach(function (m) { if ((m.k === 'number' || m.k === 'poll') && m.ans != null) got.push(Object.assign({ from: from }, m, { lv: lv(m, true), star: true })); });
      });
    }
    (function next() {
      if (k >= plan.length) {
        window.SFA_LESSON = keepFn; poolLoading = false;
        if (!got.length) take(me, 0);   // the first lesson: nothing earlier, so today's
        var r = rng((A.S.me ? parseInt(sh3(A.S.me.sid), 36) * 977 : 1) + (ST ? Math.round(ST.id / 1000) % 100000 : 0));
        var lvs = [1, 2, 3, 4].map(function (l) { return shuffle(got.filter(function (q) { return q.lv === l; }), r); });
        var run = [];
        RAMP.forEach(function (c, i) { run = run.concat(lvs[i].splice(0, c)); });
        POOL = run.concat(lvs[3], lvs[0], lvs[1], lvs[2]); draw(); return;
      }
      var pos = k;
      window.SFA_LESSON = function (L) { take(L, pos); };
      var s = document.createElement('script'); s.src = 'lessons/L' + plan[k++].l + '.js'; s.onload = s.onerror = function () { s.remove(); next(); }; document.head.appendChild(s);
    })();
  }

  var sendT = null;
  function send(w) {
    clearTimeout(sendT);
    var word = w == null ? ST.w : w, rev = 0;
    if (word >= 0 && V && V.B.words[word]) { var it = V.B.words[word]; for (var k = 0; k < it.len; k++) if (shown(k)) rev++; }
    A.record({ id: QID, k: 'open' }, 'b1;id:' + Math.round(V.id / 1000) + ';w:' + word + ';s:' + (ST.solved ? 1 : 0) + ';r:' + ST.right + ';m:' + ST.misses + ';k:' + rev + (ST.gifts && ST.gifts.length ? ';gv:' + ST.gifts.join('.') : ''), null);
  }
  function sendSoon() { clearTimeout(sendT); sendT = setTimeout(function () { send(); }, 3000); }

  function shown(k) {   // is letter k of my word showing? (guessed, free from a crossing word, or solved)
    var it = V.B.words[ST.w]; if (!it) return false;
    if (ST.solved || V.b.solved[ST.w]) return true;
    if (ST.guessed[it.w[k]]) return true;
    return !!freeLetters(V.B, ST.w, V.b.solved)[k];
  }

  /* ---------- drawing ---------- */
  function drawTop() {
    var b = V.b, B = V.B, t = root.querySelector('.bbtop'); if (!t) return;
    var sc = solvedCount(b, B), left = leftOf(b);
    t.querySelector('.bbclock').textContent = b.all ? '🎉' : b.state === 2 ? 'Time!' : Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2);
    t.querySelector('.bbprog b').textContent = sc.n + ' of ' + sc.of;
    t.querySelector('.bbbar i').style.width = (sc.of ? Math.round(100 * sc.n / sc.of) : 0) + '%';
    var rem = sc.of - sc.n, tg = t.querySelector('.bbtogo');
    tg.hidden = !(b.state === 1 && rem > 0 && rem <= 3); tg.textContent = rem === 1 ? '1 WORD TO GO!' : rem + ' WORDS TO GO!';
    // the last ten seconds, huge
    var cd = root.querySelector('.bbcount');
    if (b.state === 1 && left > 0 && left <= 10 && !b.all) { if (!cd) { cd = H('div', 'bbcount'); root.appendChild(cd); } if (cd.textContent !== String(left)) { cd.textContent = left; cd.classList.remove('beat'); void cd.offsetWidth; cd.classList.add('beat'); snd('tick'); } }
    else if (cd) cd.remove();
  }
  function grid(B, b, opts) {
    opts = opts || {};
    var cs = opts.cell || 34, wrap = H('div', 'bbgrid' + (cs < 13 ? ' tiny' : ''));   // tiny: too small for clue numbers
    wrap.style.width = (B.cols * cs) + 'px'; wrap.style.height = (B.rows * cs) + 'px'; wrap.style.setProperty('--cs', cs + 'px');
    var mine = opts.mine >= 0 ? B.words[opts.mine] : null, mineCells = {};
    if (mine) cellsOf(mine).forEach(function (rc, k) { mineCells[rc[0] + ',' + rc[1]] = k; });
    var owned = function (i) { return i != null && b.owners[i] && b.owners[i].length; };
    Object.keys(B.cells).forEach(function (kk) {
      var g = B.cells[kk]; if (!owned(g.A) && !owned(g.D) && !(kk in mineCells)) return;
      var rc = kk.split(',').map(Number), on = (g.A != null && b.solved[g.A]) || (g.D != null && b.solved[g.D]);
      var cell = H('div', 'bbcell' + (on ? ' on' : '') + (kk in mineCells ? ' mine' : ''));
      cell.style.left = (rc[1] * cs) + 'px'; cell.style.top = (rc[0] * cs) + 'px';
      if (B.numAt[kk]) cell.appendChild(H('small', '', String(B.numAt[kk])));
      var showCh = on || (kk in mineCells && opts.shown && opts.shown(mineCells[kk]));
      if (showCh) cell.appendChild(H('b', '', g.ch));
      wrap.appendChild(cell);
    });
    // who found each word (class screen and the teacher's view)
    if (opts.names) B.words.forEach(function (it, i) { if (!b.solved[i] || !b.names[i]) return; var tg = H('span', 'bbwho', esc(b.names[i])); tg.style.left = (it.c * cs) + 'px'; tg.style.top = (it.r * cs - 16) + 'px'; wrap.appendChild(tg); });
    return wrap;
  }
  // cell size so the whole crossword fits w × h (the words are long, so a full class board is often 30+ cells across)
  function fitGrid(B, w, h, min) { return Math.max(min || 14, Math.min(46, Math.floor(Math.min(w / B.cols, h / B.rows)))); }

  function draw() {
    if (!root) return;
    var b = V.b, B = V.B, T = B.theme;
    var typed = {}, focus = document.activeElement && root.contains(document.activeElement) ? document.activeElement.getAttribute('aria-label') : null;
    [].forEach.call(root.querySelectorAll('input'), function (x) { typed[x.getAttribute('aria-label')] = x.value; });
    root.innerHTML = '';
    setTimeout(function () { if (!root) return; [].forEach.call(root.querySelectorAll('input'), function (x) { var k = x.getAttribute('aria-label'); if (typed[k]) x.value = typed[k]; if (k === focus) x.focus({ preventScroll: true }); }); nextBanner(); }, 0);
    var top = H('div', 'bbtop', '<span class="bbtitle">' + T.e + ' THE BIG BOARD <small>' + esc(T.name) + '</small></span><span class="bbprog"><b></b> words found</span><span class="bbbar"><i></i></span><span class="bbtogo" hidden></span><span class="bbclock"></span><button type="button" class="bbsnd" title="Sound effects">' + (soundOn() ? '🔊' : '🔇') + '</button>');
    root.appendChild(top);
    top.querySelector('.bbsnd').onclick = function () { SFA.store.set('board.sound', !soundOn()); this.textContent = soundOn() ? '🔊' : '🔇'; snd('gift'); };
    drawTop();
    if (b.all) { party(); }
    if (A.MODE !== 'student') return drawClass();
    var body = H('div', 'bbbody'); root.appendChild(body);
    var it = B.words[ST.w];
    if (!it && b.state === 1 && leftOf(b) < 60) {
      var hl = H('div', 'bbleft'), hbx = H('div', 'bbmine'); body.appendChild(hl); hl.appendChild(hbx);
      hbx.appendChild(H('p', 'bbclue', '<b>You made it for the last minute!</b> There\'s no time for a new word, so you\'re a helper: every right answer earns a gift letter for a classmate who is still looking.'));
      helper(hbx);
      var qh = H('div', 'bbq'); body.appendChild(qh); drawQ(qh); return;
    }
    if (!it) { body.appendChild(H('div', 'bbwait', b.state === 1 ? '<b>Getting your word…</b><p>Mr. Crowell\'s console hands out words every few seconds.</p>' : '<b>The Big Board is over.</b>')); return; }
    var left = H('div', 'bbleft'); body.appendChild(left);
    // my word: tiles, the clue, my letters and misses
    var mineBox = H('div', 'bbmine');
    mineBox.appendChild(H('p', 'bbclue', '<b>' + it.no + (it.d === 'A' ? ' across' : ' down') + '</b> · ' + esc(it.clue) + ' <span>(' + it.len + ' letters)</span>'));
    var tiles = H('div', 'bbtiles' + (it.len >= 10 ? ' long' : '')), free = freeLetters(B, ST.w, b.solved);
    for (var k = 0; k < it.len; k++) { var sh = shown(k); tiles.appendChild(H('span', 'bbtile' + (sh ? ' on' : '') + (sh && !ST.solved && ((free[k] && !ST.guessed[it.w[k]]) || (ST.gifted && ST.gifted[it.w[k]])) ? ' gift' : ''), sh ? it.w[k] : '')); }
    mineBox.appendChild(tiles);
    var solvedNow = ST.solved || b.solved[ST.w];
    if (solvedNow) { mineBox.appendChild(H('p', 'bbwin', '🎉 You found it! It\'s on the class board now, and its letters are helping the words that cross it.')); helper(mineBox); }
    else {
      mineBox.appendChild(H('p', 'bbstat', '🔤 <b>' + ST.credits + '</b> letter guess' + (ST.credits === 1 ? '' : 'es') + ' · a vowel costs 2 · misses ' + '●'.repeat(Math.min(ST.misses, 8)) + '<span class="off">' + '●'.repeat(Math.max(0, 5 - ST.misses % 5)) + '</span>'));
      if (Object.keys(free).length || (ST.gifted && Object.keys(ST.gifted).length)) mineBox.appendChild(H('p', 'bbgifttxt', '🎁 Gold letters came free from your classmates: words that cross yours, and gifts.'));
      // the letter keys
      var keys = H('div', 'bbkeys');
      'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').forEach(function (ch) {
        var used = ST.guessed[ch] != null, isV = VOWELS.indexOf(ch) >= 0, cost = isV ? 2 : 1;
        var bt = el('button', { type: 'button', 'class': 'bbkey' + (isV ? ' v' : '') + (used ? (ST.guessed[ch] ? ' hit' : ' miss') : '') + (!used && ST.credits < cost ? ' poor' : ''), text: ch });
        bt.disabled = used || b.state !== 1; bt.onclick = function () { guess(ch); };
        keys.appendChild(bt);
      });
      mineBox.appendChild(keys);
      // solve the whole word
      var row = H('div', 'row bbsolve'), inp = el('input', { type: 'text', placeholder: 'Know it? Type the whole word', 'aria-label': 'Solve your word', autocomplete: 'off' }), go = el('button', { type: 'button', 'class': 'btn primary', text: 'Solve' });
      var cd = Math.max(0, ST.solveCool - Date.now());
      if (cd) { go.disabled = true; go.textContent = 'Wait ' + Math.ceil(cd / 1000); setTimeout(function () { if (root) draw(); }, 1000); }
      go.onclick = function () { solve(inp.value); }; inp.onkeydown = function (e) { if (e.key === 'Enter') solve(inp.value); };
      row.appendChild(inp); row.appendChild(go); mineBox.appendChild(row);
    }
    left.appendChild(mineBox);
    // the class crossword, my word outlined
    var vw = window.innerWidth || 800, gb = H('div', 'bbmini'), cs = vw <= 820 ? fitGrid(B, vw - 64, 340, 9) : fitGrid(B, Math.min(600, vw * 0.44), 340, 10);
    gb.appendChild(grid(B, b, { cell: cs, mine: ST.w, shown: shown })); left.appendChild(gb);
    // questions: the only way to earn letters
    var qb = H('div', 'bbq'); body.appendChild(qb); drawQ(qb);
  }
  // helper mode: send a gift letter to a classmate who is still looking (words that cross mine first)
  function helper(box) {
    var b = V.b, B = V.B, me = B.words[ST.w], crossing = {};
    if (me) cellsOf(me).forEach(function (rc) { var g = B.cells[rc[0] + ',' + rc[1]], o = me.d === 'A' ? g.D : g.A; if (o != null) crossing[o] = 1; });
    var open = B.words.map(function (w, i) { return i; }).filter(function (i) { return i !== ST.w && b.owners[i] && b.owners[i].length && !b.solved[i]; })
      .sort(function (x, y) { return (crossing[y] ? 1 : 0) - (crossing[x] ? 1 : 0) || (b.gifts[x] || 0) - (b.gifts[y] || 0); });
    var hb = H('div', 'bbhelp'); box.appendChild(hb);
    hb.appendChild(H('p', 'bbhelpt', '🎁 <b>Helper mode.</b> Every right answer now earns a gift letter. You have <b>' + (ST.giftCred || 0) + '</b>. Send one to a classmate who is still looking:'));
    if (!open.length) { hb.appendChild(H('p', 'muted', 'Everyone else has found their word!')); return; }
    var list = H('div', 'bbhelpl'); hb.appendChild(list);
    open.slice(0, 12).forEach(function (i) {
      var it = B.words[i], bt = el('button', { type: 'button', 'class': 'btn small' + (crossing[i] ? ' cross' : ''), text: (b.names[i] || 'Someone') + ' · ' + it.no + (it.d === 'A' ? 'A' : 'D') + (crossing[i] ? ' · crosses yours' : '') });
      bt.disabled = !(ST.giftCred > 0) || b.state !== 1;
      bt.onclick = function () { if (!(ST.giftCred > 0)) return; ST.giftCred--; ST.gifts = (ST.gifts || []).concat([i]).slice(-80); keep(); send(); snd('gift'); SFA.toast('🎁 Sent a letter to ' + (b.names[i] || 'a classmate') + '!', 2500); draw(); };
      list.appendChild(bt);
    });
  }
  /* the first five questions are warm-ups: integers in two steps (order of operations, negatives in every one), climbing
     from multiply-then-add to three steps with brackets, so everyone uncovers letters early but has to think. Each level
     has two forms; the form and the numbers differ for each student. Then the spiral review takes over. */
  var EASY_N = 5;
  function easyQs() {
    var r = rng((A.S.me ? parseInt(sh3(A.S.me.sid), 36) * 31 : 7) + Math.round((ST.id || 0) / 1000) % 9973), n = function (a, b) { return a + Math.floor(r() * (b - a + 1)); };
    var m = function (v) { return v < 0 ? '(−' + (-v) + ')' : String(v); }, w = function (v) { return v < 0 ? '−' + (-v) : String(v); };
    var L = [
      [   // 1: multiply, then add
        function () { var a = n(2, 6), b = n(3, 9), c = n(2, 12), p = -a * b; return { q: w(-a) + ' × ' + b + ' + ' + c, ans: p + c, why: 'Multiply first: ' + w(-a) + ' × ' + b + ' = ' + w(p) + '. Then ' + w(p) + ' + ' + c + ' = ' + w(p + c) + '.' }; },
        function () { var c = n(5, 15), a = n(2, 5), b = n(2, 6), p = -a * b; return { q: c + ' + ' + a + ' × ' + m(-b), ans: c + p, why: 'Multiply first: ' + a + ' × ' + m(-b) + ' = ' + w(p) + '. Then ' + c + ' + ' + m(p) + ' = ' + w(c + p) + '.' }; }
      ],
      [   // 2: divide or multiply, then subtract
        function () { var d = n(2, 6), k = n(2, 8), e = n(2, 9); return { q: m(-d * k) + ' ÷ ' + d + ' − ' + m(-e), ans: -k + e, why: m(-d * k) + ' ÷ ' + d + ' = ' + w(-k) + '. Taking away ' + w(-e) + ' is the same as adding ' + e + ': ' + w(-k) + ' + ' + e + ' = ' + w(e - k) + '.' }; },
        function () { var a = n(2, 6), b = n(2, 6), c = a * b + n(1, 12); return { q: m(-a) + ' × ' + m(-b) + ' − ' + c, ans: a * b - c, why: 'Negative times negative is positive: ' + m(-a) + ' × ' + m(-b) + ' = ' + a * b + '. Then ' + a * b + ' − ' + c + ' = ' + w(a * b - c) + '.' }; }
      ],
      [   // 3: two products, then combine
        function () { var a = n(2, 5), b = n(2, 7), c = n(2, 6), d = n(2, 5), p = -a * b, q = -c * d; return { q: a + ' × ' + m(-b) + ' − ' + m(-c) + ' × ' + d, ans: p - q, why: a + ' × ' + m(-b) + ' = ' + w(p) + ' and ' + m(-c) + ' × ' + d + ' = ' + w(q) + '. Then ' + w(p) + ' − ' + m(q) + ' = ' + w(p) + ' + ' + (-q) + ' = ' + w(p - q) + '.' }; },
        function () { var a = n(2, 6), b = n(2, 6), c = n(2, 5), d = n(2, 6), p = -a * b, q = c * d; return { q: m(-a) + ' × ' + b + ' + ' + m(-c) + ' × ' + m(-d), ans: p + q, why: m(-a) + ' × ' + b + ' = ' + w(p) + ' and ' + m(-c) + ' × ' + m(-d) + ' = ' + q + '. Then ' + w(p) + ' + ' + q + ' = ' + w(p + q) + '.' }; }
      ],
      [   // 4: brackets first
        function () { var x = n(1, 6), y = x + n(3, 9), c = n(2, 6), s = x - y; return { q: '(' + x + ' − ' + y + ') × ' + m(-c), ans: s * -c, why: 'Brackets first: ' + x + ' − ' + y + ' = ' + w(s) + '. Then ' + m(s) + ' × ' + m(-c) + ' = ' + s * -c + ' (negative times negative is positive).' }; },
        function () { var c = n(2, 6), k = n(2, 7), t = -k * c, y = n(2, 9), x = t - y; return { q: '(' + w(x) + ' + ' + y + ') ÷ ' + m(-c), ans: k, why: 'Brackets first: ' + w(x) + ' + ' + y + ' = ' + w(t) + '. Then ' + m(t) + ' ÷ ' + m(-c) + ' = ' + k + ' (negative divided by negative is positive).' }; }
      ],
      [   // 5: three steps
        function () { var a = n(2, 9), b = n(2, 5), c = n(1, 5), d = c + n(3, 8), s = c - d, p = b * s; return { q: a + ' − ' + b + ' × (' + c + ' − ' + d + ')', ans: a - p, why: 'Brackets: ' + c + ' − ' + d + ' = ' + w(s) + '. Multiply: ' + b + ' × ' + m(s) + ' = ' + w(p) + '. Then ' + a + ' − ' + m(p) + ' = ' + a + ' + ' + (-p) + ' = ' + w(a - p) + '.' }; },
        function () { var a = n(2, 6), b = n(2, 6), d = n(2, 5), e = n(2, 6), c = d * e, p = -a * b; return { q: m(-a) + ' × ' + b + ' − ' + c + ' ÷ ' + m(-d), ans: p + e, why: m(-a) + ' × ' + b + ' = ' + w(p) + ' and ' + c + ' ÷ ' + m(-d) + ' = ' + w(-e) + '. Then ' + w(p) + ' − ' + m(-e) + ' = ' + w(p) + ' + ' + e + ' = ' + w(p + e) + '.' }; }
      ]
    ];
    return L.slice(0, EASY_N).map(function (forms, i) {
      var o = forms[r() < 0.5 ? 0 : 1]();
      return { k: 'number', q: 'What is *' + o.q + '*?', ans: o.ans, why: o.why, from: 'warm-up', easy: true, lv: i + 1 };
    });
  }
  function drawQ(box) {
    box.innerHTML = '';
    if (V.b.state !== 1) { box.appendChild(H('p', 'q', 'Time is up.')); return; }
    if (!ST.easy) { ST.easy = easyQs(); ST.ei = 0; keep(); }
    var warm = ST.ei < ST.easy.length;
    if (!warm && !POOL) { box.appendChild(H('p', 'q', 'Loading questions…')); return; }
    if (!warm && !POOL.length) { box.appendChild(H('p', 'q', 'No questions found.')); return; }
    var q = warm ? ST.easy[ST.ei] : POOL[ST.qi % POOL.length];
    var lv = q.lv || 1, big = !warm && lv >= 3;   // levels 3 and 4: right first time earns 2 letter guesses
    box.appendChild(H('p', 'kick', (warm ? '🌱 Warm-up ' + (ST.ei + 1) + ' of ' + ST.easy.length + ' · integers · answer to earn letters' : 'Level ' + lv + ' of 4 · ' + '★'.repeat(lv) + (big ? ' · right first time: 2 letters' : '') + ' · from ' + esc(q.from || 'earlier')) + (ST.streak >= 2 ? ' · 🔥 ' + ST.streak + ' in a row' : '')));
    box.appendChild(H('p', 'q', A.fmt(q.q)));
    if (q.fig) { var f = H('div', 'cfig'); try { f.appendChild(A.figure(q.fig)); box.appendChild(f); } catch (e) { } }
    if (ST.fb) {
      box.appendChild(H('div', ST.fb.ok ? 'fb good' : 'fb try', ST.fb.html));
      var wait = Math.max(0, ST.cool - Date.now()), nx = el('button', { type: 'button', 'class': 'btn primary', text: wait ? 'Next in ' + Math.ceil(wait / 1000) : 'Next question ▶' });
      if (wait) { nx.disabled = true; setTimeout(function () { if (root) draw(); }, 1000); }
      nx.onclick = function () { ST.fb = null; if (ST.easy && ST.ei < ST.easy.length) ST.ei++; else ST.qi++; ST.tries = 0; keep(); draw(); };
      box.appendChild(nx); return;
    }
    function right() {
      var first = !ST.tries; ST.streak = first ? ST.streak + 1 : 0; ST.right++; xp(warm ? 4 : first ? 10 : 5);
      var bonus = first && big, three = first && ST.streak % 3 === 0;
      var got = (bonus ? 2 : 1) + (three ? 1 : 0), helping = ST.solved || V.b.solved[ST.w] || ST.w < 0;
      if (helping) ST.giftCred = (ST.giftCred || 0) + got; else ST.credits += got;
      ST.fb = { ok: true, html: '<b>Yes! +' + got + (helping ? ' gift letter' + (got > 1 ? 's' : '') + ' to send' : ' letter guess' + (got > 1 ? 'es' : '')) + '.</b>' + (bonus ? ' ⭐ Level ' + lv + ' bonus!' : '') + (three ? ' 🔥 Three in a row!' : '') };
      sendSoon(); keep(); draw();
    }
    function wrong() { xp(1); ST.streak = 0; ST.cool = Date.now() + 4000; ST.fb = { ok: false, html: '<b>The answer is ' + esc(q.k === 'poll' ? A.letter(q.ans) : A.numTxt(q.ans)) + '.</b> ' + A.fmt(q.why || '') }; keep(); draw(); }
    if (q.k === 'number') {
      var inp = el('input', { type: 'text', inputmode: 'decimal', placeholder: 'Type a number', 'aria-label': 'Answer', autocomplete: 'off' }), go = el('button', { type: 'button', 'class': 'btn primary', text: 'Check' }), row = H('div', 'row');
      row.appendChild(inp); row.appendChild(go); box.appendChild(row);
      if (ST.tries) box.appendChild(H('p', 'state', 'Not yet: one more try.'));
      var check = function () { var v = A.numOf(inp.value); if (!inp.value.trim() || isNaN(v)) return inp.focus(); if (Math.abs(v - q.ans) <= (q.tol || 1e-9) + 1e-9) right(); else if (!ST.tries) { ST.tries = 1; keep(); draw(); } else wrong(); };
      go.onclick = check; inp.onkeydown = function (e) { if (e.key === 'Enter') check(); };
    } else {
      var list = H('div', 'opts'); box.appendChild(list);
      q.opts.forEach(function (o, k) { var bt = el('button', { type: 'button', 'class': 'opt' }); bt.appendChild(H('span', 'L', A.letter(k))); bt.appendChild(H('span', 't', A.fmt(o))); bt.onclick = function () { if (k === q.ans) right(); else wrong(); }; list.appendChild(bt); });
    }
  }
  function guess(ch) {
    var it = V.B.words[ST.w], cost = VOWELS.indexOf(ch) >= 0 ? 2 : 1;
    if (!it || ST.guessed[ch] != null) return;
    if (ST.credits < cost) { SFA.toast(cost === 2 ? 'A vowel costs 2 letter guesses. Answer a question to earn more.' : 'Answer a question to earn a letter guess.'); return; }
    ST.credits -= cost; var hit = it.w.indexOf(ch) >= 0; ST.guessed[ch] = hit;
    if (!hit) {
      ST.misses++;
      if (ST.misses % 5 === 0) {   // every fifth miss, a free letter so nobody gets stuck
        var hidden = []; for (var k = 0; k < it.len; k++) if (!shown(k)) hidden.push(it.w[k]);
        if (hidden.length) { var gift = hidden[Math.floor(Math.random() * hidden.length)]; ST.guessed[gift] = true; SFA.toast('🎁 Five misses: here\'s a free letter, ' + gift + '.', 3500); }
      }
    }
    var all = true; for (var j = 0; j < it.len; j++) if (!shown(j)) all = false;
    if (all) { ST.solved = true; A.confetti(); send(); } else sendSoon();
    keep(); draw();
  }
  function solve(txt) {
    var it = V.B.words[ST.w], t = String(txt || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!it || !t) return;
    if (t === it.w) { ST.solved = true; A.confetti(); keep(); send(); draw(); return; }
    ST.misses++; ST.solveCool = Date.now() + 8000; keep(); sendSoon(); SFA.toast('Not quite. Try again in a few seconds.', 2500); draw();
  }

  // the class screen (and the teacher's view): the whole crossword, who found what, and the clues still open
  function drawClass() {
    var b = V.b, B = V.B, body = H('div', 'bbclass'); root.appendChild(body);
    var w = (window.innerWidth || 1000) * ((window.innerWidth || 1000) <= 820 ? 0.92 : A.MODE === 'screen' ? 0.63 : 0.6), h = Math.max(240, (window.innerHeight || 700) - 110);
    var gw = H('div', 'bbbig'); gw.appendChild(grid(B, b, { cell: fitGrid(B, w, h), names: true })); body.appendChild(gw);
    var side = H('div', 'bbside'); body.appendChild(side);
    var sc = solvedCount(b, B), pc = document.createElement('canvas'); pc.className = 'bbpic'; pc.width = 480; pc.height = 300; picture(pc, B.theme, b.all ? 1 : sc.of ? sc.n / sc.of : 0, b.seed); side.appendChild(H('p', 'bbpict', b.all ? '🖼️ The mystery picture!' : '🖼️ Mystery picture: every word found uncovers more'));
    side.appendChild(pc);
    var cl = H('div', 'bbclues'), open = B.words.filter(function (it, i) { return b.owners[i] && b.owners[i].length && !b.solved[i]; });
    cl.appendChild(H('h3', '', open.length ? 'Still to find' : 'Every word found!'));
    open.slice(0, 18).forEach(function (it) { cl.appendChild(H('p', '', '<b>' + it.no + (it.d === 'A' ? 'A' : 'D') + '</b> ' + esc(it.clue) + ' <span>(' + it.len + ')</span>')); });
    if (open.length > 18) cl.appendChild(H('p', 'muted', '…and ' + (open.length - 18) + ' more'));
    side.appendChild(cl);
    if (V.watch) { var x = el('button', { type: 'button', 'class': 'btn bbback', text: '✕ Back to the console' }); x.onclick = function () { close(); }; root.appendChild(x); }
  }

  // a picture made of the theme's emoji, under 24 tiles that come off as the class finds words
  function picture(cv, T, frac, seed) {
    var c = cv.getContext('2d'), W = cv.width, Hh = cv.height, r = rng(seed * 13 + 5), em = PIC[T.id] || ['⭐'];
    var g = c.createLinearGradient(0, 0, W, Hh); g.addColorStop(0, '#2b3570'); g.addColorStop(1, '#7a3e9e'); c.fillStyle = g; c.fillRect(0, 0, W, Hh);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (var i = 0; i < 26; i++) { c.font = Math.round(26 + r() * 30) + 'px serif'; c.fillText(em[i % em.length], r() * W, r() * Hh); }
    c.font = '150px serif'; c.fillText(T.e, W / 2, Hh / 2 + 8);
    c.font = '400 34px "Luckiest Guy", sans-serif'; c.fillStyle = '#FFE14D'; c.strokeStyle = '#1b1a22'; c.lineWidth = 6; c.strokeText('WELL DONE, CLASS!', W / 2, Hh - 30); c.fillText('WELL DONE, CLASS!', W / 2, Hh - 30);
    var cols = 6, rows = 4, tw = W / cols, th = Hh / rows, order = shuffle(Array.from({ length: cols * rows }, function (x, i) { return i; }), r), off = Math.round(frac * cols * rows);
    order.slice(off).forEach(function (t) { var x = (t % cols) * tw, y = Math.floor(t / cols) * th; c.fillStyle = '#151a33'; c.fillRect(x + 1, y + 1, tw - 2, th - 2); c.fillStyle = '#39406a'; c.font = '400 30px "Luckiest Guy", sans-serif'; c.fillText('?', x + tw / 2, y + th / 2 + 2); });
  }
  // every word found: the whole class celebrates
  function party() {
    if (V.partyEl) { root.appendChild(V.partyEl); return; }
    var p = H('div', 'bbparty', '<div class="in"><h1>EVERY WORD FOUND!</h1><p>The whole class cracked the Big Board. ' + (V.b.names.filter(Boolean).length) + ' words, ' + (V.b.names.filter(Boolean).length) + ' heroes.</p><div class="bbnames">' + V.b.names.filter(Boolean).map(function (n) { return '<span>' + esc(n) + '</span>'; }).join('') + '</div></div>');
    var parade = H('div', 'bbparade');
    if (window.SFA_SPRITES && window.SFA_SPRITES.ready && SFA_SPRITES.ready()) ['gus', 'one', 'zero', 'sam', 'pigeon', 'max', 'priya', 'marcus'].forEach(function (w, i) {
      var s = SFA_SPRITES.get(w); if (!s) return; var cv = document.createElement('canvas'), k = Math.min(90 / s.w, 120 / s.h); cv.width = Math.round(s.w * k); cv.height = Math.round(s.h * k); cv.getContext('2d').drawImage(s.frames[0], 0, 0, cv.width, cv.height); cv.style.animationDelay = (i * 0.35) + 's'; parade.appendChild(cv);
    });
    p.appendChild(parade); root.appendChild(p); V.partyEl = p;
    snd('party'); var n = 0; (function boom() { if (!root || n++ > 6) return; A.confetti(); setTimeout(boom, 900); })();
  }

  /* =========================== the teacher console =========================== */
  function C() { return A.console_().board; }
  function active() {   // students here today: anyone with a row in this run of the lesson
    var ids = {}; A.rosterIn().forEach(function (r) { ids[r.sid] = r; });
    var here = {}; (A.consoleAnswers() || []).forEach(function (a) { if (ids[a.sid] && !A.beforeRun(a)) here[a.sid] = 1; });
    return Object.keys(here).map(function (s) { return ids[s]; });
  }
  function start(theme, mins) {
    var who = active(), r = rng(Date.now() % 100000), order = shuffle(who, r);
    var n = Math.max(6, Math.min(MAXW, order.length + SPARE)), t = Math.round(Date.now() / 1000) * 1000;
    var K = A.console_().board = { id: t, state: 1, theme: theme, seed: 1 + Math.floor(r() * 9000), n: n, dur: Math.round((mins || 6) * 60), owners: [], solved: {}, last: 0, lastPush: 0 };
    var B = build(K.theme, K.seed, K.n); K.n = B.words.length;
    // students get the shorter words; the longest are left as spares for anyone who arrives late
    var idx = B.words.map(function (w, i) { return i; }).sort(function (a, b) { return B.words[a].len - B.words[b].len; });
    order.forEach(function (s, i) { K.owners[idx[i]] = [s.sid]; });
    for (var i = 0; i < K.n; i++) K.owners[i] = K.owners[i] || [];
    A.pushLive(); A.consolePanel();
  }
  function nameOf(sid) { var r = A.rosterIn().filter(function (x) { return x.sid === sid; })[0]; return r ? A.first(r.name).replace(/[^A-Za-zÀ-ÿ' -]/g, '').slice(0, 10) : ''; }
  function agg() {
    var K = C(); if (!K || K.state !== 1) return;
    if (!resolveOwners(K)) return;   // not before the roster is in: everyone would look new
    var key2 = 'id:' + Math.round(K.id / 1000) + ';', last = {}, changed = false;
    (A.consoleAnswers() || []).forEach(function (a) { if (a.q === QID && String(a.answer).indexOf(key2) >= 0 && (!last[a.sid] || String(a.time) >= String(last[a.sid].time))) last[a.sid] = a; });
    K.prog = K.prog || {};
    var gifts = [];
    Object.keys(last).forEach(function (sid) {
      var s = String(last[sid].answer), get = function (k) { var m = s.match(new RegExp(';' + k + ':(-?\\d+)')); return m ? +m[1] : 0; };
      var w = get('w'), mineAt = -1; K.owners.forEach(function (o, i) { if (o.indexOf(sid) >= 0) mineAt = i; });
      // gift letters count from everyone, helpers without a word too
      ((s.match(/;gv:([0-9.]*)/) || [, ''])[1]).split('.').filter(Boolean).forEach(function (t) { var ti = +t; if (ti >= 0 && ti < K.n) gifts[ti] = (gifts[ti] || 0) + 1; });
      if (mineAt < 0) {   // someone new: a spare word, or share an unsolved one; in the last minute, no new words (they help instead)
        if (K.id + K.dur * 1000 - Date.now() < 60000) return;
        var spare = K.owners.findIndex(function (o) { return !o.length; });
        if (spare < 0) { var open = K.owners.map(function (o, i) { return i; }).filter(function (i) { return !K.solved[i]; }); spare = open.length ? open[Math.floor(Math.random() * open.length)] : 0; }
        K.owners[spare].push(sid); changed = true; return;
      }
      K.prog[sid] = { w: mineAt, k: get('k'), r: get('r'), m: get('m') };
      if (w === mineAt && get('s') === 1 && !K.solved[mineAt]) { K.solved[mineAt] = 1; changed = true; }
    });
    for (var gi = 0; gi < K.n; gi++) if ((gifts[gi] || 0) > ((K.gifts || [])[gi] || 0)) { K.gifts = K.gifts || []; K.gifts[gi] = gifts[gi]; changed = true; }
    var owned = 0, done = 0; K.owners.forEach(function (o, i) { if (o.length) { owned++; if (K.solved[i]) done++; } });
    if (owned && done === owned) { K.all = true; end(); return; }
    if (changed) { (A.pushNow || A.pushLive)(); A.consolePanel(); }
  }
  function end() { var K = C(); if (!K) return; if (K.state === 1 && A.trophy) { var TT = THEMES[K.theme % THEMES.length], own = 0, sol = 0; (K.owners || []).forEach(function (o, i) { if (o.length) { own++; if (K.solved[i]) sol++; } }); A.trophy({ k: 'board', id: K.id, win: !!K.all, theme: TT.e + ' ' + TT.name, found: sol, of: own }); } K.state = 2; K.endedAt = Date.now(); A.pushLive(); A.consolePanel(); }
  function tick() {
    var K = C(); if (!K) return;
    if (K.state === 1 && Date.now() >= K.id + K.dur * 1000) end();
    if (Date.now() - K.lastPush >= PUSH_MS * 4) { K.lastPush = Date.now(); (A.pushNow || A.pushLive)(); }
    if (root && V && V.watch) { var b = watchState(), sig = [b.state, b.all, Object.keys(b.solved).join('.'), b.owners.join(',')].join('|'); V.b = b; if (sig !== V.sig) { V.sig = sig; draw(); } }
  }
  function counts(out) {
    var K = C(); if (!K) return;
    out.zbid = A.encRun(K.id); out.zbst = A.encRun(K.id + (A.console_().skew || 0));
    out.zbs = [K.state, K.theme, K.seed, K.n, Math.min(9999, K.dur), K.all ? 1 : 0];
    if (K.gifts && K.gifts.length) for (var g = 0; g * 12 < K.n; g++) { var ga = []; for (var j = 0; j < 12 && g * 12 + j < K.n; j++) ga.push(Math.min(9999, (K.gifts[g * 12 + j] || 0))); out['zbg' + g] = ga; }
    for (var k = 0; k * 13 * 12 < K.n; k++) { var arr = []; for (var j = 0; j < 12; j++) { var v = 0; for (var b = 0; b < 13; b++) if (K.solved[k * 156 + j * 13 + b]) v |= 1 << b; arr.push(v); if (k * 156 + (j + 1) * 13 >= K.n) break; } out['zbw' + k] = arr; }
  }
  function spot() {
    var K = C(), A2 = K.pendingFp ? K.pendingFp.map(function (o) { return o.join('+'); }).join(',') : K.owners.map(function (o) { return o.map(sh3).join('+'); }).join(','),
      N = K.pendingFp ? (K.pendingNames || []).join(',') : K.owners.map(function (o) { return o.length ? nameOf(o[0]) : ''; }).join(',');
    return { q: 'zboard', text: ('A:' + A2 + '#N:' + N).slice(0, 600) };
  }
  function restore(Lv) {
    var b = boardOf(Lv); if (!b) return false;
    if (b.state === 2 || Date.now() - b.id > b.dur * 1000 + 60000) { A.console_().board = null; return false; }
    A.console_().board = { pendingFp: b.owners, pendingNames: b.names, id: b.id, state: b.state, theme: b.theme, seed: b.seed, n: b.n, dur: b.dur, all: b.all, solved: b.solved, gifts: b.gifts.slice(), owners: [], lastPush: 0 };
    resolveOwners(A.console_().board);
    return true;
  }
  // after a console reload the board knows its students only by fingerprint: match them once the roster has loaded
  function resolveOwners(K) {
    if (!K.pendingFp) return true;
    var roster = A.rosterIn(); if (!roster.length) { K.owners = K.pendingFp.map(function () { return []; }); return false; }
    var bySh = {}; roster.forEach(function (r) { bySh[sh3(r.sid)] = r.sid; });
    K.owners = K.pendingFp.map(function (o) { return o.map(function (f) { return bySh[f]; }).filter(Boolean); });
    for (var i = K.owners.length; i < K.n; i++) K.owners.push([]);
    delete K.pendingFp; delete K.pendingNames; return true;
  }
  function watchState() { var K = C(); return { id: K.id, start: K.id, state: K.state, theme: K.theme, seed: K.seed, n: K.n, dur: K.dur, all: !!K.all, solved: K.solved, gifts: (K.gifts || []).slice(), owners: K.owners.map(function (o) { return o.map(sh3); }), names: K.owners.map(function (o) { return o.length ? nameOf(o[0]) : ''; }) }; }
  function watch() { var b = watchState(); open(b); V.watch = true; V.b = b; draw(); }
  function section(p) {
    var K = C(), sec = H('div', 'sect'), B = build(K.theme, K.seed, K.n), T = B.theme;
    sec.appendChild(H('h3', '', T.e + ' The Big Board · ' + esc(T.name)));
    var owned = K.owners.filter(function (o) { return o.length; }).length, done = Object.keys(K.solved).filter(function (i) { return K.owners[i] && K.owners[i].length; }).length, left = Math.max(0, Math.round((K.id + K.dur * 1000 - Date.now()) / 1000));
    sec.appendChild(H('p', '', (K.state === 1 ? '<b>' + Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2) + '</b> left · ' : K.all ? '<b>🎉 Every word found!</b> · ' : '<b>Time.</b> ') + '<b>' + done + ' of ' + owned + '</b> words found · ' + B.words.length + ' words in the crossword'));
    // who is where: stuck students first
    var rows = [];
    K.owners.forEach(function (o, i) { o.forEach(function (sid) { var pr = (K.prog || {})[sid] || { k: 0, r: 0 }; rows.push({ n: nameOf(sid), sid: sid, w: B.words[i], done: !!K.solved[i], k: pr.k, r: pr.r }); }); });
    rows.sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || a.k / a.w.len - b.k / b.w.len; });
    var who = rows.length ? H('p', 'muted', rows.map(function (x) { return (x.done ? '✅ ' : '🔤 ') + esc(x.n) + (x.done ? '' : ' ' + x.k + '/' + x.w.len + (x.r ? ' · ' + x.r + '✓' : '')); }).join(' · ')) : null;
    var r = H('div', 'row');
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: '👁 Show the board', title: 'The whole crossword on this screen', onclick: function () { watch(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: '⏰ +1 minute', onclick: function () { K.dur += 60; A.pushLive(); A.consolePanel(); } }));
    if (K.state === 1) r.appendChild(el('button', { type: 'button', 'class': 'btn', text: 'End it now', onclick: function () { end(); } }));
    r.appendChild(el('button', { type: 'button', 'class': 'btn primary', text: 'Back to the lesson', onclick: function () { A.console_().board = null; if (root) close(); A.pushLive(); A.consolePanel(); } }));
    sec.appendChild(r);
    if (who) { var stuck = rows.filter(function (x) { return !x.done; }).length, dw = dfold('g-board', '🔤 Who' + "'" + 's where · ' + stuck + ' still working', false); dw.appendChild(who); sec.appendChild(dw); }
    p.appendChild(sec);
  }
  function dfold(key, title, open) { if (A.fold) return A.fold(key, title, open); var d = el('details', { 'class': 'sect fold' }); d.appendChild(el('summary', {}, [H('h3', '', title)])); d.open = !!open; return d; }
  (A.every || function (f, ms) { setInterval(f, ms); })(function () { if (A.MODE === 'teach' && A.console_() && C()) tick(); }, 1000);

  window.SFA_BOARD = { sync: sync, agg: agg, section: section, start: start, counts: counts, spot: spot, restore: restore, boardOf: boardOf, build: build, THEMES: THEMES };
})();
