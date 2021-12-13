all: clean build
clean:
	rm "${DEST}/testcafe-browser-tools" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/testcafe-browser-tools" testcafe-browser-tools.m
	clang -o "${DEST}/../../../main" -framework Cocoa -framework ScriptingBridge -framework AppKit ../../*/{mac,any}/obj/*.o main.m

