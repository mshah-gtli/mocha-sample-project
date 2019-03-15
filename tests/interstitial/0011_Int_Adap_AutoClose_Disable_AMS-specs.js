'use strict;'

stdutils = require('../../libs/standardutils');
configutils = require('../../libs/configurationutils').create();


var gid = 'A729F58643';
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
describe('0011_Int_Adap_AutoClose_Disable_AMS-InProgress',function() {
    configutils.register(this);    
    // test description
    before( configutils.before );
    afterEach( configutils.afterEach );
    after( configutils.after ); 
    
    describe('Test for Adap AutoClose Disable using AMS',function() {

        it( 'Should Launch the Test for ' + gid,function(done) {
           configutils.browser
    // COM1:This part needs to be moved into a utility function
            .get(url)
            .title()
                .should .become('Ads Interface Test Page')
            .elementByCss('.ui-menu-item:nth-child(6) a[id="ui-id-6"]') // Interstitial tab
            .click()
            .takeScreenshot()        
            .elementByCss('#vpc_interstitial').isDisplayed()
                .should .eventually .be .true 
            .takeScreenshot()            
            .elementByCss('#vpc_interstitial input#interstitial_gid').type(gid).getValue()
                .should .eventually .be .equal(gid)
            .takeScreenshot()            
            .elementByCss('#vpc_interstitial tr td:first-child button')
            .click()
            .nodeify(done);
        });

        it( 'Should Select Test Frame',function(done) {
            configutils.browser
    // COM2:Make easy use function for selection and verification of iframes
            .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body').text()
                             .should .eventually .include('Loaded Jquery Version:1.9.1')
                })
                .nodeify(done);
    // COM2:Make easy use function for selection and verification of iframes            
        });

        it( 'Should Verify Header Message is Displayed',function(done) {
            configutils.browser
                .sleep(5 * _periodSeconds)             
                .elementByCss('.ryIauContentHeaderHolder').text()
                    .should .eventually .become('Please enjoy this message from our sponsor')
                .nodeify(done);
        });        


        it( 'Should Verify the Skip button is Present',function(done) {
            configutils.browser
                .waitForElementByCssSelector('.ryInterstitialCloseButton', checkForDisplayed, _periodSeconds * 25)                         
                .takeScreenshot()
                .nodeify(done);                        
        });

        it( 'Should Click the Skip button',function(done) {
            configutils.browser
                .elementByCss('.ryInterstitialCloseButton')
                .click() 
                .takeScreenshot()
                .nodeify(done);                        
        });

        it( 'Should Verify ad iframe Hidden',function(done) {
            configutils.browser 
                .sleep(5 * _periodSeconds)
                .hasElementByCss('#ryIauExternalResourceIframe')
                    .should .eventually .be .false
                .nodeify(done);
        });    

        it( 'Should Click Show Ad button for Subsequent Load',function(done) {
            configutils.browser 
                .sleep(20 * _periodSeconds)             
                .hasElementByCss('#interstitialAdBtnHolder input.adBtn')
                    .should .eventually .be .true
                .elementByCss('#interstitialAdBtnHolder input')
                .click()
                .takeScreenshot()
                .nodeify(done);
        });
 
        it( 'Should Verify the Skip button is Present',function(done) {
            configutils.browser
                .waitForElementByCssSelector('.ryInterstitialCloseButton', checkForDisplayed, _periodSeconds * 25)                         
                .takeScreenshot()
                .nodeify(done);                        
        });

        it( 'Should Verify the Skip button Still Up',function(done) {
            configutils.browser  
                .sleep(15 * _periodSeconds)                  
                .waitForElementByCss('.ryInterstitialCloseButton').isDisplayed()
                    .should .eventually .be .true
                .nodeify(done);
        });

        it( 'Should Verify ad iframe is Still Up and Complete Test',function(done) {
            configutils.browser 
                .sleep(20 * _periodSeconds)              
                .hasElementByCss('#ryIauExternalResourceIframe')
                    .should .eventually .be .true
                .nodeify(done);
        });   

    });
});