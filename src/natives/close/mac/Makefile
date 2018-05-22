all: clean build
clean:
	rm "${DEST}/close" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/close" -framework Cocoa -framework ScriptingBridge close.m
