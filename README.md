# testcafe-browser-natives

[![Build Status](https://travis-ci.org/superroma/testcafe-browser-natives.svg)](https://travis-ci.org/superroma/testcafe-browser-natives)

The TestCafe Browser Natives module provides API functions that allow you to perform various actions with a browser window. These actions require different native applications for different operating systems (Windows and MacOS).

**Important note**: Most of the provided functions use a page URL to identify a browser window. However, depending on a browser, a browser window can be identified by a page URL or a web page title. Therefore, before calling the functions, you need to pass the page URL to the document title. Here is an example:
```
document.title = document.location.toString()
```


##getInstallations
Returns the **browsersInfo** object that provides information about all the browsers installed on the machine.
```
async getInstallations()
```
Below is the sample structure of the **browsersInfo** object:
```
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

**path** – String (required). The path to the executable file that starts the browser.

**cmd** -  String (required). Additional command line parameters.

**macOpenCmdTemplate** – A [Mustache template](https://github.com/janl/mustache.js#templates)  that provides parameters for launching the browser on a MacOS machine.


##open
Opens the web page in a new instance of the browser.
```
async open(browserInfo, pageUrl)
```
**browserInfo** – Object (required). Provides information on the browser where the web page should be opened. See the object structure below.

**pageUrl** – String (required). Specifies the web page URL.

Here is an example of the **browserInfo** object structure. The object has the same fields as the **browsersInfo** object has.
```
{
    path: 'C:\\ProgramFiles\\...\\chrome.exe', 
    cmd: '--new-window', 
    macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}' 
}
```


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
async resize(pageUrl, deviceName) 
```
**pageUrl** – String (required). Specifies the URL of the web page opened in the browser.

**deviceName**  – String (required). Specifies the name of the target device. You can use the values specified in the **Device Name** column of [this table](http://viewportsizes.com/).
