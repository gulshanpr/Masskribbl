const WORD_CATEGORIES = {
  animals: [
    'cat', 'dog', 'elephant', 'giraffe', 'lion', 'tiger', 'bear', 'rabbit', 'horse', 'cow',
    'pig', 'sheep', 'chicken', 'duck', 'fish', 'shark', 'whale', 'dolphin', 'octopus', 'butterfly',
    'bee', 'spider', 'snake', 'frog', 'turtle', 'penguin', 'owl', 'eagle', 'parrot', 'flamingo'
  ],
  objects: [
    'car', 'house', 'tree', 'flower', 'book', 'phone', 'computer', 'chair', 'table', 'lamp',
    'clock', 'key', 'door', 'window', 'mirror', 'camera', 'guitar', 'piano', 'bicycle', 'airplane',
    'boat', 'train', 'bus', 'umbrella', 'hat', 'shoes', 'glasses', 'watch', 'ring', 'necklace'
  ],
  food: [
    'pizza', 'burger', 'cake', 'ice cream', 'apple', 'banana', 'orange', 'strawberry', 'grape', 'watermelon',
    'bread', 'cheese', 'milk', 'coffee', 'tea', 'water', 'juice', 'sandwich', 'pasta', 'rice',
    'chicken', 'fish', 'egg', 'salad', 'soup', 'cookie', 'chocolate', 'candy', 'donut', 'pancake'
  ],
  actions: [
    'running', 'jumping', 'dancing', 'singing', 'reading', 'writing', 'drawing', 'painting', 'cooking', 'eating',
    'sleeping', 'walking', 'swimming', 'flying', 'driving', 'climbing', 'falling', 'laughing', 'crying', 'smiling',
    'waving', 'clapping', 'pointing', 'thinking', 'dreaming', 'playing', 'working', 'studying', 'teaching', 'learning'
  ],
  nature: [
    'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'wind', 'fire', 'water', 'earth',
    'mountain', 'river', 'ocean', 'forest', 'desert', 'island', 'volcano', 'rainbow', 'lightning', 'thunder',
    'beach', 'cave', 'valley', 'hill', 'lake', 'pond', 'stream', 'waterfall', 'rock', 'stone'
  ]
}

function getRandomWords(count = 3, difficulty = 'medium') {
  const allWords = Object.values(WORD_CATEGORIES).flat()
  const shuffled = allWords.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function getWordHint(word, revealCount = 0) {
  if (revealCount === 0) {
    return word.replace(/[a-zA-Z]/g, '_')
  }
  
  const letters = word.split('')
  const indicesToReveal = []
  
  // Always reveal first letter
  indicesToReveal.push(0)
  
  // Reveal random letters based on revealCount
  for (let i = 1; i < Math.min(revealCount, word.length); i++) {
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * word.length)
    } while (indicesToReveal.includes(randomIndex))
    indicesToReveal.push(randomIndex)
  }
  
  return letters.map((letter, index) => 
    indicesToReveal.includes(index) ? letter : '_'
  ).join('')
}

module.exports = {
  WORD_CATEGORIES,
  getRandomWords,
  getWordHint
}