'use strict;'

stdutils = require('../../libs/standardutils');
configutils = require('../../libs/configurationutils').create();


var gid = 'FA81C58619';
var width  = '690px';
var height  = '390px';
var url = 'https://example.com/ads/';
var _periodSeconds = 1000;
var _pollPeriodMs = 500;
var Asserter = wd.Asserter;   
var checkForDisplayed = new Asserter(
    function(el, cb) {
        el.isDisplayed(function(err, val) {
            var satisfied = val; // !val if want not displayed
            cb(null, satisfied, el);
        }); 
    }
);

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
describe('0003_Int_Adap_Short_Close_Timer-InProgress',function() {
    configutils.register(this);    
    // test description
    before( configutils.before );
    afterEach( configutils.afterEach );
    after( configutils.after ); 
    
    describe('Test for Adap Short Close Timer using ADSCore',function() {

        it( 'Should Launch the Test for ' + gid,function(done) {
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
        it( 'Should Select Test Frame',function(done) {
            configutils.browser
    // COM2:Make easy use function for selection and verification of iframes
                .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body').text()
                             .should .eventually .include('Rockyou Test Page')
                })
                .nodeify(done);
    // COM2:Make easy use function for selection and verification of iframes            
        });    
        it( 'Should Select Ad Content Frame',function(done) {
            configutils.browser            
                .waitForElementByCss('#gadContainer iframe[name="ad_player_engine_'+gid+'"][style*="'+width+'"][style*="'+height+'"][style*="inherit"]', 10 * _periodSeconds, _pollPeriodMs).then(function(elem){
                    stdutils.writeInfo( "Entering iframe (ad player engine)" );
                    return configutils.browser.frame(elem);
                })
                .nodeify(done);
        });

        it( 'Should Verify the Multiburn swf is Present',function(done) {
            configutils.browser             
                .hasElementByCss('#ryMultiburn_'+gid)
                    .should .eventually .be .true
                .takeScreenshot()
                .nodeify(done);
        }); 

        it( 'Should Verify the Countdown Text is Counting',function(done) {
            configutils.browser
                .elementByCss('#ryInfoPanel #divCountdown').text().then(validateText('#ryInfoPanel #divCountdown',10,1))
                .sleep(2 * _periodSeconds) // make sure that value changes
                .elementByCss('#ryInfoPanel #divCountdown').text().then(validateText('#ryInfoPanel #divCountdown',8,1))
                .nodeify(done);
        });
               
    //NOTE: The Close button disabled state needs to be checked before checking the coutdown text   
        it( 'Should Verify the Skip button is Present',function(done) {
            configutils.browser
                .waitForElementByCssSelector('#ryContent #divSkip', checkForDisplayed, _periodSeconds * 25)                         
                .takeScreenshot()
                .nodeify(done);                        
        });

        it( 'Should Click the Skip button',function(done) {
            configutils.browser
                .elementByCss('#ryContent #divSkip')
                .click() 
                .takeScreenshot()
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
                             .should .eventually .include('Rockyou Test Page') 
                })
                .nodeify(done);                         
        });

        it( 'Should Verify Ad Container is Hidden',function(done) {
            configutils.browser  
                .waitForElementByCss('#gadContainer[style*="hidden"]', 55 * _periodSeconds, _pollPeriodMs ).isDisplayed()
                    .should .eventually .be .false
                .nodeify(done);
        });    

        it( 'Should Click Reload Button for Subsequent Load',function(done) {
            configutils.browser
            .elementByCss('#btnReload')
                .click()
                .takeScreenshot()
                .nodeify(done);
        });

        it( 'Should Select Ad Content Frame',function(done) {
            configutils.browser            
                .waitForElementByCss('#gadContainer iframe[name="ad_player_engine_'+gid+'"][style*="'+width+'"][style*="'+height+'"][style*="inherit"]', 10 * _periodSeconds, _pollPeriodMs).then(function(elem){
                    stdutils.writeInfo( "Entering iframe (ad player engine)" );
                    return configutils.browser.frame(elem);
                })
                .nodeify(done);
        });

        it( 'Should Verify the Multiburn swf is Present',function(done) {
            configutils.browser             
                .hasElementByCss('#ryMultiburn_'+gid)
                    .should .eventually .be .true
                .takeScreenshot()
                .nodeify(done);
        });        

        it( 'Should Verify Header Message Text is Displayed Correctly',function(done) {
            configutils.browser
                .elementByCss('#ryInfoPanel #ryHeaderMessage').text()
                    .should .eventually .become('Please enjoy this message from our sponsor')
                .nodeify(done);
        });

        it( 'Should Verify the Countdown Text is Counting',function(done) {
            configutils.browser
                .elementByCss('#ryInfoPanel #divCountdown').text().then(validateText('#ryInfoPanel #divCountdown',10,1))
                .sleep(2 * _periodSeconds) // make sure that value changes
                .elementByCss('#ryInfoPanel #divCountdown').text().then(validateText('#ryInfoPanel #divCountdown',8,1))
                .nodeify(done);
        });
              
    //NOTE: The Close button disabled state needs to be checked before checking the countdown text   
        it( 'Should Verify the Skip button is Present',function(done) {
            configutils.browser
                .waitForElementByCssSelector('#ryContent #divSkip', checkForDisplayed, _periodSeconds * 25)                         
                .takeScreenshot()
                .nodeify(done);
        });

    // -----------------------------------------------------
    // ---- Reference Top Iframe
        it( 'Should Return to Top iframe',function(done) {
            configutils.browser
                // pop back to top (harness when not in facebook)
                .frame()
                .nodeify(done);                         
        });

    // -----------------------------------------------------
    // ---- Reference Test Iframe
        it( 'Should Return to Test iframe',function(done) {
            configutils.browser
                // enter test frame
                .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body').text()
                             .should .eventually .include('Rockyou Test Page') 
                })
                .nodeify(done);                         
        });

        it( 'Should Verify Ad Container is Still Up',function(done) {
            configutils.browser  
                .waitForElementByCss('#gadContainer[style*="visible"]').isDisplayed()
                    .should .eventually .be .true
                .nodeify(done);
        });

        it( 'Should Verify Ad Container is Hidden and Complete Test',function(done) {
            configutils.browser 
                .sleep(15 *_periodSeconds)
                .waitForElementByCss('#gadContainer[style*="hidden"]').isDisplayed()
                    .should .eventually .be .false
                .takeScreenshot()                
                .nodeify(done);
        });    
    });
});