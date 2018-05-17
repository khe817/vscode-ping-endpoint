'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const vscode = require('vscode');
const child_process = require("child_process");
const platform = (process.platform === 'darwin') ? 'darwin' : process.platform === 'win32' ? 'win32-archive' : 'linux-x64';

module.exports = {

    getShell: function () {
        return getShell();
    },

    getOs: function() {
        return getOs();
    },

    execNetcatCmd: function(shellPrefix, hostname, port) {
        return execNetcatCmd(shellPrefix, hostname, port);
    },

    execNetstatCmd: function(shellPrefix, hostname, port) {
        return execNetstatCmd(shellPrefix, hostname, port);
    }

};

function getShell() {
    switch (platform) {
        case 'win32-archive':
            return '"' + vscode.workspace.getConfiguration().get('terminal.integrated.shell.windows').toString() + '" ';

        case 'linux-x64':
            return vscode.workspace.getConfiguration().get('terminal.integrated.shell.linux').toString() + ' ';

        default:
            return null;

    }
}

function getOs() {
    if (getShell() == null) return 'other';

    var unameCmdOutput = '';
    var child = child_process.execSync(getShell() + '-c uname -s');
    unameCmdOutput = child.toString();

    // linux or wsl
    if (unameCmdOutput.includes('Linux')) {
        return 'linux';
    }
    // probably git bash
    if (unameCmdOutput.includes('MINGW') || unameCmdOutput.includes('CYGWIN')) {
        return 'git-on-windows';
    }
    // windows cmd
    if (unameCmdOutput.includes('not recognized')) {
        return 'windows';
    }
    // mac?
    if (unameCmdOutput.includes('Darwin')) {
        return 'mac';
    }

    return 'other';
}

function execNetcatCmd(shellPrefix, hostname, port) {
    try {
        var netcatCmd = child_process.execSync(getShell()
            + shellPrefix + ' "nc -zv '
            + hostname + ' '
            + port
            + ' 2>&1"');
        return netcatCmd.toString();
    } catch (e) {
        return '';
    }
}

function execNetstatCmd(shellPrefix, hostname, port) {
    try {
        var netstatCmd = child_process.execSync(getShell()
            + shellPrefix + ' "netstat -ano '
            + '| findstr ' + hostname + ' '
            + '| findstr ' + port + ' '
            + '| findstr LISTENING"');
        return netstatCmd.toString();
    } catch (e) {
        return '';
    }
}
