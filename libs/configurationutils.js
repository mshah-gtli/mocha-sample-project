wd = require('wd');
require('colors');
chai = require('chai');
chaiAsPromised = require('chai-as-promised');

expect = chai.expect;
assert = chai.assert;
should = chai.should();

var browser = undefined, config = undefined;

chai.use(chaiAsPromised);
chai.should();
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
wd.configureHttp({ timeout: 60000, retryDelay: 15000, retries: 5 });

global.config = 
  config = {
    username : process.env.BS_USERNAME || process.env.USERNAME || "",
    accesskey : process.env.BS_ACCESS_KEY || process.env.ACCESS_KEY || "",
    gridhost : process.env.GRID_HOST || "localhost",
    gridport : process.env.GRID_PORT || 4444
};

// *********************************************
// Private Functions

function enableLogging(b) {
    if( !b ) {
        return;
    }
    b.on('status', function(info) {
        stdutils.writeLn("    " + info.cyan);
    });
    b.on('command', function(meth, path, data) {
        stdutils.writeLn( '    > ' + meth.yellow, path.grey, data || '' );
    });
}

function configureTest( name, tags ) {
    process.stdout.write("\n\n\n********\n\nDesired: " + process.env.DESIRED +"\n\n\n********\n\n");
    var desired = JSON.parse(process.env.DESIRED) || {browserName: "chrome"};
    var options = { name: name + ' ' + desired.browserName, tags: tags };

    for( var key in desired ) {
        if( desired.hasOwnProperty(key) ) {
            options[key] = desired[key];
        }
    }
    
    return options;
};

function moduleClass() {
    var that = this, context, allPassed;
    this.browser = browser;

    this.register = function(c) { context = c; }
    this.before = function(done) {
        var label = "against";
        allPassed = true;
        if ( !!context) { label = context.title + " - " + label }
        else { label = "Testing " + label }
        return that.browser
                .init( configureTest(label,['examples']) )
                .nodeify(done);
    };
    this.after = function(done) {
        that.browser
            .quit()
            .nodeify(done);
    };
    this.afterEach = function(done) {
        allPassed = allPassed && (this.currentTest.state === 'passed');
        done();
    };
}

// *********************************************
// Public Interfaces

exports.create = function() {
    return new moduleClass();
};

// ****************************************
// Post Load Initialization
process.stdout.write("\nUsername: " + config.username +
"\nAccess Key: " + config.accesskey +
"\nGrid host: " + config.gridhost +
"\nGrid port: " + config.gridport)
browser = wd.promiseChainRemote(config.gridhost, config.gridport, config.username, config.accesskey );
process.stdout.write("\nInitiated the browser!\n");

// assumes that this will be on or off for all runs
if ( process.env.VERBOSE ) {
    enableLogging(browser);
}
