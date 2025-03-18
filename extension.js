const vscode = require('vscode');
const { execSync } = require('child_process');

async function activate(context) {
    // 注册命令
    const disposable = vscode.commands.registerCommand('extension.gitConfigFilemode', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder is open.');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const command = 'git config core.filemode false';
        const submoduleCommand = 'git submodule foreach --recursive git config core.filemode false';

        try {
            execSync(command, { cwd: rootPath });
            // 递归设置所有子模块的 core.filemode
            execSync(submoduleCommand, { cwd: rootPath });
            console.log(`Filemode set to false in all submodules using git submodule foreach --recursive`);


            vscode.window.showInformationMessage('Git filemode set to false in the root directory.');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to set git filemode: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);

    // 监听工作区打开事件
    const onDidChangeWorkspaceFolders = vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
        if (event.added.length > 0) {
            await vscode.commands.executeCommand('extension.gitConfigFilemode');
        }
    });

    context.subscriptions.push(onDidChangeWorkspaceFolders);

    // 检查当前工作区是否已经打开
    if (vscode.workspace.workspaceFolders) {
        await vscode.commands.executeCommand('extension.gitConfigFilemode');
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};