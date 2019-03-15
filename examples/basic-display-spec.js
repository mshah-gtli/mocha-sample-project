var wd = require('wd');
require('colors');
var _ = require('lodash');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var $ = require('jquery');

chai.use(chaiAsPromised);
chai.should();
chai.expect()
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

// checking sauce credential
if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
    console.warn(
        '\nPlease configure your sauce credential:\n\n' +
        'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
        'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n'
    );
    throw new Error('Missing sauce credentials');
}

// http configuration, not needed for simple runs
wd.configureHttp({
    timeout: 60000,
    retryDelay: 15000,
    retries: 5
});

var desired = JSON.parse(process.env.DESIRED || '{browserName: "chrome"}');
desired.name = 'example with ' + desired.browserName;
desired.tags = ['tutorial'];

// Custom asserters
var Asserter = wd.Asserter;
var skipButtonIsReady = new Asserter(
    function(el, cb) {
        el.getAttribute('class', function(err, val) {
            var satisfied = val.indexOf('disabled') == -1;
            cb(null, satisfied, el);
        }); 
    }
);

var flashAdDidDismiss = new Asserter(
    function(el, cb) {
        el.getAttribute('style', function(err, val) {
            var satisfied = val.indexOf('hidden') > -1;
            cb(null, satisfied, el);
        }); 
    }
);

describe('{%= name %} (' + desired.browserName + ')', function() {
    var browser;
    var allPassed = true;

    before(function(done) {
        var username = process.env.SAUCE_USERNAME;
        var accessKey = process.env.SAUCE_ACCESS_KEY;
        browser = wd.promiseChainRemote('ondemand.saucelabs.com', 80, username, accessKey);
        if (process.env.VERBOSE) {
            // optional logging
            browser.on('status', function(info) {
                console.log(info.cyan);
            });
            browser.on('command', function(meth, path, data) {
                console.log(' > ' + meth.yellow, path.grey, data || '');
            });
        }
        browser
            .init(desired)
            .nodeify(done);
    });

    afterEach(function(done) {
        allPassed = allPassed && (this.currentTest.state === 'passed');
        done();
    });

    after(function(done) {
        browser
            .quit()
            .sauceJobStatus(allPassed)
            .nodeify(done);
    });

    it('should get harness', function(done) {
        browser
            .get('http://example.com/ads/?request_host=rya.example.com&isProdAssetPathProd=asset_path_production:1&rcjs_gid=&rcjs_userid=100003482782214&rcjs_width=&rcjs_height=&rcjs_secret=ryCore&rcjs_player=undefined&rcjs_protocol=https://&rcjs_loadList=ADSCore%20JS&rcjs_deal=adjs-deal:0&rcjs_rewardPanel=adjs-reward-panel:0')
            .title()
            .should.become('Ads Interface Test Page')
            .nodeify(done);
    });
    it('should open ADSCore JS', function(done) {
        browser
            .elementByCss("a#ui-id-2")
            .click()
            .elementByCss("span#iframe_widget")
            .text().should.become('ADSCore JS')
            .nodeify(done);
    });
    it('should load gid C2F2258649', function(done) {
        browser
            .elementByCss("input#adjs-guid") // get gid input
            .type("C2F2258649") // "type" in guid
            .elementByCss("#btn-load") // get load button
            .click() // click load button
            .frame("iframe-content-panel") // switch to content frame
            .waitForElementById("ad_player_engine_C2F2258649", true, 1000) // check if ad frame exists
            .nodeify(done);
    });
    it('should be able to skip', function(done) {
        browser
            .frame("ad_player_engine_C2F2258649") // switch to the ad frame
            .waitForElementByCssSelector("#divSkip", skipButtonIsReady, 20000) // wait up to 20 seconds for skip button to become active
            .click() // click skip button'
            .frame() // pop to top frame
            .frame("iframe-content-panel") // pop to top frame
            .waitForElementByCssSelector('#gadContainer', flashAdDidDismiss, 5000) // make sure ad container is dismissed
            .nodeify(done);
    }); 
});
