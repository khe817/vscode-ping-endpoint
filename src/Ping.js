'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
const vscode = require("vscode");
const child_process = require("child_process");
const ping_helper = require('./ping_helper');
const shell = ping_helper.getShell();

class Ping {
    constructor(config) {
        this._onlineText = `$(radio-tower) ONLINE`;
        this._offlineText = `$(alert) NO NETWORK`;
        this.os = ping_helper.getOs();
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.config = config;
        this.intervalId = null;
        this.previousSuccess = false;
    }

    start() {
        this.statusBar.show();
        this.tick();
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => this.tick(), 1000);
    }

    stop() {
        clearInterval(this.intervalId);
        this.statusBar.hide();
    }

    tick() {
        var pingCmdResult = '';
        try {
            pingCmdResult = this.switchPingBasedOnOS();
        } catch (e) {
            vscode.window.showInformationMessage('Error pinging ' + e.toString());
        }
        this.setMsg(pingCmdResult);
        this.setStatus(this.pingSucceeded(pingCmdResult));
        this.show();
    }

    getStatus() {
        return this._status;
    }

    getMsg() {
        return this.msg;
    }

    setStatus(online) {
        this._status = online ? this._onlineText : this._offlineText;
        this.previousSuccess = online ? true : false;
    }

    setMsg(msg) {
        this.msg = msg;
    }

    pingSucceeded(pingCmdResult) {
        if (typeof pingCmdResult == 'undefined' || pingCmdResult == null) {
            return false;
        }

        if (pingCmdResult != 'HTTP 200' && pingCmdResult != 'OK') {
            return false;
        }

        return true;
    }

    /**
     * @return null if fails, or system not supported
     */
    switchPingBasedOnOS() {
        switch (this.os) {
            case 'linux':
                return this.doPingLinux();

            case 'git-on-windows':
                return this.doPingBashOnWindows();

            case 'windows':
                return this.doPingWindows('/d /s /c');

            default:
                return null;
        }
    }

    /**
     * @return null if fails
     */
    doPingLinux() {
        var pingCmd = ping_helper.execNetcatCmd('-c', this.config.hostname, this.config.port);
        if (!pingCmd.includes('succeeded')) {
            return null;
        }

        if (this.config.healthCheck.enabled) {
            return this.healthCheck();
        }

        return 'OK';
    }

    /**
     * @param shellPrefix '-c' for Git Bash on Windows (MINGW) or '/d /s /c' for Windows (cmd)
     * @return null if fails
     */
    doPingWindows(shellPrefix) {
        var pingCmd = '';
        if (this.config.hostname == 'localhost' || this.config.hostname == '127.0.0.1') {
            pingCmd = ping_helper.execNetstatCmd(shellPrefix, '0.0.0.0', this.config.port);
            if (!pingCmd.includes('0.0.0.0') && !pingCmd.includes(this.config.port)) {
                return null;
            }
        } else {
            pingCmd = ping_helper.execNetcatCmd(shellPrefix, this.config.host, this.config.port);
            if (!pingCmd.includes('succeeded')) {
                return null;
            }
        }

        return 'ok';
    }

    /**
     * @return null if fails
     */
    doPingBashOnWindows() {
        var pingResult = this.doPingWindows('-c');

        if (pingResult != null && this.config.healthCheck.enabled) {
            return this.healthCheck();
        }

        return pingResult;
    }

    /**
     * Only run health check the first time when connection is up after being down.
     * Run everytime connection is up again.
     *
     * @return null if fails
     */
    healthCheck() {
        if (this.previousSuccess) {
            return this.getMsg();
        }

        var pingCmdStr = ping_helper.getShell()
            + '-c "curl -o /dev/null -s -w \\"%{http_code}\\" '
            + (this.config.healthCheck.ssl ? 'https://' : 'http://')
            + this.config.hostname
            + (this.config.healthCheck.includePort ? ':' + this.config.port : '')
            + this.config.endpoint
            + '"';
        var pingCmd = child_process.execSync(pingCmdStr);
        var httpStatus = this.parseHttpResponseStatus(pingCmd.toString());
        return httpStatus;
    }

    /**
     * @return null if fails
     */
    parseHttpResponseStatus(pingCmdResult) {
        if (pingCmdResult == '200') {
            return 'HTTP 200';
        } else {
            return 'HTTP ' + pingCmdResult;
        }
    }

    show() {
        if (this.getMsg() === null) {
            this.statusBar.text = `${this.getStatus()}`;
        } else {
            this.statusBar.text = `${this.getStatus()} : ${this.getMsg()}`;
        }
    }

    dispose() {
        clearInterval(this.intervalId);
        this.statusBar.dispose();
    }

}
exports.Ping = Ping;
