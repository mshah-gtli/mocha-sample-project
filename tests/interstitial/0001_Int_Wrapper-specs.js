'use strict;'

require('../../libs/automationutils');
stdutils = require('../../libs/standardutils');
configutils = require('../../libs/configurationutils').create();


var gid = '1F81F58792';
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

// This is pretty nasty
// On the result of a text query using css
// check text, if text is not a number or empty
// try again up to _retries.  This is a good candidate for
// adding a promise interface
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
describe('0001_Int_Zynga_Wrapper-Final',function() {
    configutils.register(this);    
    // test description
    before( configutils.before );
    afterEach( configutils.afterEach );
    after( configutils.after ); 
    process.stdout.write("\n\n\t\t@@Bbefore, after and afterEach done!\n\n");
    
    describe('Test for z Interstitial using Wrapper',function() {

        it( 'Should Launch the Test for ' + gid,function(done) {
           configutils.browser
    // COM1:This part needs to be moved into a utility function
            .get(url)
            .title()
                .should .become('Ads Interface Test Page')
            .elementByCss('#ui-id-8') // Interstitial tab
            .click()
            .takeScreenshot()        
            .elementByCss('#vpc_interstitial').isDisplayed()
                .should .eventually .be .true
            .selectMockServer()
                .sleep(6 *_periodSeconds)                            
            .elementByCss('#vpc_interstitial input#interstitial_gid').type(gid).getValue()
                .should .eventually .be .equal(gid)                        
            .elementByCss('#vpc_interstitial tr td:first-child button')
            .click()
            .nodeify(done);
        });

        it( 'Should Select Test Frame',function(done) {
            configutils.browser
    // COM2:Make easy use function for selection and verification of iframes
            .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body #jquery-expected').text()
                             .should .eventually .include('1.9.1')
                })
                .nodeify(done);
    // COM2:Make easy use function for selection and verification of iframes            
        });
        
        it( 'Should Select Ad Content Frame',function(done) {
            configutils.browser            
                .waitForElementByCss('#ryInterstitialPopupDiv iframe[name="ad_player_engine_'+gid+'"][style*="'+width+'"][style*="'+height+'"][style*="inherit"]', 10 * _periodSeconds, _pollPeriodMs).then(function(elem){
                    stdutils.writeInfo( "Entering iframe (ad player engine)" );
                    return configutils.browser.frame(elem);
                })
                .nodeify(done);
        });
        
        // Countdown in string "You can close in ...----------------------------------------
        it( 'Should Verify the Countdown Text is Counting',function(done) {
            configutils.browser
                .waitForElementByCssSelector('#ryInfoPanel #divCountdown', checkForDisplayed, _periodSeconds * 20)
                .waitForElementByCss('#ryInfoPanel #divCountdown', checkForNumberChangeDec( _state.countdownInText1 ) )
                .nodeify(done);
        });
        // Countdown in string "You can close in ...----------------------------------------          

        it( 'Should Verify the Multiburn swf is Present',function(done) {
            configutils.browser             
                .hasElementByCss('#ryMultiburn_'+gid)
                    .should .eventually .be .true
                .nodeify(done);
        }); 
        /*
        it( 'Should Verify Header Message is Empty',function(done) {
            configutils.browser
                .sleep(5 * _periodSeconds)            
                .elementByCss('#ryInfoPanel #ryHeaderMessage').text()
                    .should .eventually .become('')
                .nodeify(done);
        });*/

        it( 'Should Verify the Close button is Present and Disabled',function(done) {
            configutils.browser                    
                .waitForElementByCssSelector('#ryInfoPanel #divClose.disabled', checkForDisplayed, _periodSeconds * 25)               
                .nodeify(done);                        
        });

        it( 'Should Sleep Until Ad is Complete',function(done) {
            configutils.browser
                .sleep(25 * _periodSeconds)               
                .nodeify(done);
        });               

        it( 'Should Return to Top iframe',function(done) {
            configutils.browser
                // pop back to top (harness when not in facebook)
                .frame()
                // enter test frame
                .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body').text()
                             .should .eventually .include('Loaded Jquery Version:1.9.1') 
        })
                .nodeify(done);                         
        });

        it( 'Should Verify Ad Container is Hidden',function(done) {
            configutils.browser  
                .sleep(5 * _periodSeconds)             
                .hasElementByCss('#ryInterstitialPopupDiv [style*="hidden"]')
                    .should .eventually .be .false 
                .nodeify(done);
        });

        it( 'Should Click Show Ad button for Subsequent Load',function(done) {
            configutils.browser            
                .hasElementByCss('#interstitialAdBtnHolder input.adBtn')
                    .should .eventually .be .true
                .elementByCss('#interstitialAdBtnHolder input')
                .click()
                .takeScreenshot()
                .nodeify(done);
        });

        it( 'Should Select Ad Content Frame',function(done) {
            configutils.browser            
                .waitForElementByCss('#ryInterstitialPopupDiv iframe[name="ad_player_engine_'+gid+'"][style*="'+width+'"][style*="'+height+'"][style*="inherit"]', 10 * _periodSeconds, _pollPeriodMs).then(function(elem){
                    stdutils.writeInfo( "Entering iframe (ad player engine)" );
                    return configutils.browser.frame(elem);
                })
                .takeScreenshot()
                .nodeify(done);
        });

        // Countdown in string "You can close in ...----------------------------------------
        it( 'Should Verify the Countdown Text is Counting',function(done) {
            configutils.browser
                .waitForElementByCssSelector('#ryInfoPanel #divCountdown', checkForDisplayed, _periodSeconds * 20)
                .waitForElementByCss('#ryInfoPanel #divCountdown', checkForNumberChangeDec( _state.countdownInText2 ) )
                .nodeify(done);
        });
        // Countdown in string "You can close in ...----------------------------------------          

        it( 'Should Verify the Multiburn swf is Present',function(done) {
            configutils.browser             
                .hasElementByCss('#ryMultiburn_'+gid)
                    .should .eventually .be .true
                .nodeify(done);
        }); 
        /*
        it( 'Should Verify Header Message is Empty',function(done) {
            configutils.browser           
                .elementByCss('#ryInfoPanel #ryHeaderMessage').text()
                    .should .eventually .become('')    
                .nodeify(done);
        });
        */
        it( 'Should Verify the Close button is Present and Disabled',function(done) {
            configutils.browser                    
                .waitForElementByCssSelector('#ryInfoPanel #divClose.disabled', checkForDisplayed, _periodSeconds * 25)               
                .nodeify(done);                        
        });

        it( 'Should Return to Top iframe',function(done) {
            configutils.browser
                // pop back to top (harness when not in facebook)
                .frame()
                // enter test frame
                .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body').text()
                             .should .eventually .include('Loaded Jquery Version:1.9.1') 
        })
                .nodeify(done);                         
        });

        it( 'Should Sleep Until Ad is Complete',function(done) {
            configutils.browser
                .sleep(25 * _periodSeconds)               
                .nodeify(done);
        });         

        it( 'Should Verify Ad Container is Hidden',function(done) {
            configutils.browser  
                .sleep(10 * _periodSeconds)             
                .hasElementByCss('#ryInterstitialPopupDiv [style*="hidden"]')
                    .should .eventually .be .false 
                .nodeify(done);
        });  
    });
});