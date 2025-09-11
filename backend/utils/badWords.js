const BAD_WORDS = [
  'stupid','idiot','dumb','nonsense','hate','trash','garbage',
  'ugly','awful','terrible','scam','fraud','fake','cheat',
  'disgusting','bitch','fuck','shit','asshole','cunt','bastard',
  'dick','prick','piss','fucking','shitty','bullshit','motherfucker','dumbass'
];

function containsBadWords(text) {
  if (!text) return false;
  const lower = String(text).toLowerCase();
  return BAD_WORDS.some(w => lower.includes(w.toLowerCase()));
}

module.exports = { BAD_WORDS, containsBadWords };


