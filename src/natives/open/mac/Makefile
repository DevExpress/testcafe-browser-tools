all: clean build
clean:
	rm "${DEST}/open" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/open" -framework Cocoa -framework ScriptingBridge open.m
