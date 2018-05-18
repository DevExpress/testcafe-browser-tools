all: clean build
clean:
	rm "${DEST}/get-window-size" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/get-window-size" -framework Cocoa -framework ScriptingBridge get-window-size.m
