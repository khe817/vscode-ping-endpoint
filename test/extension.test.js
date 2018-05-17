/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
const Ping = require('../src/Ping.js');
const defaultConfig = vscode.workspace.getConfiguration().get('ping-endpoint');
const wikipediaConfig = {
    'hostname': 'en.wikipedia.org',
    'port': 80,
    'endpoint': '/wiki/Main_Page',
    'healthCheck': {
        'enabled': true,
        'ssl': true,
        'includePort': false
    }
};
const noHealthCheckConfig = {
    'hostname': 'en.wikipedia.org',
    'port': 80,
    'endpoint': '/wiki/Main_Page',
    'healthCheck': {
        'enabled': false
    }
};

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function() {

    // Defines a Mocha unit test
    test("Test for the sake of testing", function() {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });

    test('Ping full endpoint, default config; expect status ONLINE HTTP 200', function(done) {
        runPingWithConfig(defaultConfig);
        done();
    });

    test('Ping full endpoint, wikipedia config; expect status ONLINE HTTP 200', function (done) {
        runPingWithConfig(wikipediaConfig);
        done();
    });

    test('Ping full endpoint, wikipedia, no SSL config; expect status NO NETWORK HTTP 301', function (done) {
        var wikipediaNoSslConfig = wikipediaConfig;
        wikipediaNoSslConfig.healthCheck.ssl = false;
        runPingWithConfig(wikipediaNoSslConfig, ['HTTP', '301']);
        done();
    });

    test('Ping full endpoint, no health check config; expect status ONLINE ok', function (done) {
        runPingWithConfig(noHealthCheckConfig, ['OK']);
        done();
    });


});

function runPingWithConfig(config, expectedInOutput) {
    var expectedInOutput = expectedInOutput || ['HTTP', '200'];
    var ping = new Ping.Ping(config);
    const pingPromise = new Promise(function (resolve, reject) {
        setTimeout(function () {
            ping.start();
            resolve(ping);
        }, 1500);
    });
    pingPromise.then(function () {
        expectedInOutput.forEach(function (output) {
            assert.equal(ping.statusBar.text.includes(output), true);
        });
        console.log(ping.statusBar.text);
        ping.stop();
    });
}
