const emojiRegex = /:[^:\s]*(?:::[^:\s]*)*:/g
// eslint-disable-next-line import/prefer-default-export
export const stripEmojis = (text) => text.replace(emojiRegex, '').trim()

const backslashRegex = /\\n|\\r/g
// eslint-disable-next-line import/prefer-default-export
export function stripBackSlashs(text) {
  text = text.replace(/&quot;/g, '"')
  text = text.replace(backslashRegex, '\n')
  return text
}

const cleanRegex = /\t/g
// eslint-disable-next-line import/prefer-default-export
export const cleanText = (text) => text.replace(cleanRegex, '').trim()
