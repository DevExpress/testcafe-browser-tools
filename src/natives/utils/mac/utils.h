#pragma once
//
//  utils.h
//  Utility functions for working with ScriptingBridge
//

#import <ScriptingBridge/ScriptingBridge.h>

id getApplicationForProcess (NSString *processId);

id getWindowOfApplication (id app, NSString *windowId);

id getWindowOfProcess (NSString *processId, NSString *windowId);    