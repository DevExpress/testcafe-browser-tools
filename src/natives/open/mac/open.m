//
//  open.m
//  Open a Safari window
//

#include "../../utils/mac/utils.h"

enum CloseOptions {
    CloseOptionsYes = 'yes ' /* Save the file. */,
    CloseOptionsNo  = 'no  ' /* Do not save the file. */,
    CloseOptionsAsk = 'ask ' /* Ask the user whether or not to save the file. */
};

int main (int argc, const char * argv[]) {
    if (argc < 2) {
        printf("Incorrect arguments\n");
        return 1;
    }
    
    @autoreleasepool {
		id url    = [NSString stringWithUTF8String:argv[1]];
        id safari = [SBApplication applicationWithBundleIdentifier: @"com.apple.safari"];
        
		id documentProps = @{
			@"URL": url
		};

		id document = [[[safari classForScriptingClass: @"document"] alloc] initWithProperties: documentProps];
        
		[[safari documents] addObject: document];
		[document release];
	}
	         
    return 0;
}

