//
//  utils.m
//  Utility functions for working with ScriptingBridge
//
#include "./utils.h"

id getApplicationForProcess (NSString *processId) {
    return [SBApplication applicationWithProcessIdentifier: [processId intValue]];
}

id getWindowOfApplication (id app, NSString *windowId) {
    id windows = [app windows];

    for (id window in windows) {
        if ([[window properties][@"id"] intValue] == [windowId intValue])
            return window;
    }

    return nil;
}

id getWindowOfProcess (NSString *processId, NSString *windowId) {
    id app = getApplicationForProcess(processId);

    return getWindowOfApplication(app, windowId);    
}
