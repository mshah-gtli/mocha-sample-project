# Selenium Testing Automation Libraries #

This repo contains a library of helper utilities that can be used with automated testing

## Functions ##

### Setup ###

```rySetup(config, timeout, loadAndVerify)``` - Simplify the initialization of the harness. Config is an object containing the following variables, all which are optional:

```
{
    assetPath: "production",
    containerHeight: 400
    containerWidth: 200,
    disableGameUI: true,
    enableDeal: true,
    enableIdleRoll: true,
    enableNoAdCallback: true,
    enableRBG: true,
    enableRewardPanel: true,   
    enableSendPersonalInfo: false,
    host: "gadsdev2a.example.com",
    nameSpace: "ryCore",    
    page: "DtD",
    gid: "C2F2258649",
    protocol: "http",   
    secretKey: "secret",
    server: "127.0.0.1",
    thirdPartyPubId: "pubId",   
    userId: "blach",   
}
```

**loadAndVerify** is a boolean value that instructs the setup procdure to load the add and verify the ad frame is in place (calls selectAdFrame)

To setup, load and verify, you can do something like this:
```
var config = {
	host: "gadsdev2a.example.com",
    server: "127.0.0.1",
    assetPath: "production",
    protocol: "http",
    gid: "",
    enableDeal: true,
}

...
browser
	.rySetup(config, 5000, true)
...
```

```disableGameUI(disableGameUI)``` - Enable/disable game UI (boolean)

```enableDeal(enableDeal)``` - Enable/disable deal (boolean)

```enableIdleRoll(enableIdleRoll)``` - Enable/disable idle roll (boolean)

```enableNoAdCallback(enableNoAdCallback)``` - Enable/disable no callback (boolean)

```enableRBG(enableRBG)``` - Enable/disable RBG (boolean)

```enableRewardPanel(enableRewardPanel)``` - Enable/disable reward panel (boolean)

```enableSendPersonalInfo(enableSendPersonalInfo)``` - Enable/disable personal info (boolean)

```loadHarnessPage(page)``` - Loads the spefied page (string - must be one of the following: "ADSCore JS", "ADSCore Integrated", "Interstitial", "DtD", "300X250", "Ads Core Multiburn")

```selectAssetPath(assetPath)``` - Select the assetPath (string). Two possible values ("production" or "local")

```selectProtocol(protocol)``` - Selects the protocol (string). Two possible values ("http" or "https")

```selectServer(server)``` - Select the server by value (string). The value is the string value of the option in the server select box

```setContainerWidth(width)``` - Sets the width (int)

```setContainerHeight(height)``` - Sets the height (int)

```setHost(host)``` - Set the host (string)

```setNameSpace(nameSpace)``` - Sets the name space (string)

```setPlaceguid(gid)``` - Sets the gid (string)

```setSecretKey(secretKey)``` - Sets the secret key (string)

```setThirdPartyPubId(thirdPartyPubId)``` - Sets the third party pub ID (string)

```setUserId(userId)``` - Sets the user ID (string)


### Actions ###

```clickLoadButton()``` - Click the load ad button


### Utility ###

```setTextField(selector, text, timeout)``` - Sets the a selector-specified textfield with text (string)

```setCheckBox(selector, check)``` - Checks/unchecks a selector-specified checkbox or radio button based on check (boolean)

```selectMockServer()``` - Points the harness at the mock testing server

```selectAdFrame(gid, timeout)``` - Selects the ad iFrame. Requires the gid (string) and a timeout (int)