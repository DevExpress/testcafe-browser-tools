all: clean build
clean:
	rm "${DEST}/resize" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/resize" -framework Cocoa -framework ScriptingBridge resize.m
