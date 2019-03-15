'use strict;'

require('../../libs/automationutils');
stdutils = require('../../libs/standardutils');
configutils = require('../../libs/configurationutils').create();


var gid = 'C2F2258649';
var width  = '690px';
var height  = '390px';
var url = 'https://example.com/ads/';
var _periodSeconds = 1000;
var _pollPeriodMs = 500;

var asserters = wd.asserters; // common asserters

var Asserter = wd.Asserter;
var checkForDisplayed = new Asserter(
    function(el, cb) {
        el.isDisplayed(function(err, val) {
            var satisfied = val; // !val if want not displayed
            cb(null, satisfied, el);
        });
    }
);

var _regNumber=/\s*(\d+)\s*/;
var _state = {
    countdownInText1 : {},
    countdownInText2 : {}
};

var checkForNumberChangeDec = function(state, safe) {
    if(safe === undefined) { safe = false; }
    return new Asserter(
        function(el, cb) {
            el.isDisplayed(function(err,val) {
                el.text(function(err, val) {
                    var matches,num;
                    try {
                        matches = val.match(_regNumber); // !val if want not displayed
                        num = Number(matches[1]);
                    } catch(e) {}
                    var satisfied = (typeof num === 'number');
                    if( satisfied ) {
                        if( !('initial' in state) ) {
                            state.initial = num;
                            satisfied = false; // needs to return false so it will keep waiting
                        } else {
                            state.final = num;
                            satisfied = state.initial != state.final && 
                                        state.initial > state.final;
                            stdutils.writeInfo( "Values:"+JSON.stringify(state)+" Result:"+(satisfied ? "passed".green : "failed".red ) );
                        }
                    }
                    cb(null, satisfied, el);
                });
            });
            
        });
};

function validateText(css,max,min,retries) {
    var _css = css, _min = min, _max = max, _retries = retries;
    if( _retries == undefined || _retries > 10 ) {_retries = 10; }
    return function(text){
        var value = Number.NaN;
        try {value = parseInt( text ); } catch( e ) {}
        if( _retries > 0 && (!value || value == Number.NaN) ) {
            stdutils.writeWarn( "Not ready ... retries " + _retries );
            return configutils.browser.sleep( _pollPeriodMs )
                        .elementByCss(_css).text()
                            .then(validateText(_css,_max,_min,_retries-1));
        }
        stdutils.writeInfo( "Validating ... " + value );
        assert( _max >= value && value >= _min, (_css + " value ("+ value+") is not between "+_min+" and "+_max) );
        stdutils.writeSuccess( "Was between " + _max + " and " + _min );
        return configutils.browser;
    }
}

// file name matching
describe('0002_Int_Sptint_Greenframe-InProgress',function() {
    configutils.register(this);
    // test description
    before( configutils.before );
    afterEach( configutils.afterEach );
    after( configutils.after );

    describe('Test for Sprint Greenframe using ADSCore',function() {

        step( 'Should Launch the Test for ' + gid,function(done) {
           configutils.browser
    // COM1:This part needs to be moved into a utility function
            .get(url)
            .title()
                .should .become('Ads Interface Test Page')
            .elementByCss('.ui-menu-item:nth-child(2) a[id="ui-id-2"]') // ADSCore JS
            .click()
            .elementByCss('#vpc_adjs').isDisplayed()
                .should .eventually .be .true
            .elementByCss('#vpc_adjs input#rcjs_gid').type(gid).getValue()
                .should .eventually .be .equal(gid)
            .selectMockServer()
                .sleep(6 *_periodSeconds)
            .elementByCss('#vpc_adjs input#rcjs_width').type(width).getValue()
                .should .eventually .be .equal(width)
            .elementByCss('#vpc_adjs input#rcjs_height').type(height).getValue()
                .should .eventually .be .equal(height)
            .elementByCss('#vpc_adjs tr td:first-child button')
            .click()
            .takeScreenshot()
            .nodeify(done);
    // COM1:This part needs to be moved into a utility function
        });
    // START GREENFRAME COPY SECTION
        step( 'Should Select Test Frame',function(done) {
            configutils.browser
    // COM2:Make easy use function for selection and verification of iframes
                .waitForElementByCss('iframe#iframe-content-panel', 10 * _periodSeconds ).then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).waitForElementByCss('body', 10 * _periodSeconds ).text()
                             .should .eventually .include('Rockyou Test Page')
                })
                .nodeify(done);

    // COM2:Make easy use function for selection and verification of iframes
        });
        step( 'Should Select Ad Content Frame',function(done) {
            configutils.browser
                .waitForElementByCss('#gadContainer iframe[name="ad_player_engine_'+gid+'"][style*="'+width+'"][style*="'+height+'"][style*="inherit"]', 10 * _periodSeconds, _pollPeriodMs).then(function(elem){
                    stdutils.writeInfo( "Entering iframe (ad player engine)" );
                    return configutils.browser.frame(elem);
                })
                .nodeify(done);
        });

        // Countdown in string "You can close in ...----------------------------------------
        step( 'Should Verify the Countdown Text is Counting',function(done) {
            configutils.browser
                .waitForElementByCssSelector('#ryInfoPanel #divCountdown', checkForDisplayed, _periodSeconds * 20)
                .waitForElementByCss('#ryInfoPanel #divCountdown', checkForNumberChangeDec( _state.countdownInText1 ) )
                .nodeify(done);
        });
        // Countdown in string "You can close in ...----------------------------------------        

        step( 'Should Verify the Multiburn swf is Present',function(done) {
            configutils.browser
                .hasElementByCss('#ryMultiburn_'+gid)
                    .should .eventually .be .true
                .takeScreenshot()
                .nodeify(done);
        });

        step( 'Should Verify Header Message Text is Displayed Correctly',function(done) {
            configutils.browser
                .elementByCss('#ryInfoPanel #ryHeaderMessage').text()
                    .should .eventually .become('This gid is for Zero Wrapper and Green Frame')
                .nodeify(done);
        });

    //NOTE: The Close button disabled state needs to be checked before checking the coutdown text
        step( 'Should Verify the Skip button is Present',function(done) {
            configutils.browser
                .waitForElementByCssSelector('#ryContent #divSkip', checkForDisplayed, _periodSeconds * 15)
                .takeScreenshot()
                .nodeify(done);
        });

        step( 'Should Click the Skip button',function(done) {
            configutils.browser
                .elementByCss('#ryContent #divSkip')
                .click()
                .takeScreenshot()
                .nodeify(done);
        });

        step( 'Should Return to Top iframe',function(done) {
            configutils.browser
                // pop back to top (harness when not in facebook)
                .frame()
                // enter test frame
                .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body').text()
                             .should .eventually .include('Rockyou Test Page')
                })
                .nodeify(done);
        });

        step( 'Should Verify Ad Container is Hidden',function(done) {
            configutils.browser
                .waitForElementByCss('#gadContainer[style*="hidden"]', 55 * _periodSeconds, _pollPeriodMs ).isDisplayed()
                    .should .eventually .be .false
                .nodeify(done);
        });

        step( 'Should Click Reload Button for Subsequent Load',function(done) {
            configutils.browser
            .elementByCss('#btnReload')
                .click()
                .takeScreenshot()
                .nodeify(done);
        });

        step( 'Should Select Ad Content Frame',function(done) {
            configutils.browser
                .waitForElementByCss('#gadContainer iframe[name="ad_player_engine_'+gid+'"][style*="'+width+'"][style*="'+height+'"][style*="inherit"]', 10 * _periodSeconds, _pollPeriodMs).then(function(elem){
                    stdutils.writeInfo( "Entering iframe (ad player engine)" );
                    return configutils.browser.frame(elem);
                })
                .nodeify(done);
        });

        // Countdown in string "You can close in ...----------------------------------------
        step( 'Should Verify the Countdown Text is Counting',function(done) {
            configutils.browser
                .waitForElementByCssSelector('#ryInfoPanel #divCountdown', checkForDisplayed, _periodSeconds * 20)
                .waitForElementByCss('#ryInfoPanel #divCountdown', checkForNumberChangeDec( _state.countdownInText2 ) )
                .nodeify(done);
        });
        // Countdown in string "You can close in ...----------------------------------------        

        step( 'Should Verify the Multiburn swf is Present',function(done) {
            configutils.browser
                .hasElementByCss('#ryMultiburn_'+gid)
                    .should .eventually .be .true
                .takeScreenshot()
                .nodeify(done);
        });

        step( 'Should Verify Header Message Text is Displayed Correctly',function(done) {
            configutils.browser
                .elementByCss('#ryInfoPanel #ryHeaderMessage').text()
                    .should .eventually .become('This gid is for Zero Wrapper and Green Frame')
                .nodeify(done);
        });

    //NOTE: The Close button disabled state needs to be checked before checking the coutdown text
        step( 'Should Verify the Skip button is Present',function(done) {
            configutils.browser
                .waitForElementByCssSelector('#ryContent #divSkip', checkForDisplayed, _periodSeconds * 15)
                .takeScreenshot()
                .nodeify(done);
        });

    // -----------------------------------------------------
    // ---- Reference Top Iframe
        step( 'Should Return to Top iframe',function(done) {
            configutils.browser
                // pop back to top (harness when not in facebook)
                .frame()
                .nodeify(done);
        });

    // -----------------------------------------------------
    // ---- Reference Test Iframe
        step( 'Should Return to Test iframe',function(done) {
            configutils.browser
                // enter test frame
                .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body').text()
                             .should .eventually .include('Rockyou Test Page')
                })
                .nodeify(done);
        });

        step( 'Should Verify Ad Container is Hidden and Complete Test',function(done) {
            configutils.browser
                .sleep(6 *_periodSeconds)
                .waitForElementByCss('#gadContainer[style*="hidden"]').isDisplayed()
                    .should .eventually .be .false
                .takeScreenshot()
                .nodeify(done);
        });

    });
});