//
//  open.m
//  Open a Safari window
//
#import <ScriptingBridge/ScriptingBridge.h>

int openWindow (int argc, const char * argv[]) {
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
		[safari activate];
	}

    return 0;
}

