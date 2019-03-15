const {Builder, By, Key, until} = require('selenium-webdriver');

var chai = require('chai');

var expect = chai.expect;

var gid = '4ADB159116';
var width  = '690px';
var height  = '390px';
var url = 'https://example.com/ads/';
var _periodSeconds = 1000;
var _pollPeriodMs = 500;


let driver = new Builder()
.forBrowser('firefox')
.build();

describe( 'Test for DtD HTML5 using ADSCore' , function(){
    
       before(function(){
            return driver.get( 'https://example.com/ads/  ' );   
       });
    
       after(function(){
    
           return driver.quit();
    
       });

                    it( 'Should Launch the Test for ' + gid,function(done) {
                        try{
                        driver.wait(until.titleIs('Ads Interface Test Page'), 10000);
                        
                        var ADSCore_link =  driver.findElement(By.id('ui-id-2'));
                        
                        driver.wait(until.elementIsVisible(ADSCore_link),15000);
                        
                        ADSCore_link.click();
                        driver.getTitle().then(function(title){
                            expect(title).equals('Ads Interface Test Page');
                        });
                        driver.wait(until.elementIsVisible(driver.findElement(By.id('vpc_adjs')),20000));
                        driver.findElement(By.css('#vpc_adjs input#rcjs_gid')).sendKeys(gid);
                        driver.findElement(By.css('#vpc_adjs input#rcjs_width')).sendKeys(width);
                        driver.findElement(By.css('#vpc_adjs input#rcjs_height')).sendKeys(height);
                        driver.findElement(By.css('#rcjs_deal')).click();
                        driver.findElement(By.css('#vpc_adjs tr td:first-child button')).click();
                        var frame = driver.findElement(By.css('iframe#iframe-content-panel'));
                        driver.wait(until.elementIsVisible(frame),20000).then(function(){
                            done();
                        });
                            
                        
                    }catch(error){
                        done(error);
                    }
                        
                        
                    });
                    
                    it( 'Should Select Test Frame',function(done) {
                        var frame = driver.findElement(By.css('iframe#iframe-content-panel'));
                        driver.wait(until.elementIsVisible(frame),20000);
                        driver.switchTo().frame(frame);
                        var RYTP_Title = driver.findElement(By.css('html body table tbody tr td h2'));
                        driver.wait(until.elementIsVisible(RYTP_Title),20000);
                        //
                        RYTP_Title.getText().then(function(title){
                            expect(title).equals('Rockyou Test Page')
                            .then(function(){
                                done();
                            });
                        })
                        
                        
                        
                    });
                    
                    it( 'Should Click Reload Button to Load Deal',function(done) {
                        var reloadButton = driver.findElement(By.id('btnReload'));
                        driver.wait(until.elementIsVisible(reloadButton,20000));
                        reloadButton.click()
                        .then(function(){
                            done();
                        });                      
                    }); 
                    
                    it( 'Should Select Ad Content Frame',function(done) {
                        var frame = driver.findElement(By.name('ad_player_engine_'+gid));
                        driver.wait(until.elementIsVisible(frame,20000));
                        driver.switchTo().frame(frame)
                        .then(function(){
                            done();
                        });
                    });
                    it( 'Should Verify the Multiburn swf is Present',function(done) {
                        driver.findElement(By.id('ryMultiburn_'+gid)).isDisplayed().then(function(result){
                            expect(result).equals(true);
                        }).then(function(){
                            done();
                        });
                    });
                    
                    
    });
