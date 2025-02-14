// Use localStorage to persist custom emojis
export const customEmojiStorage = {
  get: () => {
    try {
      const stored = localStorage.getItem('customEmojis')
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error('Error loading custom emojis:', e)
      return []
    }
  },
  
  add: (newEmoji) => {
    try {
      const current = customEmojiStorage.get()
      const updated = [...current, newEmoji]
      localStorage.setItem('customEmojis', JSON.stringify(updated))
      return updated
    } catch (e) {
      console.error('Error saving custom emoji:', e)
      return []
    }
  }
} 