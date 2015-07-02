//
//  shot_window.m
//  ShotWindow
//

#import <Cocoa/Cocoa.h>


NSString* getTestCafeWindowID(NSString* windowTitle);
int createWindowShot (CGWindowID windowID, NSString* path, NSString* fileName, NSString* previewFolder, NSString*previewWidth, NSString* previewHeight);
void createFolder(NSString* path);
int saveImage(NSString* fullPath, CGImageRef image);
CGImageRef getReducedImage(CGImageRef image, int previewWidth, int previewHeight);

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSString* windowID = getTestCafeWindowID([NSString stringWithUTF8String:argv[1]]);
        
        if([windowID intValue] == 0) {
            fprintf(stderr, "There are no TestCafe windows\n");
            return 1;
        }
        else {
            printf("Window is found\n");
            return createWindowShot([windowID intValue],
                                  [NSString stringWithUTF8String:argv[2]],
                                  [NSString stringWithUTF8String:argv[3]],
                                  [NSString stringWithUTF8String:argv[4]],
                                  [NSString stringWithUTF8String:argv[5]],
                                  [NSString stringWithUTF8String:argv[6]]
                                  );
        }
    }
    return 0;
}

NSString* getTestCafeWindowID(NSString* windowTitle)
{
    CFArrayRef windowList = CGWindowListCopyWindowInfo(1, kCGNullWindowID);
    
    CFIndex i, count = CFArrayGetCount(windowList);
    NSString *windowID = nil;
    
    for(i=0;i<count;i++) {
        NSDictionary *dict = (NSDictionary *) CFArrayGetValueAtIndex(windowList, i);
        for(NSString *key in dict) {
            if ([key isEqualToString: @"kCGWindowName"]) {
                NSString *value = (NSString *)[dict objectForKey: key];
                NSRange textRange = [value rangeOfString: windowTitle];
                
                if(textRange.location != NSNotFound) {
                    windowID = (NSString *) [dict objectForKey: @"kCGWindowNumber"];
                }
            }
        }
    }
    
    CFRelease(windowList);
    return windowID;
}

int createWindowShot (CGWindowID windowID, NSString* path, NSString* fileName, NSString* previewFolder, NSString*previewWidth, NSString* previewHeight)
{
    createFolder(path);
    
    CGImageRef screenshotImage = CGWindowListCreateImage(CGRectNull, kCGWindowListOptionIncludingWindow, windowID, kCGWindowImageDefault);
    CGImageRef previewImage = getReducedImage(screenshotImage,  [previewWidth intValue], [previewHeight intValue]);
    
    NSString *screenshotFullPath = [NSString stringWithFormat:@"%@/%@", path, fileName];
    int screenshotSavingResult = saveImage(screenshotFullPath, screenshotImage);
    
    if(screenshotSavingResult == -1)
        return screenshotSavingResult;
    
    createFolder([NSString stringWithFormat:@"%@/%@", path, previewFolder]);
    NSString *previewFullPath = [NSString stringWithFormat:@"%@/%@/%@", path, previewFolder, fileName];
    int previewSavingResult = saveImage(previewFullPath, previewImage);
    
    return previewSavingResult;
}

void createFolder(NSString* path){
    NSFileManager *fileManager = [[NSFileManager alloc] init];
    
    if(![fileManager fileExistsAtPath:path]) {
        [fileManager createDirectoryAtPath:path withIntermediateDirectories:YES attributes:nil error:NULL];
    }
    
    [fileManager release];
}


int saveImage(NSString* fullPath, CGImageRef image){
    CFURLRef url = (__bridge CFURLRef)[NSURL fileURLWithPath:fullPath];
    CGImageDestinationRef destination = CGImageDestinationCreateWithURL(url, kUTTypePNG, 1, NULL);
    
    if (!destination) {
        fprintf(stderr, "Failed to create CGImageDestination for %s\n", [fullPath UTF8String]);
        return 2;
    }
    
    CGImageDestinationAddImage(destination, image, nil);
    
    if (!CGImageDestinationFinalize(destination)) {
        fprintf(stderr, "Failed to save screenshot to %s\n", [fullPath UTF8String]);
        CFRelease(destination);
        return 3;
    }
    
    CFRelease(image);
    CFRelease(destination);

    return 0;
}

CGImageRef getReducedImage(CGImageRef image, int previewWidth, int previewHeight){
    CGSize zCGSizeOutputImage = CGSizeMake(previewWidth,previewHeight);
    
    NSInteger zIntBitmapBytesPerRow  = zCGSizeOutputImage.width * 4;
    NSInteger zIntBitmapTotalBytes  = zIntBitmapBytesPerRow * zCGSizeOutputImage.height;
    
    CGContextRef zContextOutImage = CGBitmapContextCreate(malloc(zIntBitmapTotalBytes),
                                                          zCGSizeOutputImage.width,
                                                          zCGSizeOutputImage.height,
                                                          8,
                                                          zIntBitmapBytesPerRow,
                                                          CGColorSpaceCreateDeviceRGB(),
                                                          (CGBitmapInfo)kCGImageAlphaPremultipliedLast
                                                          );
    
    CGRect zRectOutputImage = CGRectMake(0.0,0.0,previewWidth,previewHeight);
    CGContextDrawImage(zContextOutImage,zRectOutputImage, image);
    CGImageRef zCGImageOutput = CGBitmapContextCreateImage(zContextOutImage);
    return zCGImageOutput;
}