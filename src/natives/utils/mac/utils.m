//
//  utils.m
//  Utility functions for working with ScriptingBridge
//
#include "./utils.h"

id getApplicationForProcess (NSString *processId) {
    return [SBApplication applicationWithProcessIdentifier: [processId intValue]];
}

id getWindowOfApplication (id app, NSString *windowId) {
    id windows            = [app windows];
    id windowsProperties  = [windows arrayByApplyingSelector:@selector(properties)];

    NSUInteger index = [windowsProperties indexOfObjectPassingTest:^(NSDictionary *properties, NSUInteger index, BOOL *stop){ 
        return [[properties[@"id"] stringValue] isEqualToString: windowId];
    }];

    if (index == NSNotFound)
        return nil;
            
    return windows[index];
}

id getWindowOfProcess (NSString *processId, NSString *windowId) {
    id app = getApplicationForProcess(processId);

    return getWindowOfApplication(app, windowId);    
}    
