wd = require('wd');
require('colors');
chai = require('chai');
chaiAsPromised = require('chai-as-promised');

expect = chai.expect;
assert = chai.assert;
should = chai.should();

// local to module, for recording testing progress
var allPassed = true;

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
wd.configureHttp({ timeout: 60000, retryDelay: 15000, retries: 5 });

global.config = 
  config = {
    username : process.env.SAUCE_USERNAME || process.env.USERNAME || "",
    accesskey : process.env.SAUCE_ACCESS_KEY || process.env.ACCESS_KEY || "",
    gridhost : process.env.GRID_HOST || "ondemand.saucelabs.com",
    gridport : process.env.GRID_PORT || 80
};

var context;
var options = "";

exports.browser = undefined;

exports.register = function(testObject) {
    context = testObject;
};

/// --- deprecated functions
exports.setupTest = function() {
    console.log( '  setupTest is deprecated, please remove'.yellow );
}
/// --- deprecated functions

function enableLogging() {
    if( !exports.browser ) {
        return;
    }
    exports.browser.on('status', function(info) {
        stdutils.writeLn("    " + info.cyan);
    });
    exports.browser.on('command', function(meth, path, data) {
        stdutils.writeLn( '    > ' + meth.yellow, path.grey, data || '' );
    });
}

function configureTest( name, tags ) {
    desired = JSON.parse(process.env.DESIRED || '{browserName: "chrome"}');
    options = { name: name + ' ' + desired.browserName, tags: tags };

    for( var key in desired ) {
        if( desired.hasOwnProperty(key) ) {
            options[key] = desired[key];
        }
    }
    allPassed = true;
};

exports.before = function(done) {
    var label = "against";
    if ( !!context) { label = context.title + " - " + label }
    else { label = "Testing " + label }

    configureTest(label,['examples']);
    exports.browser = wd.promiseChainRemote(
        config.gridhost, config.gridport, config.username, config.accesskey 
    );
    if ( process.env.VERBOSE ) {
        enableLogging();
    }
    return exports.browser
        .init(options)
        .nodeify(done);
};

exports.afterEach = function(done) {
    allPassed = allPassed && (this.currentTest.state === 'passed');
    done();
};

exports.after = function(done) {
    exports.browser
        .quit()
        .nodeify(done);
}
