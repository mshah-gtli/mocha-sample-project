'use strict;'

stdutils = require('../../libs/standardutils');
configutils = require('../../libs/configurationutils').create();


var gid = '9EB4458764';
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
describe('0017_DotD_Adap_Titlecard_AMS-InProgress',function() {
    configutils.register(this);    
    // test description
    before( configutils.before );
    afterEach( configutils.afterEach );
    after( configutils.after );
    
    describe('Test for DtD Adap Titlecard using AMS',function() {

        it( 'Should Launch the Test for ' + gid,function(done) {
           configutils.browser
    // COM1:This part needs to be moved into a utility function
            .get(url)
            .title()
                .should .become('Ads Interface Test Page')
            .elementByCss('.ui-menu-item:nth-child(7) a[id="ui-id-7"]') // AMS DtD tab
            .click()
            .elementByCss('#vpc_dotd').isDisplayed()
                .should .eventually .be .true 
            .elementByCss('#vpc_dotd input#dotd_gid').type(gid).getValue()
                .should .eventually .be .equal(gid)
            .elementByCss('#vpc_dotd tr td:first-child button')
            .click()
            .nodeify(done);
    // COM1:This part needs to be moved into a utility function
        });

        it( 'Should Select Test Frame',function(done) {
            configutils.browser
    // COM2:Make easy use function for selection and verification of iframes
                .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body').text()
                             .should .eventually .include('Loaded Jquery Version:1.5.0')
                })
                .nodeify(done);
        });

        it( 'Should Click Gift Box to Load Deal',function(done) {
            configutils.browser 
                .sleep(5 * _periodSeconds)                      
                .waitForElementByCss('.contentDiv #dotdButtonDiv input.freeOfferBtn')
                .click()
                .takeScreenshot()
                .nodeify(done);                           
        });       

        it( 'Should Select Ad Content Frame',function(done) {
            configutils.browser 
                .sleep(3 * _periodSeconds)                         
                .waitForElementByCss('#ryDotdContainerTab1ryDotdExternalResourceIframe').then(function(elem){
                    stdutils.writeInfo( "Entering iframe (ad player engine)" );
                    return configutils.browser.frame(elem);
                })
                .nodeify(done);
        });

        it( 'Should Verify the AdapTV Content',function(done) {
            configutils.browser 
                .sleep(2 * _periodSeconds)                           
                .waitForElementByCss('iframe[id*="adaptvAdFrame"]').isDisplayed()
                    .should .eventually .be .true                
                .nodeify(done);
        });

        it( 'Should Select Test Frame',function(done) {
            configutils.browser
                .frame()
    // COM2:Make easy use function for selection and verification of iframes
            .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body').text()
                             .should .eventually .include('Loaded Jquery Version:1.5.0')
                })
                .nodeify(done);
    // COM2:Make easy use function for selection and verification of iframes            
        }); 

        it( 'Should Verify Header Title Text is Displayed Correctly',function(done) {
            configutils.browser            
                .elementByCss('#ryDotdWrapper #ryDotdHeader').text()
                    .should .eventually .become('Free Offer')
                .nodeify(done);
        });

        it( 'Should Verify Header Message Text is Displayed Correctly',function(done) {
            configutils.browser             
                .elementByCss('#ryDotdWrapper #ryDotdHeaderMsg').text()
                    .should .eventually .become('(Example) Earn 15 Popcorns!')
                .nodeify(done);
        });
               
        it( 'Should Verify the Close button is Present',function(done) {
            configutils.browser                    
                .waitForElementByCssSelector('#ryDotdFooterWrapper #ryDotdCloseBtn', checkForDisplayed, _periodSeconds * 25)               
                .nodeify(done);                        
        });        

        it( 'Should Verify the Reward button is Present',function(done) {
            configutils.browser                    
                .waitForElementByCssSelector('#ryDotdContentDiv #ryDotdGetRewardBtn', checkForDisplayed, _periodSeconds * 25)               
                .nodeify(done);                        
        });         

        it( 'Should Click the Close button',function(done) {
            configutils.browser
                .elementByCss('#ryDotdFooterWrapper #ryDotdCloseBtn')
                .click() 
                .takeScreenshot()
                .nodeify(done);
        });

        it( 'Should Verify Ad Container is Hidden',function(done) {
            configutils.browser 
                .sleep(2 * _periodSeconds)
                .hasElementByCss('#ryDotdContentDiv')
                    .should .eventually .be .false
                .nodeify(done);
        });    

        it( 'Should Click Gift Box for Subsequent Load',function(done) {
            configutils.browser 
                .sleep(5 * _periodSeconds)                      
                .waitForElementByCss('.contentDiv #dotdButtonDiv input.freeOfferBtn')
                .click()
                .takeScreenshot()
                .nodeify(done);
        }); 

        it( 'Should Select Ad Content Frame',function(done) {
            configutils.browser 
                .sleep(3 * _periodSeconds)                         
                .waitForElementByCss('#ryDotdContainerTab1ryDotdExternalResourceIframe').then(function(elem){
                    stdutils.writeInfo( "Entering iframe (ad player engine)" );
                    return configutils.browser.frame(elem);
                })
                .nodeify(done);
        });

        it( 'Should Verify the AdapTV Content',function(done) {
            configutils.browser 
                .sleep(2 * _periodSeconds)                           
                .waitForElementByCss('iframe[id*="adaptvAdFrame"]').isDisplayed()
                    .should .eventually .be .true                
                .nodeify(done);
        });

        it( 'Should Select Test Frame',function(done) {
            configutils.browser
                .frame()
    // COM2:Make easy use function for selection and verification of iframes
            .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                    stdutils.writeInfo( "Entering iframe (content panel)" );
                    return configutils.browser.frame(elem).elementByCss('body').text()
                             .should .eventually .include('Loaded Jquery Version:1.5.0')
                })
                .nodeify(done);
    // COM2:Make easy use function for selection and verification of iframes            
        }); 

        it( 'Should Verify Header Title Text is Displayed Correctly',function(done) {
            configutils.browser 
                .sleep(2 * _periodSeconds)                      
                .elementByCss('#ryDotdWrapper #ryDotdHeader').text()
                    .should .eventually .become('Free Offer')
                .nodeify(done);
        });

        it( 'Should Verify Header Message Text is Displayed Correctly',function(done) {
            configutils.browser
                .elementByCss('#ryDotdWrapper #ryDotdHeaderMsg').text()
                    .should .eventually .become('(Example) Earn 15 Popcorns!')
                .nodeify(done);
        });
           
        it( 'Should Verify the Close button is Present',function(done) {
            configutils.browser                    
                .waitForElementByCssSelector('#ryDotdFooterWrapper #ryDotdCloseBtn', checkForDisplayed, _periodSeconds * 25)               
                .nodeify(done);                        
        });

        it( 'Should Verify the Reward button is Present',function(done) {
            configutils.browser                    
                .waitForElementByCssSelector('#ryDotdContentDiv #ryDotdGetRewardBtn', checkForDisplayed, _periodSeconds * 25)               
                .nodeify(done);                        
        });  

        it( 'Should Click the Reward button',function(done) {
            configutils.browser
                .sleep(25 * _periodSeconds)             
                .elementByCss('#ryDotdContentDiv #ryDotdGetRewardBtn')
                .click() 
                .takeScreenshot()
                .nodeify(done);
        });                        

    // -----------------------------------------------------

        it( 'Should Verify Ad Container is Still Up',function(done) {
            configutils.browser 
                .sleep(10 * _periodSeconds)             
                .waitForElementByCss('#ryDotdContentDiv').isDisplayed()
                    .should .eventually .be .true
                .nodeify(done);
        });

        it( 'Should Verify Reward Header Message Text is Displayed Correctly',function(done) {
            configutils.browser
                .sleep(20 * _periodSeconds)
                .waitForElementByCss('#ryDotdWrapper #ryDotdHeaderMsg').text()
                    .should .eventually .become('You earned 15 Popcorn!')
                .nodeify(done);
        });

        it( 'Should Verify the Close button is Present',function(done) {
            configutils.browser                    
                .waitForElementByCssSelector('#ryDotdFooterWrapper #ryDotdCloseBtn', checkForDisplayed, _periodSeconds * 25)               
                .nodeify(done);                        
        });

        it( 'Should Click the Close button',function(done) {
            configutils.browser
                .elementByCss('#ryDotdFooterWrapper #ryDotdCloseBtn')
                .click() 
                .takeScreenshot()
                .nodeify(done);
        });

        it( 'Should Verify Ad Container is Hidden and Complete Test',function(done) {
            configutils.browser 
                .sleep(2 * _periodSeconds)
                .hasElementByCss('#ryDotdContentDiv')
                    .should .eventually .be .false
                .nodeify(done);
        });    

    });
});