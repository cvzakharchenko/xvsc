# [Unabbreviate](https://marketplace.visualstudio.com/items?itemName=cvzakharchenko.unabbreviate)

Fewer keystrokes, no-nonsense autocomplete that cycles through matches based on fuzzy word search performed on the open document(s). This is like IntelliJ's Cyclic Expand Word or NetBeans Hippie Completion.

![](https://raw.githubusercontent.com/msafi/xvsc/master/simpleAutocomplete/demoFiles/demo.gif)

## Extension Settings

This extension adds one command:

* `unabbreviate.next`: which cycles through the autocomplete results

**Note** No keybinding is provided by this extension. You have to create one yourself.

### Configuration Options

* `unabbreviate.ignoreWordSeparators`: Characters to ignore from word separators when tokenizing text
* `unabbreviate.recentFiles`: When enabled, searches for matches in recently opened files if no matches are found in the current file
* `unabbreviate.recentFilesSameLanguage`: When enabled (default), only searches in files with the same language ID as the current file
* `unabbreviate.abbreviationRegex`: Regular expression used to extract abbreviations from words. Default extracts first letter of each word and capital letters in camelCase.

### How It Works

The extension uses two scanning strategies that are combined when needed:

1. **Ripple Scanner**: Searches for matches in the current file using a "ripple" pattern (starting from the cursor position and moving outward).

2. **Recent Documents Scanner**: When the `searchInRecentFiles` option is enabled, the extension will also search through other open files in the workspace after exhausting the current file.

## Issues, questions, etc

https://github.com/cvzakharchenko/xvsc/issues
