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

export const CHIP_ACTION_REGEX = new RegExp(/chip:(.+):(.+)/i)
export const ANY_WORD_REGEX = new RegExp(/(.+)/i)

export function cleanEmail(text) {
  let email = text.match(/([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
  let result = text
  if (email) {
    email = email[0]
    result = text.split('<')[0]
    result = result + email + text.split('>')[1]
  }
  return result
}
