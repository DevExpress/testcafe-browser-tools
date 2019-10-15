all: clean build
clean:
	rm "${DEST}/testcafe-browser-tools" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/testcafe-browser-tools" -framework Cocoa -framework ScriptingBridge -framework AppKit ../../*/{mac,any}/obj/*.o testcafe-browser-tools.m
