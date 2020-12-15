'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const vscode = require('vscode');
const child_process = require("child_process");
const platform = (process.platform === 'darwin') ? 'darwin' : process.platform === 'win32' ? 'win32-archive' : 'linux-x64';

module.exports = {

    getVscodeConfigToStr: function(configName) {
        return getVscodeConfigToStr(configName);
    },

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

/**
 * @return null if not exist.
 */
function getVscodeConfigToStr(configName = '') {
    const configValue = vscode.workspace.getConfiguration().get(configName);
    if (configValue == 'undefined' || configValue == null) return null;
    return configValue.toString();
}

/**
 * @return null if not exist.
 */
function getShell() {
    let integratedShell = null;
    switch (platform) {
        case 'win32-archive':
            integratedShell = getVscodeConfigToStr('terminal.integrated.shell.windows');
            break;

        case 'linux-x64':
            integratedShell = getVscodeConfigToStr('terminal.integrated.shell.linux');
            if (integratedShell == null) integratedShell = '/bin/bash';
            break;

        default:
            return null;

    }
    if (integratedShell == null) return null;
    return '"' + integratedShell + '" ';
}

/**
 * @return 'other' if unable to determine.
 */
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

/**
 * @param shellPrefix '-c' for Linux and Git Bash on Windows (MINGW), or '/d /s /c' for Windows (cmd)
 */
function execNetcatCmd(shellPrefix, hostname, port) {
    try {
        let netcatCmd = getShell() +
            shellPrefix + ' "nc -zv ' +
            hostname + ' ' +
            port +
            ' 2>&1"';
        var result = child_process.execSync(netcatCmd);
        return result.toString();
    } catch (e) {
        return '';
    }
}

/**
 * @param shellPrefix '-c' for Git Bash on Windows (MINGW), or '/d /s /c' for Windows (cmd)
 */
function execNetstatCmd(shellPrefix, hostname, port) {
    try {
        let netstatCmd = getShell() +
            shellPrefix + ' "netstat -ano ' +
            '| findstr ' + hostname + ' ' +
            '| findstr ' + port + ' ' +
            '| findstr LISTENING"';
        var result = child_process.execSync(netstatCmd);
        return result.toString();
    } catch (e) {
        return '';
    }
}
