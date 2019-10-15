//
//  close.m
//  Close a window
//

#include "../../utils/mac/utils.h"

enum CloseOptions {
    CloseOptionsYes = 'yes ' /* Save the file. */,
    CloseOptionsNo  = 'no  ' /* Do not save the file. */,
    CloseOptionsAsk = 'ask ' /* Ask the user whether or not to save the file. */
};

int closeWindow (int argc, const char * argv[]) {
    if (argc < 3) {
        printf("Incorrect arguments\n");
        return 1;
    }
    
    @autoreleasepool {
        NSString *processId = [NSString stringWithUTF8String:argv[1]];
        NSString *windowId = [NSString stringWithUTF8String:argv[2]];
        
        id window = getWindowOfProcess(processId, windowId);

        @try {             
            [window closeSaving:CloseOptionsNo savingIn: nil];
            return 0;
        }
        @catch (NSException *e) {

        }

        @try {             
            [window close];
            return 0;
        }
        @catch (NSException *e) {

        }
    }

    return 0;
}

