import { TextEditor, workspace, Range } from 'vscode';
import { documentRippleScanner } from './documentRippleScanner';
import { recentDocumentsScanner } from './recentDocumentsScanner';
import { tokenizer } from './tokenizer';
import { fuzzySearch } from './fuzzySearch';
import { extensionLog } from './extensionLog';
import { join } from './iteratorUtils';

// Default regex pattern for abbreviation extraction
const DEFAULT_ABBREVIATION_REGEX = "((?<![A-Z])[A-Z]|[A-Z](?=[a-z])|(?<![A-Za-z])[a-z])";

function getAbbreviationPattern(): string {
  const regexPattern = workspace.getConfiguration('unabbreviate').get('abbreviationRegex', '');

  if (!regexPattern) {
    return DEFAULT_ABBREVIATION_REGEX;
  }

  try {
    new RegExp(regexPattern, "g");
    return regexPattern;
  } catch (error) {
    extensionLog.appendLine(`Invalid regex pattern: ${regexPattern}. Error: ${error}. Using default.`);
    return DEFAULT_ABBREVIATION_REGEX;
  }
}

export class SimpleAutocomplete {
  private state: {
    needle: string;
    nextIterator: IterableIterator<boolean> | undefined;
    preventReset: boolean;
    discardedMatches: string[];
    isActive: boolean;
    wordRange: Range | undefined;
  };

  constructor() {
    this.next = this.next.bind(this);
    this.reset = this.reset.bind(this);
    this.state = {
      needle: '',
      nextIterator: undefined,
      preventReset: false,
      discardedMatches: [],
      isActive: false,
      wordRange: undefined,
    };
  }

  public reset() {
    if (!this.state || (this.state.preventReset !== true && this.state.isActive)) {
      this.state = {
        needle: '',
        nextIterator: undefined,
        preventReset: false,
        discardedMatches: [],
        isActive: false,
        wordRange: undefined,
      };
    }
  }

  public next(activeTextEditor: TextEditor) {
    this.state.isActive = true;

    if (this.canAutocomplete(activeTextEditor)) {
      extensionLog.appendLine('Can autocomplete');

      if (!this.state.nextIterator) {
        extensionLog.appendLine('No iterator');
        this.state.nextIterator = this.nextGenerator(activeTextEditor);
      }

      const nextResult = this.state.nextIterator.next();

      if (nextResult.done) {
        extensionLog.appendLine('Done');
        this.setMatch(this.state.needle, activeTextEditor).then(this.reset);
      }
    } else {
      extensionLog.appendLine('Cannot autocomplete, resetting');
      this.reset();
    }
  }

  private canAutocomplete(activeTextEditor: TextEditor) {
    const { selection, document } = activeTextEditor;
    const wordRange = document.getWordRangeAtPosition(selection.end);

    if (
      wordRange === undefined ||
      wordRange.end.character !== selection.end.character ||
      selection.start.line !== selection.end.line ||
      selection.start.character !== selection.end.character
    ) {
      return false;
    } else {
      return true;
    }
  }

  private *nextGenerator(activeTextEditor: TextEditor) {
    extensionLog.appendLine('nextGenerator');
    this.setNeedle(activeTextEditor);

    if (!this.state.needle) {
      return;
    }

    const { document, selection } = activeTextEditor;
    const regexPattern = getAbbreviationPattern();

    // Get the ripple scanner for the current document
    let documentIterator: any = documentRippleScanner(document, selection.end.line);

    // Check if we should also search in recent files
    const searchInRecentFiles = workspace.getConfiguration('unabbreviate').get('recentFiles', false);
    if (searchInRecentFiles) {
      // Check if we should only search in files with the same language ID
      const sameLanguageOnly = workspace.getConfiguration('unabbreviate').get('recentFilesSameLanguage', true);

      // Join the ripple scanner with the recent documents scanner
      documentIterator = join(documentIterator, recentDocumentsScanner(document, sameLanguageOnly));
    }

    // Process lines from all sources
    for (const line of documentIterator) {
      const wordSeparators = workspace.getConfiguration().editor.wordSeparators;
      const ignoreWordSeparators = workspace.getConfiguration('unabbreviate').get('ignoreWordSeparators', '');
      const tokensIterator = tokenizer(line.text, wordSeparators, ignoreWordSeparators);

      for (const token of tokensIterator) {
        if (
          fuzzySearch(this.state.needle, token, regexPattern) &&
          this.state.discardedMatches.indexOf(token) === -1
        ) {
          this.state.discardedMatches.push(token);
          this.setMatch(token, activeTextEditor);
          yield true;
        }
      }
    }
  }

  private setNeedle(activeTextEditor: TextEditor) {
    const { document, selection } = activeTextEditor;

    // Initialize wordRange with the current word range
    this.state.wordRange = document.getWordRangeAtPosition(selection.end);

    if (this.state.wordRange) {
      const needle = document.getText(this.state.wordRange);

      if (typeof needle === 'string') {
        this.state.discardedMatches.push(needle);
        this.state.needle = needle;
      }
    }
  }

  private async setMatch(match: string, activeTextEditor: TextEditor) {
    const { selections, document } = activeTextEditor;

    // Start from last selection so that edits don't alter the locations of previous selections
    for (let i = selections.length - 1; i >= 0; i--) {
      const selection = selections[i];

      // wordRange should already be set by setNeedle, but if not, initialize it
      if (!this.state.wordRange) {
        extensionLog.appendLine('wordRange was null');
        this.state.wordRange = document.getWordRangeAtPosition(selection.end);
      }


      // At this point, wordRange should definitely exist
      if (this.state.wordRange) {
        extensionLog.appendLine(`old wordRange: ${this.state.wordRange.start.character}, ${this.state.wordRange.end.character}`);
        this.state.preventReset = true;

        // Store the start position of the original range
        const originalStartPosition = this.state.wordRange.start;

        await activeTextEditor.edit(editBuilder => {
          editBuilder.delete(this.state.wordRange!);
          editBuilder.insert(originalStartPosition, match);
        });

        // Create a new range that encompasses the entire match
        // The start position remains the same as the original word's start
        // The end position is calculated by adding the match length to the start position
        const endPosition = originalStartPosition.translate(0, match.length);

        // Create a new range that covers the entire match
        this.state.wordRange = new Range(originalStartPosition, endPosition);
        extensionLog.appendLine(`new wordRange: ${this.state.wordRange.start.character}, ${this.state.wordRange.end.character}`);

        this.state.preventReset = false;
      }
    }
  }
}
