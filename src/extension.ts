import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) {
		return;
	}

	// Check if 'artisan' exists in the root of any workspace folder
	const isLaravel = workspaceFolders.some(folder => {
		const artisanPath = path.join(folder.uri.fsPath, 'artisan');
		return fs.existsSync(artisanPath);
	});

	if (!isLaravel) {
		return; // Don't show the button if not a Laravel project
	}

	const testButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	testButton.command = 'laravel-test-shortcuts.runPhpArtisanTest';
	testButton.show();
	context.subscriptions.push(testButton);

	function updateButton() {
		const editor = vscode.window.activeTextEditor;
		if (
			editor &&
			editor.document.languageId === 'php' &&
			editor.document.fileName.endsWith('Test.php')
		) {
			const fileName = path.basename(editor.document.fileName);
			testButton.text = `$(beaker) Run ${fileName}`;
			testButton.tooltip = `Run php artisan test for ${fileName}`;
		} else {
			testButton.text = '$(beaker) Run artisan Tests';
			testButton.tooltip = 'Run php artisan test';
		}
	}

	updateButton();

	vscode.window.onDidChangeActiveTextEditor(updateButton, null, context.subscriptions);
	vscode.workspace.onDidSaveTextDocument(updateButton, null, context.subscriptions);

	const runTestCommand = vscode.commands.registerCommand('laravel-test-shortcuts.runPhpArtisanTest', () => {
		const editor = vscode.window.activeTextEditor;
		let command = 'php artisan test';

		if (
			editor &&
			editor.document.languageId === 'php' &&
			editor.document.fileName.endsWith('Test.php')
		) {
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
			if (workspaceFolder) {
				const relativePath = path.relative(workspaceFolder.uri.fsPath, editor.document.fileName);
				command = `php artisan test "${relativePath}"`;
			}
		}

		const terminal = vscode.window.createTerminal('PHP Artisan Test');
		terminal.sendText(command);
		terminal.show();
	});

	context.subscriptions.push(runTestCommand);
}