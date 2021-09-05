import * as vscode from 'vscode'
import {SimpleAutocomplete} from './simpleAutocomplete'

export const unabbreviate = new SimpleAutocomplete()

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('unabbreviate.next', unabbreviate.next),
    vscode.window.onDidChangeTextEditorSelection(unabbreviate.reset),
    vscode.workspace.onDidChangeTextDocument(unabbreviate.reset),
  )
}
