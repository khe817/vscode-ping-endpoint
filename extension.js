'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
Object.defineProperty(exports, '__esModule', { value: true });
const vscode = require('vscode');
const Ping = require('./src/Ping');
const ping_helper = require('./src/ping_helper');
var os = ping_helper.getOs();
const config = vscode.workspace.getConfiguration().get('ping-endpoint');
var ping = new Ping.Ping(config);

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    if (!['linux', 'git-on-windows', 'windows'].includes(os)) {
        vscode.window.showInformationMessage(os + ' not supported.');
        return false;
    }
    var pingTarget = config.hostname + ':' + config.port + config.endpoint;

    // start
    var disposable = vscode.commands.registerCommand('extension.pingEndpoint.start', function () {
        ping.start();
        vscode.window.showInformationMessage('Pinging ' + pingTarget);

    });
    context.subscriptions.push(disposable);

    // stop
    disposable = vscode.commands.registerCommand('extension.pingEndpoint.stop', function () {
        ping.stop();
        vscode.window.showInformationMessage('Stop pinging ' + pingTarget);

    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    ping.stop();
}
exports.deactivate = deactivate;
