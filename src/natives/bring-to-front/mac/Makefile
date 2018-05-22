all: clean build
clean:
	rm "${DEST}/bring-to-front" || true
build:
	mkdir "${DEST}" || true
	clang -o "${DEST}/bring-to-front" -framework Cocoa -framework ScriptingBridge -framework AppKit bring-to-front.m
