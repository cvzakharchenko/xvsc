const escapeRegExp = require('escape-string-regexp')

function escapeRegExpFixed(str: string): string {
  return escapeRegExp(str).replace('-', '\\-');
}

/**
 * Removes characters from wordSeparators that should be ignored
 */
function removeIgnoredSeparators(wordSeparators: string, ignoreWordSeparators: string): string {
  if (!ignoreWordSeparators) {
    return wordSeparators;
  }

  let result = wordSeparators;
  for (let i = 0; i < ignoreWordSeparators.length; i++) {
    result = result.replace(ignoreWordSeparators[i], '');
  }
  return result;
}

/**
 * A generator function that takes a string and returns an iterator of the separate words in the
 * given string.
 */
export function* tokenizer(str: string, wordSeparators: string, ignoreWordSeparators: string = ''): IterableIterator<string> {
  const filteredWordSeparators = removeIgnoredSeparators(wordSeparators, ignoreWordSeparators);
  const wordSeparatorsRegExp = new RegExp(`[${escapeRegExpFixed(filteredWordSeparators)}\\s]`)

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
