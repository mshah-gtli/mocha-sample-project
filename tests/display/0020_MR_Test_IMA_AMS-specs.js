'use strict;'

stdutils = require('../../libs/standardutils');
configutils = require('../../libs/configurationutils').create();


var gid = '4D2B658660';
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
describe('0020_MR_Test_IMA_AMS-InProgress',function() {
    configutils.register(this);    
    // test description
    before( configutils.before );
    afterEach( configutils.afterEach );
    after( configutils.after ); 
    
    describe('Test for MR Test IMA using AMS',function() {

        it( 'Should Launch the Test for ' + gid,function(done) {
           configutils.browser
    // COM1:This part needs to be moved into a utility function
            .get(url)
            .title()
                .should .become('Ads Interface Test Page')
            .elementByCss('.ui-menu-item:nth-child(8) a[id="ui-id-8"]') // AMS 300x250
            .click()
            .elementByCss('#vpc_medium_rectangle').isDisplayed()
                .should .eventually .be .true 
            .elementByCss('#vpc_medium_rectangle input#Mrectangle_gid').clear().type(gid).getValue()
                .should .eventually .be .equal(gid)
            .elementByCss('#vpc_medium_rectangle tr td:first-child button')
            .click()
            .takeScreenshot()
            .nodeify(done);
    // COM1:This part needs to be moved into a utility function
        });

        it( 'Should Select Test Frame',function(done) {
            configutils.browser
    // COM2:Make easy use function for selection and verification of iframes
                .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem);
                })
                .nodeify(done);
              
    // COM2:Make easy use function for selection and verification of iframes            
        }); 

        it( 'Should Sleep to get video to appear',function(done) {
            configutils.browser 
                .sleep(5 * _periodSeconds) 
                .takeScreenshot()
                .nodeify(done);
        });

        it( 'Should Select Ad Content Frame',function(done) {
            configutils.browser            
                .waitForElementByCss('iframe[id*="_gad_'+gid+'"]').then(function(elem){
                    stdutils.writeInfo( "Entering iframe (gad Content)" );
                    return configutils.browser.frame(elem);
                })
                .nodeify(done);
        });

        it( 'Should Sleep to end of Video for the z Image to appear',function(done) {
            configutils.browser 
                .sleep(25 * _periodSeconds)                                
                .nodeify(done);
        });

        it( 'Should Verify the z Image',function(done) {
            configutils.browser 
                .sleep(10 * _periodSeconds)                       
                .waitForElementByCss('a[href*="src=house_ads"]').isDisplayed()
                    .should .eventually .be .true                
                .nodeify(done);
        });
     // z click-through steps ----------------------------
      
        it( 'Should Click on the z Image to Open New Tab',function(done) {
            configutils.browser 
                .elementByCss('a[href*="src=house_ads"]')
                 .click()
                .nodeify(done);
        });

        it( 'Should Sleep Until New Window Appears',function(done) {
            configutils.browser 
                .sleep(10 * _periodSeconds)
                .takeScreenshot()                              
                .nodeify(done);
        });

        it( 'Should Verify New Window is there',function(done) {
            configutils.browser.windowHandles()
                .should .eventually .be .at .least(2)
                .nodeify(done);
       });
    // z click-through steps ----------------------------       

    });
});