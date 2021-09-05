const escapeRegExp = require('escape-string-regexp')

function escapeRegExpFixed(str: string): string {
  return escapeRegExp(str).replace('-', '\\-');
}

/**
 * A generator function that takes a string and returns an iterator of the separate words in the
 * given string.
 */
export function* tokenizer(str: string, wordSeparators: string): IterableIterator<string> {
  const wordSeparatorsRegExp = new RegExp(`[${escapeRegExpFixed(wordSeparators)}\\s]`)

  let tokenStartIndex
  for (let i = 0; i < str.length; i++) {
    const currentCharacter = str[i]
    const currentCharacterIsAWordSeparator = wordSeparatorsRegExp.test(currentCharacter)

    if (!currentCharacterIsAWordSeparator && tokenStartIndex === undefined) {
      tokenStartIndex = i
    } else if (currentCharacterIsAWordSeparator && tokenStartIndex !== undefined) {
      yield str.slice(tokenStartIndex, i)

      tokenStartIndex = undefined
    }
  }

  if (tokenStartIndex !== undefined) {
    yield str.slice(tokenStartIndex, str.length)
  }
}
