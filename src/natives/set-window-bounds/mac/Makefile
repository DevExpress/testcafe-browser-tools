all: clean build
clean:
	rm "${DEST}/set-window-bounds" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/set-window-bounds" -framework Cocoa -framework ScriptingBridge set-window-bounds.m
