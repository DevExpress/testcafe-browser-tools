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

For API reference, see the [API](API.md) document.

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
