import { TextDocument, workspace, TextLine } from 'vscode';
import { extensionLog } from './extensionLog';

/**
 * This is a generator function that scans recently opened documents (except the current one).
 * It yields all lines from all open documents except the current document.
 *
 * @param currentDocument The current document to exclude from the search
 * @param sameLanguageOnly When true, only search in documents with the same language ID
 */
export function* recentDocumentsScanner(
  currentDocument: Readonly<TextDocument>,
  sameLanguageOnly: boolean = false
): IterableIterator<TextLine> {
  extensionLog.appendLine('Searching in other open files');

  // Get all open text documents
  const openDocuments = workspace.textDocuments;
  const currentLanguageId = currentDocument.languageId;

  extensionLog.appendLine(`Current language ID: ${currentLanguageId}, Same language only: ${sameLanguageOnly}`);

  for (const doc of openDocuments) {
    // Skip the current document - direct URI comparison
    if (doc.uri === currentDocument.uri) {
      continue;
    }

    // Skip documents with different language ID if sameLanguageOnly is enabled
    if (sameLanguageOnly && doc.languageId !== currentLanguageId) {
      extensionLog.appendLine(`Skipping file with different language ID: ${doc.fileName} (${doc.languageId})`);
      continue;
    }

    extensionLog.appendLine(`Searching in file: ${doc.fileName} (${doc.languageId})`);

    // Search through each line of the document
    for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
      yield doc.lineAt(lineIndex);
    }
  }
}
