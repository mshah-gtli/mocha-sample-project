require('colors');
var wd = require('wd');
var _ = require('lodash');
var chai = require('chai');
var should = chai.should();

// stubbs for planned functions
//+there need to be two for each
//+one for promises and one for
//+async waiting

// Utility for loading the harness, selecting the correct tab
// entering url/gid/width/height, selecting correct options
// clicking the load button, waiting for iframe to appear,
// and entering the iframe
wd.addPromiseChainMethod( 
    'loadHarness', 
    function( item, settings, timeout ) {
    
    }
);
wd.addAsyncMethod( 
    'loadHarnessWhenReady', 
    function( item, settings, timeout ) {
        var cb = wd.findCallback(arguments);
        var argss = wd.varargs;
        var _this = this;
        this.waitForElementByCssSelector( selector, timeout , function( selector, cb ) {
            _this.frame(selector)
        } );
    } 
);

// Utility for finding iframe by css, verifing iframe is
// ready and then selecting it
wd.addPromiseChainMethod( 
    'iframeByCss', 
    function( item, settings, timeout ) {
    
    }
);
wd.addAsyncMethod( 
    'iframeByCssWhenReady', 
    function( selector, timeout ) {
        var cb = wd.findCallback(arguments);
        var argss = wd.varargs;
        var _this = this;
        this.waitForElementByCssSelector( selector, timeout , function( selector, cb ) {
            _this.frame(selector)
        } );
    } 
);

// Simplify selection of the mock server
wd.addPromiseChainMethod( 
    'selectMockServer',
    function() {
        this
            .elementByCss("#adserver_host option[value='127.0.0.1']")
            .click();
    }
);

// Select the ad iFrame and verify that is contains the content div
wd.addAsyncMethod(
    'selectAdFrame',
    function(gid, timeout) {
        var _this = this;
        var cb = wd.findCallback(arguments);
        var selector = "ad_player_engine_" + gid;

        this.waitForElementByCssSelector("#" + selector, timeout, function() {
            _this
                .frame(selector)
                .waitForElementByCssSelector("#content", wd.asserters.isDisplayed, timeout, cb)
        });
    }
);

// Setup helpers
wd.addAsyncMethod(
    'rySetup',
    function(config, timeout, loadAndVerify) {
        var _this = this;
        var cb = wd.findCallback(arguments);
        var verify = function(err) {
            if (err)
                return cb(err);
        };

        this
            .disableGameUI(config.disableGameUI || false, verify)
            .enableDeal(config.enableDeal || false, verify)
            .enableIdleRoll(config.enableIdleRoll || false, verify)
            .enableNoAdCallback(config.enableNoAdCallback || false, verify)
            .enableRBG(config.enableRBG || false, verify)
            .enableRewardPanel(config.enableRewardPanel || false, verify)            
            .enableSendPersonalInfo(config.enableSendPersonalInfo || false, verify)
            .loadHarnessPage(config.page || "", verify)  
            .selectAssetPath(config.assetPath || "", verify)
            .selectProtocol(config.protocol || "", verify)
            .selectServer(config.server || "", verify)
            .setContainerWidth(config.containerWidth || -1, verify)
            .setContainerHeight(config.containerHeight || -1)            
            .setHost(config.host || "", verify)         
            .setNameSpace(config.nameSpace || "", verify)   
            .setPlaceguid(config.gid || "", verify)
            .setSecretKey(config.secretKey || "", verify)
            .setThirdPartyPubId(config.thirdPartyPubId || "", verify)
            .setUserId(config.userId || "", function() {
                if (loadAndVerify) {
                    console.log("load&verify");
                    _this
                        .clickLoadButton()
                        .frame("iframe-content-panel")
                        .selectAdFrame(config.gid, timeout, cb)
                } else {
                    cb();
                }
            });
    }
);

wd.addAsyncMethod(
    'selectAdFrame',
    function(gid, timeout) {
        var _this = this;
        var cb = wd.findCallback(arguments);
        var selector = "ad_player_engine_" + gid;

        this.waitForElementByCssSelector("#" + selector, timeout, function(err, el) {
            if (err)
                cb()

            _this
                .frame(selector)
                .waitForElementByCssSelector("#content", wd.asserters.isDisplayed, timeout, cb)
        });
    }
);

wd.addAsyncMethod( 
    'setHost',
    function(host, timeout) {
        var cb = wd.findCallback(arguments);
        console.log("setHost", host);
        if (host != "") {
            this.setTextField("#request_host", host, timeout);
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'selectServer',
    function(server, timeout) {
        console.log("selectServer", server);
        var cb = wd.findCallback(arguments);
        if (server != "") {
            this
                .elementByCssSelector("#adserver_host option[value='" + server + "']")
                .click(cb);
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'selectAssetPath',
    function(assetPath, timeout) {
        console.log("selectAssetPath", assetPath);
        var cb = wd.findCallback(arguments);
        if (assetPath == "production") {
            this
                .elementByCssSelector("#asset_path_production")
                .click(cb)
        } else if (assetPath == "local") {
            this
                .elementByCssSelector("#asset_path_local")
                .click(cb)
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'selectProtocol',
    function(protocol, timeout) {
        console.log("selectProtocol", protocol);
        var selectors = {
            "ADSCore JS": ["#anjs_protocol_chzn", "#anjs_protocol_chzn_o_0", "#anjs_protocol_chzn_o_1"],
            "ADSCore Integrated": ["#aniframe_protocol_chzn", "#aniframe_protocol_chzn_o_0", "#aniframe_protocol_chzn_o_1"],
            "Interstitial": ["#interstitial_protocol_chzn", "#interstitial_protocol_chzn_o_0", "#interstitial_protocol_chzn_o_1"],
            "DtD": ["#dotd_protocol_chzn", "#dotd_protocol_chzn_o_0", "#dotd_protocol_chzn_o_1"],
            "300X250": ["#medium_rectangle_protocol_chzn", "#medium_rectangle_protocol_chzn_o_0", "#medium_rectangle_protocol_chzn_o_1"],
            "Ads Core Multiburn": ["#anmjs_protocol_chzn", "#anmjs_protocol_chzn_o_0", "#anmjs_protocol_chzn_o_1"]
        }
        var cb = wd.findCallback(arguments);

        if (protocol != "") {
            var selectorArr = selectors[this.ryHarnessPage];
            var row = (protocol == "http") ? selectorArr[1] : selectorArr[2];
            this
                .waitForElementByCssSelector(selectorArr[0], wd.asserters.isDisplayed, timeout, function(err, el) {
                    if (err) {
                        cb(err);
                    }

                    el.click().elementByCssSelector(row).click(cb);
                });
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'setPlaceguid',
    function(gid, timeout) {
        console.log("setPlaceguid", gid);
        var selectors = {
            "ADSCore JS": "#adjs-guid",
            "ADSCore Integrated": "#integrated-guid",
            "Interstitial": "#interstitial-guid",
            "DtD": "#DtD-guid",
            "300X250": "#medium-rectangle-guid",
            "Ads Core Multiburn": "#adsmultiburn-intguid"
        };
        var cb = wd.findCallback(arguments);
        if (gid != "" && typeof selectors[this.ryHarnessPage] != "undefined") {
            this.setTextField(selectors[this.ryHarnessPage], gid, timeout);
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'setNameSpace',
    function(nameSpace, timeout) {
        console.log("setNameSpace", nameSpace);
        var cb = wd.findCallback(arguments);
        if (nameSpace != "" && this.ryHarnessPage == "ADSCore JS") {
            this.setTextField("#adjs-namespace", nameSpace, timeout);
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'setUserId',
    function(userId, timeout) {
        console.log("setUserId", userId);
        var selectors = {
            "ADSCore JS": "#adjs-userid",
            "DtD": "#DtD-userid",
        };
        var cb = wd.findCallback(arguments);
        if (userId != "" && typeof selectors[this.ryHarnessPage] != "undefined") {
            this.setTextField(selectors[this.ryHarnessPage], userId, timeout);    
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'enableDeal',
    function(enableDeal, timeout) {
        console.log("enableDeal", enableDeal);
        var cb = wd.findCallback(arguments);
        if (this.ryHarnessPage == "ADSCore JS") {
            this.setCheckBox("#adjs-deal", enableDeal, timeout);              
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'enableRewardPanel',
    function(enableRewardPanel, timeout) {
        console.log("enableRewardPanel", enableRewardPanel);
        var cb = wd.findCallback(arguments);
        if (this.ryHarnessPage == "ADSCore JS") {
            this.setCheckBox("#adjs-reward-panel", enableRewardPanel, timeout);              
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'setContainerWidth',
    function(containerWidth, timeout) {
        console.log("setContainerWidth", containerWidth);
        var selectors = {
            "ADSCore JS": "#adjs-width",
            "ADSCore Integrated": "#integrated-width",
        };
        var cb = wd.findCallback(arguments);
        if (containerWidth != -1 && typeof selectors[this.ryHarnessPage] != "undefined") {
            this.setTextField(selectors[this.ryHarnessPage], containerWidth, timeout);    
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'setContainerHeight',
    function(containerHeight, timeout) {
        console.log("setContainerWidth", containerHeight);
        var selectors = {
            "ADSCore JS": "#adjs-height",
            "ADSCore Integrated": "#integrated-height",
        };
        var cb = wd.findCallback(arguments);
        if (containerHeight != -1 && typeof selectors[this.ryHarnessPage] != "undefined") {
            this.setTextField(selectors[this.ryHarnessPage], containerHeight, timeout); 
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'setThirdPartyPubId',
    function(pubId, timeout) {
        console.log("setThirdPartyPubId", pubId);
        var selectors = {
            "Interstitial": "#interstitial-pubid",
            "300X250": "#meduim_rectangle-pubid"
        };
        var cb = wd.findCallback(arguments);
        if (pubId != "" && typeof selectors[this.ryHarnessPage] != "undefined") {
            this.setTextField(selectors[this.ryHarnessPage], pubId, timeout); 
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'enableNoAdCallback',
    function(noAdCallback, timeout) {
        console.log("enableNoAdCallback", noAdCallback);
        var selectors = {
            "Interstitial": "#interstitial-callback",
            "DtD": "#DtD-callback"
        };
        var cb = wd.findCallback(arguments);
        if (typeof selectors[this.ryHarnessPage] != "undefined") {
            this.setCheckBox(selectors[this.ryHarnessPage], noAdCallback, timeout);  
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'enableSendPersonalInfo',
    function(sendPersonalInfo, timeout) {
        console.log("enableSendPersonalInfo", sendPersonalInfo);
        var selectors = {
            "Interstitial": "#interstitial-appid",
            "DtD": "#DtD-appid",
            "300X250": "#meduim_rectangle-appid"
        };
        var cb = wd.findCallback(arguments);
        if (typeof selectors[this.ryHarnessPage] != "undefined") {
            this.setCheckBox(selectors[this.ryHarnessPage], sendPersonalInfo, timeout);  
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'disableGameUI',
    function(disableGameUI, timeout) {
        console.log("disableGameUI", disableGameUI);
        var selectors = {
            "Interstitial": "#modal-box",
            "DtD": "#DtD-modal-box"
        };
        var cb = wd.findCallback(arguments);
        if (typeof selectors[this.ryHarnessPage] != "undefined") {
            this.setCheckBox(selectors[this.ryHarnessPage], disableGameUI, timeout);  
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'enableIdleRoll',
    function(enableIdleRoll, timeout) {
        console.log("enableIdleRoll", enableIdleRoll);
        var cb = wd.findCallback(arguments);
        if (this.ryHarnessPage == "Interstitial") {
            this.setCheckBox("#interstitial-idle-roll", enableIdleRoll, timeout);  
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'setSecretKey',
    function(secretKey, timeout) {
        console.log("setSecretKey", secretKey);
        var cb = wd.findCallback(arguments);
        if (secretKey != "" && this.ryHarnessPage == "DtD") {
            this.setTextField("#DtD-secret", secretKey, timeout);
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'enableRBG',
    function(enableRBG, timeout) {
        console.log("enableRBG", enableRBG);
        var cb = wd.findCallback(arguments);
        if (this.ryHarnessPage == "DtD") {
            this.setCheckBox("#DtD-iargb", enableRBG, timeout);  
        } else {
            cb();
        }
    }
);

wd.addAsyncMethod( 
    'setBannerPlaceguid',
    function(bannerPlaceguid, timeout) {
        console.log("setBannerPlaceguid", bannerPlaceguid);
        var cb = wd.findCallback(arguments);
        if (bannerPlaceguid != "" && this.ryHarnessPage == "Ads Core Multiburn") {
            this.setTextField("#adsmultiburn-banguid", bannerPlaceguid, timeout);
        } else {
            cb();
        }
    }
);


wd.addAsyncMethod( 
    'clickLoadButton',
    function() {
        var cb = wd.findCallback(arguments);
        console.log("clickLoadButton");
        this
            .elementByCss("#btn-load")
            .click(cb);
    }
);

wd.addAsyncMethod( 
    'setTextField',
    function(selector, text, timeout) {
        var cb = wd.findCallback(arguments);
        this.waitForElementByCssSelector(selector, timeout, function(err, el) {
            if (err)
                return cb(err);

            el.clear().type(text, cb);
        });
    }
);

wd.addAsyncMethod( 
    'setCheckBox',
    function(selector, check, timeout) {
        var cb = wd.findCallback(arguments);
        this
            .elementByCssSelector(selector, function(err, el) {
                el.isSelected(function(err, selected) {
                    if (selected != check) {
                        el.click(cb)
                    }
                });                   
            });  
    }
);

wd.addAsyncMethod( 
    'loadHarnessPage',
    function(page) {
        var cb = wd.findCallback(arguments);
        var selector;
        this.ryHarnessPage = page;

        switch(page) {
            case "ADSCore JS":
                selector = "#ui-id-2";
                break;
            case "ADSCore Integrated":
                selector = "#ui-id-3";
                break;
            case "Interstitial":
                selector = "#ui-id-6";
                break;
            case "DtD":
                selector = "#ui-id-7";
                break;
            case "300X250":
                selector = "#ui-id-8";
                break;
            case "Ads Core Multiburn":
                selector = "#ui-id-9";
                break;
            default:
                cb();
        }

        this
            .elementByCssSelector(selector)
            .click()
            .elementByCssSelector("span#iframe_widget")
            .text(function(err, text) {
                if (err)
                    return cb(err);

                if (text == page) {
                    cb();
                } else {
                    cb(new Error("Page title didn't match expected title"));
                }
            });

    }
);