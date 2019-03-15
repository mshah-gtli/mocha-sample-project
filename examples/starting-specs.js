'use strict;'

stdutils = require('../libs/standardutils');
initutils = require('../libs/initializationutils');

var gid = '8192958637';
var width  = '690px';
var height  = '390px';
// var url = 'https://example.com/ads/';
var url = 'https://example.com/ads/&request_host=gadsdev2f.example.com';
var _periodSeconds = 1000;
var _pollPeriodMs = 500;

// This is pretty nasty
// On the result of a text query using css
// check text, if text is not a number or empty
// try again up to _retries.  This is a good candidate for
// adding a promise interface
function validateText(css,max,min,retries) {
    var _css = css, _min = min, _max = max, _retries = retries;
    if( !_retries || _retries > 10 ) {_retries = 10; }
    return function(text){
        var value = Number.NaN;
        try {value = parseInt( text ); } catch( e ) {}
        if( _retries > 0 && (!value || value == Number.NaN) ) {
            stdutils.writeWarn( "Not ready ... retries " + _retries );
            return initutils.browser.sleep( _pollPeriodMs )
                        .elementByCss(_css).text()
                            .then(validateText(_css,_max,_min,_retries-1));
        }
        stdutils.writeInfo( "Validating ... " + value );
        assert( _max >= value && value >= _min, (_css + " value ("+ value+") is not between "+_min+" and "+_max) );
        stdutils.writeSuccess( "Was between " + _max + " and " + _min );
        return initutils.browser;
    }
}

describe('Example Selenium Test Framework',function() {
    count=1;
    before( function(done) { 
        initutils.setupTest( 'Testing against', ['example']);
        initutils.before(done); 
    } );
    afterEach( initutils.afterEach );
    after( initutils.after );

    it( 'Launch the ad test for ' + gid,function(done) {
       initutils.browser
// COM1:This part needs to be moved into a utility function
        .get(url)
        .title()
            .should .become('Ads Interface Test Page')
        .elementByCss('.ui-menu-item:nth-child(2) a[id="ui-id-2"]') // ADSCore JS
        .click()
        .elementByCss('#vpc_adjs').isDisplayed()
            .should .eventually .be .true 
        .elementByCss('#vpc_adjs input#adjs-guid').type(gid).getValue()
            .should .eventually .be .equal(gid)
        .elementByCss('#vpc_adjs input#adjs-width').type(width).getValue()
            .should .eventually .be .equal(width)
        .elementByCss('#vpc_adjs input#adjs-height').type(height).getValue()
            .should .eventually .be .equal(height)
        .elementByCss('#vpc_adjs tr td:first-child button')
        .click()
        .takeScreenshot()
        .nodeify(done);
// COM1:This part needs to be moved into a utility function
    });
    it( 'Select Ad Content Frame ' + (count++),function(done) {
        initutils.browser
// COM2:Make easy use function for selection and verification of iframes
            .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                stdutils.writeInfo( "Entering iframe (content panel)" );
                return initutils.browser.frame(elem).elementByCss('body').text()
                         .should .eventually .include('ADSCore Ads Test Page')
            })
// COM2:Make easy use function for selection and verification of iframes
            .waitForElementByCss('#gadContainer iframe[name="ad_player_engine_'+gid+'"][style*="'+width+'"][style*="'+height+'"][style*="inherit"]', 10 * _periodSeconds, _pollPeriodMs).then(function(elem){
                stdutils.writeInfo( "Entering iframe (ad player engine)" );
                return initutils.browser.frame(elem);
            })
            .takeScreenshot()
            .nodeify(done);
    });
    it( 'Validate Visual Components ' + (count++),function(done) {
        initutils.browser
            .elementByCss('#ryInfoPanel #ryHeaderMessage').text()
                .should .eventually .become('Please enjoy this message from our sponsor')
            .waitForElementByCss('#ryInfoPanel #divClose.disabled').isDisplayed()
                .should .eventually .be .true
            .waitForElementByCss('#ryContent #divSkip.notConfigured').isDisplayed()
                .should .eventually .be .false
            /*.hasElementByCssSelector('object[type*="x-shockwave-flash"][id^="'+gid+'"]') // multi burn swf
                .should .eventually .be .true*/
            .hasElementByCssSelector('#contentDiv div#adaptvDiv') // video 
                .should .eventually .be .true
            .takeScreenshot()
            .nodeify(done);
    });
    it( 'Validate Countdown and Visual Components ' + (count++),function(done) {
        initutils.browser
            .elementByCss('#ryInfoPanel #divCountdown').text().then(validateText('#ryInfoPanel #divCountdown',10,1))
            .sleep(2 * _periodSeconds) // make sure that value changes
            .elementByCss('#ryInfoPanel #divCountdown').text().then(validateText('#ryInfoPanel #divCountdown',8,1))
            .waitForElementByCss('#ryContent #divSkip').isDisplayed() // skip should still be false
                .should .eventually .be .false
            .takeScreenshot()
            .nodeify(done);
    });
    it( 'Select Test Frame ' + (count++),function(done) {
        initutils.browser
            // pop back to top (harness when not in facebook)
            .frame()
            // enter test frame
            .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                stdutils.writeInfo( "Entering iframe (content panel)" );
                return initutils.browser.frame(elem).elementByCss('body').text()
                         .should .eventually .include('ADSCore Ads Test Page')
            })
            .waitForElementByCss('div#gadContainer[style*="hidden"]', 30 * _periodSeconds, _pollPeriodMs ).isDisplayed()
                .should .eventually .be .false
            .takeScreenshot()
            .nodeify(done);
    });
    it( 'Start next ad ' + (count++),function(done) {
        initutils.browser
            .waitForElementByCss('#btnReload')
            .click()
            .waitForElementByCss('#gadContainer[style*="visible"]', 10 * _periodSeconds, _pollPeriodMs ).isDisplayed()
                .should .eventually .be .true
            .waitForElementByCss('#gadContainer iframe[name="ad_player_engine_'+gid+'"][style*="'+width+'"][style*="'+height+'"][style*="inherit"]', 10 * _periodSeconds, _pollPeriodMs).then(function(elem){
                stdutils.writeInfo( "Entering iframe (ad player)" );
                return initutils.browser.frame(elem);
            })
            .takeScreenshot()
            .nodeify(done);
    });
    it( 'Validate Visual Components ' + (count++),function(done) {
        initutils.browser
            .sleep( 5 * _periodSeconds )
            .waitForElementByCss('#ryInfoPanel #divClose', 10 * _periodSeconds, _pollPeriodMs)
            .click()
            .takeScreenshot()
            .nodeify(done);
    });
    it( 'Change to test iframe ' + (count++),function(done) {
        initutils.browser
            // pop back to top (harness when not in facebook)
            .frame()
            // enter test frame
            .elementByCss('iframe#iframe-content-panel').then(function(elem) {
                stdutils.writeInfo( "Entering iframe (content panel)" );
                return initutils.browser.frame(elem).elementByCss('body').text()
                         .should .eventually .include('ADSCore Ads Test Page')
            })
            .nodeify(done);
    });
    it( 'Complete test ' + (count++),function(done) {
        initutils.browser
            .waitForElementByCss('#gadContainer[style*="hidden"]' ,30 * _periodSeconds, _pollPeriodMs ).isDisplayed()
                .should .eventually .be .false
            .nodeify(done);
    });
});
