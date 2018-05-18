all: clean build
clean:
	rm "${DEST}/find-window" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/find-window" -framework Cocoa -framework ScriptingBridge find-window.m
