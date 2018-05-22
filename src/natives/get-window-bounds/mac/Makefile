all: clean build
clean:
	rm "${DEST}/get-window-bounds" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/get-window-bounds" -framework Cocoa -framework ScriptingBridge get-window-bounds.m
