/*
The MIT License (MIT)

Copyright © 2015 Nicolas Bevacqua

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// "azzBzz_czz_DZZ_EZZ" -> "aBcDE"
function abbreviate(word: string) {
  const result1 = word.replace(RegExp("((?<=[a-zA-Z])[a-z_]|(?<=[A-Z])[A-Z])", "g"), "")
  const result2 = word.replace(RegExp("(^[a-z]|(?<=[_])[a-zA-Z]|(?<=[a-z])[A-Z])|.", "g"), "$1")
  if (result1 != result2) {
    console.error("${word} abbreviation ${result1} != ${result2}");
  }
  return result1;
}

export function fuzzySearch(needle: string, haystack: string) {
  const hay = abbreviate(haystack);
  return hay.toLowerCase().startsWith(needle.toLowerCase());
}
