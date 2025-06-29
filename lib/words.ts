import { dbOperations } from './supabase'

export const WORD_CATEGORIES = {
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

// Use database function for getting random words
export async function getRandomWords(count: number = 3, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<string[]> {
  try {
    const words = await dbOperations.getRandomWords(count, undefined, difficulty)
    return words.map(w => w.word)
  } catch (error) {
    console.error('Failed to get words from database, using fallback:', error)
    // Fallback to local words if database fails
    const allWords = Object.values(WORD_CATEGORIES).flat()
    const shuffled = allWords.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }
}

export function getWordsByCategory(category: keyof typeof WORD_CATEGORIES, count: number = 3): string[] {
  const words = WORD_CATEGORIES[category]
  const shuffled = words.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function getDifficultyLevel(word: string): 'easy' | 'medium' | 'hard' {
  if (word.length <= 4) return 'easy'
  if (word.length <= 7) return 'medium'
  return 'hard'
}

export function getWordHint(word: string, revealCount: number = 0): string {
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