include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/testcafe-browser-tools" || true
	rm "${DEST}/../../../main" || true
	rm "${DEST}/testcafe-browser-tools-x86" || true
	rm "${DEST}/../../../main-x86" || true
	rm "${DEST}/testcafe-browser-tools-arm" || true
	rm "${DEST}/../../../main-arm" || true

build:
	mkdir "${DEST}" || true

	clang -o "${DEST}/testcafe-browser-tools-x86" $(TARGET_ARGS_X86) -Wl,-no_adhoc_codesign testcafe-browser-tools.m
	clang -o "${DEST}/../../../main-x86" $(TARGET_ARGS_X86) -Wl,-no_adhoc_codesign -framework Cocoa -framework ScriptingBridge -framework AppKit ../../*/{mac,any}/obj/*-x86.o main.m

	clang -o "${DEST}/testcafe-browser-tools-arm" $(TARGET_ARGS_ARM) -Wl,-no_adhoc_codesign testcafe-browser-tools.m
	clang -o "${DEST}/../../../main-arm" $(TARGET_ARGS_ARM) -Wl,-no_adhoc_codesign -framework Cocoa -framework ScriptingBridge -framework AppKit ../../*/{mac,any}/obj/*-arm.o main.m

	codesign --identifier "com.devexpress.testcafe-browser-tools" --sign - "${DEST}/testcafe-browser-tools-x86"
	codesign --identifier "com.devexpress.testcafe-browser-tools" --sign - "${DEST}/../../../main-x86"
	codesign --identifier "com.devexpress.testcafe-browser-tools" --sign - "${DEST}/testcafe-browser-tools-arm"
	codesign --identifier "com.devexpress.testcafe-browser-tools" --sign - "${DEST}/../../../main-arm"

	lipo -create "${DEST}/testcafe-browser-tools-x86" "${DEST}/testcafe-browser-tools-arm" -o "${DEST}/testcafe-browser-tools" 
	lipo -create "${DEST}/../../../main-x86" "${DEST}/../../../main-arm" -o "${DEST}/../../../main" 

	rm "${DEST}/testcafe-browser-tools-x86" || true
	rm "${DEST}/../../../main-x86" || true
	rm "${DEST}/testcafe-browser-tools-arm" || true
	rm "${DEST}/../../../main-arm" || true
