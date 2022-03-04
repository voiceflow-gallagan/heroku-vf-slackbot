const emojiRegex = /:[^:\s]*(?:::[^:\s]*)*:/g
export const stripEmojis = (text) => text.replace(emojiRegex, '').trim()

const backslashRegex = /\\n|\\r/g
export function stripBackSlashs(text) {
  text = text.replace(/&quot;/g, '"')
  text = text.replace(backslashRegex, '\n')
  return text
}

const cleanRegex = /\t/g
export const cleanText = (text) => text.replace(cleanRegex, '').trim()
