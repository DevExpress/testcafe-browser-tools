//
//  utils.h
//  Utility functions for working with ScriptingBridge
//

#import <ScriptingBridge/ScriptingBridge.h>

id getApplication (NSString *processId) {
    return [SBApplication applicationWithProcessIdentifier: [processId intValue]];
}

id getWindowForApplication (id app, NSString *windowId) {
    id windows            = [app windows];
    id windowsProperties  = [windows arrayByApplyingSelector:@selector(properties)];

    NSUInteger index = [windowsProperties indexOfObjectPassingTest:^(NSDictionary *properties, NSUInteger index, BOOL *stop){ 
        return [[properties[@"id"] stringValue] isEqualToString: windowId];
    }];

    if (index == NSNotFound)
        return nil;
            
    return windows[index];
}

id getApplicationWindow (NSString *processId, NSString *windowId) {
    id app = getApplication(processId);

    return getWindowForApplication(app, windowId);    
}    