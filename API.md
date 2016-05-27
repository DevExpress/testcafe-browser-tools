## Functions
<dl>
<dt><a href="#close">async close(pageUrl)</a></dt>
<dd><p>Closes the browser window where the specified web page is opened.</p>
</dd>
<dt><a href="#getBrowserInfo">async getBrowserInfo(browser)</a> ⇒ <code><a href="#BrowserInfo">BrowserInfo</a></code></dt>
<dd><p>Returns information about the specified browser.</p>
</dd>
<dt><a href="#getInstallations">async getInstallations()</a> ⇒ <code>Object.&lt;string, BrowserInfo&gt;</code></dt>
<dd><p>Returns the list of the <a href="#BrowserInfo">BrowserInfo</a> objects that contain information about the browsers installed on the machine.</p>
</dd>
<dt><a href="#isValidDeviceName">isValidDeviceName(inputString)</a></dt>
<dd><p>Checks if the provided string is a valid device name contained in the screen size database.</p>
</dd>
<dt><a href="#open">async open(browserInfo, pageUrl)</a></dt>
<dd><p>Opens the web page in a new instance of the browser.</p>
</dd>
<dt><a href="#resize">async resize(pageUrl, currentWidth, currentHeight, width, height)</a></dt>
<dd><p>Changes the browser&#39;s client area size to the new width and height.</p>
</dd>
<dt><a href="#resize">async resize(pageUrl, currentWidth, currentHeight, deviceName, [orientation])</a></dt>
<dd><p>Changes the browser&#39;s client area size according to the screen size of the target device.</p>
</dd>
<dt><a href="#screenshot">async screenshot(pageUrl, screenshotPath)</a></dt>
<dd><p>Takes a screenshot of the browser window where the specified web page is opened.</p>
</dd>
</dl>
## Typedefs
<dl>
<dt><a href="#BrowserInfo">BrowserInfo</a> : <code>Object</code></dt>
<dd><p>Object that contains information about the browser installed on the machine.</p>
</dd>
</dl>
<a name="close"></a>
## *async* close(pageUrl)
Closes the browser window where the specified web page is opened.

**Kind**: global [async](http://tc39.github.io/ecmascript-asyncawait/) function  

| Param | Type | Description |
| --- | --- | --- |
| pageUrl | <code>string</code> | Specifies the URL of the web page opened in the browser. |

<a name="getBrowserInfo"></a>
## *async* getBrowserInfo(browser) ⇒ <code>[BrowserInfo](#BrowserInfo)</code>
Returns information about the specified browser.

**Kind**: global [async](http://tc39.github.io/ecmascript-asyncawait/) function  
**Returns**: <code>[BrowserInfo](#BrowserInfo)</code> - An object that contains information about the specified browser.  

| Param | Type | Description |
| --- | --- | --- |
| browser | <code>string</code> | A browser alias ('chrome', 'ff', etc.) or a path to the browser's executable file. |

<a name="getInstallations"></a>
## *async* getInstallations() ⇒ <code>Object.&lt;string, BrowserInfo&gt;</code>
Returns the list of the [BrowserInfo](#BrowserInfo) objects that contain information about the browsers installed on the machine.

**Kind**: global [async](http://tc39.github.io/ecmascript-asyncawait/) function  
**Returns**: <code>Object.&lt;string, BrowserInfo&gt;</code> - List of the [BrowserInfo](#BrowserInfo) objects  containing information about the browsers installed on the machine.  
**Example**  
```js
{  chrome: {      path: 'C:\\ProgramFiles\\...\\chrome.exe',      cmd: '--new-window',      macOpenCmdTemplate: 'open -n -a "{{{path}}}" --args {{{pageUrl}}} {{{cmd}}}'  },  firefox: {      path: 'C:\\ProgramFiles\\...\\firefox.exe',      cmd: '-new-window',      macOpenCmdTemplate: 'open -a "{{{path}}}" {{{pageUrl}}} --args {{{cmd}}}'  }}
```
<a name="isValidDeviceName"></a>
## isValidDeviceName(inputString)
Checks if the provided string is a valid device name contained in the screen size database.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| inputString | <code>string</code> | The string to be validated. |

<a name="open"></a>
## *async* open(browserInfo, pageUrl)
Opens the web page in a new instance of the browser.

**Kind**: global [async](http://tc39.github.io/ecmascript-asyncawait/) function  

| Param | Type | Description |
| --- | --- | --- |
| browserInfo | <code>[BrowserInfo](#BrowserInfo)</code> | Provides information on the browser where the web page should be opened. |
| pageUrl | <code>string</code> | Specifies the web page URL. |

<a name="resize"></a>
## *async* resize(pageUrl, currentWidth, currentHeight, width, height)
Changes the browser's client area size to the new width and height.

**Kind**: global [async](http://tc39.github.io/ecmascript-asyncawait/) function  

| Param | Type | Description |
| --- | --- | --- |
| pageUrl | <code>string</code> | Specifies the URL of the web page opened in the browser. |
| currentWidth | <code>number</code> | Specifies the current width of the browser's client area, in pixels. Use the window.innerWidth property to determine it. |
| currentHeight | <code>number</code> | Specifies the current height of the browser's client area, in pixels. Use the window.innerHeight property to determine it. |
| width | <code>number</code> | Specifies the new client area width, in pixels. |
| height | <code>number</code> | Specifies the new client area height, in pixels. |

<a name="resize"></a>
## *async* resize(pageUrl, currentWidth, currentHeight, deviceName, [orientation])
Changes the browser's client area size according to the screen size of the target device.

**Kind**: global [async](http://tc39.github.io/ecmascript-asyncawait/) function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| pageUrl | <code>string</code> |  | Specifies the URL of the web page opened in the browser. |
| currentWidth | <code>number</code> |  | Specifies the current width of the browser's client area, in pixels. Use the window.innerWidth property to determine it. |
| currentHeight | <code>number</code> |  | Specifies the current height of the browser's client area, in pixels. Use the window.innerHeight property to determine it. |
| deviceName | <code>string</code> |  | Specifies the name of the target device. You can use the values specified in the Device Name column of [this table](http://viewportsizes.com/). |
| [orientation] | <code>string</code> | <code>&quot;landscape&quot;</code> | Specifies the device orientation: "portrait" or "landscape". |

<a name="screenshot"></a>
## *async* screenshot(pageUrl, screenshotPath)
Takes a screenshot of the browser window where the specified web page is opened.

**Kind**: global [async](http://tc39.github.io/ecmascript-asyncawait/) function  

| Param | Type | Description |
| --- | --- | --- |
| pageUrl | <code>string</code> | Specifies the URL of the web page opened in the browser. |
| screenshotPath | <code>string</code> | Specifies the full path to the screenshot file. For example, D:\Temp\chrome-screenshot.jpg. |

<a name="BrowserInfo"></a>
## BrowserInfo : <code>Object</code>
Object that contains information about the browser installed on the machine.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| path | <code>string</code> &#124; <code>undefined</code> | The path to the executable file that starts the browser.  Required on MacOS machines. On Windows machines, it is used when the winOpenCmdTemplate property is undefined. |
| cmd | <code>string</code> | Additional command line parameters. |
| macOpenCmdTemplate | <code>string</code> | A [Mustache template](https://github.com/janl/mustache.js#templates)  that provides parameters for launching the browser on a MacOS machine. |
| winOpenCmdTemplate | <code>string</code> &#124; <code>undefined</code> | A [Mustache template](https://github.com/janl/mustache.js#templates)  that provides parameters for launching the browser on a Windows machine.  If undefined, the path to the  executable file specified by the path property is used. |

**Example**  
```js
{      path: 'C:\\ProgramFiles\\...\\firefox.exe',      cmd: '-new-window',      macOpenCmdTemplate: 'open -a "{{{path}}}" {{{pageUrl}}} --args {{{cmd}}}' }
```
