# testcafe-browser-natives

[![Build Status](https://travis-ci.org/superroma/testcafe-browser-natives.svg)](https://travis-ci.org/superroma/testcafe-browser-natives)

TestСafe Browser Natives is a TestCafe library for performing platform-dependent actions on browser windows. 
Working with browsers is specific for each operating system and requires native code to deal with. Since TestCafe supports painless and simple installation, this package encapsulates pre-built binaries for all supported platforms and JS-wrappers around them. This helps end-users avoid running *post-npm-install* build actions.
 
#Build Process
To build native binaries from source files, execute the gulp task corresponding to your operating system:
```
'build-win'
'build-mac'
'build-linux'
```
Note that the application for a particular platform must be built on a machine with the same platform.

The *bin* directory contains pre-built native binaries. Consider using them if your contribution does not affect the native modules.

#Install

```
$ npm install testcafe-browser-natives
```
#API Reference

**Important note**: Most of the provided functions use a page URL to identify a browser window. However, depending on a browser, a browser window can be identified by a page URL or a web page title. Therefore, before calling the functions, you need to pass the page URL to the document title. Here is an example:
```js
document.title = document.location.toString()
```

##getInstallations
Returns the list of the **browserInfo** objects that contain information about the browsers installed on the machine.
```js
async getInstallations()
```

Here is an example of the **browserInfo** object structure.
```js
{
    path: 'C:\\ProgramFiles\\...\\chrome.exe', 
    cmd: '--new-window', 
    macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}' 
}
```

**path** – String (required). The path to the executable file that starts the browser.

**cmd** -  String (required). Additional command line parameters.

**macOpenCmdTemplate** – A [Mustache template](https://github.com/janl/mustache.js#templates) that provides parameters for launching the browser on a MacOS machine.

Below is the sample output of the **getInstallations** function:
```js
{
    chrome: {
        path: 'C:\\ProgramFiles\\...\\chrome.exe', 
        cmd: '--new-window', 
        macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}' 
    },

    firefox: {
        path: 'C:\\ProgramFiles\\...\\firefox.exe',  
        cmd: '-new-window', 
        macOpenCmdTemplate: 'open -a "{{{path}}}" {{{pageUrl}}} --args {{{cmd}}}'
    }
}
```

##open
Opens the web page in a new instance of the browser.
```js
async open(browserInfo, pageUrl)
```
**browserInfo** – Object (required). Provides information on the browser where the web page should be opened. See the object structure above.

**pageUrl** – String (required). Specifies the web page URL.

##close
Closes the browser window where the specified web page is opened.
```
async close(pageUrl) 
```
**pageUrl** – String (required). Specifies the URL of the web page opened in the browser.


##screenshot
Takes a screenshot of the browser window where the specified web page is opened.
```
async screenshot(pageUrl, screenshotPath) 
```
**pageUrl** -  String (required). Specifies the URL of the web page opened in the browser.

**screenshotPath** – String (required). Specifies the full path to the screenshot file. For example, *D:\Temp\chrome-screenshot.jpg*.


##resize
The function has two versions. The first one changes the browser window size to the new width and height.
```
async resize(pageUrl, width, height) 
```
**pageUrl** – String (required). Specifies the URL of the web page opened in the browser.

**width** – Integer (required). Specifies the new window width in pixels.

**height** – Integer (required). Specifies the new window height in pixels.


The other version of the **resize** function allows you to change the browser window size according to the screen size of the target device.
```
async resize(pageUrl, deviceName, orientation) 
```
**pageUrl** – String (required). Specifies the URL of the web page opened in the browser.

**deviceName**  – String (required). Specifies the name of the target device. You can use the values specified in the **Device Name** column of [this table](http://viewportsizes.com/).

**orientation** - String (optional). Specifies the device orientation: *"portrait"* or *"landscape"* (by default).

#Testing

To run automated tests:
```
$ npm test
```
Since the module functionality depends on browsers available on a testing machine and you cannot predict expected returned values for some functions, the automated tests cover only a part of the functionality.  
To test all the functions provided by the module, use the playground. To run it, execute the gulp task corresponding to your operating system:
```
$ gulp run-playground-win 
$ gulp run-playground-mac
$ gulp run-playground-linux
```
This will open the Playground web page at [http://localhost:1334/](http://localhost:1334/), where you can manually check if the functions work correctly.

#Author

Developer Express Inc.([http://devexpress.com](http://devexpress.com))
