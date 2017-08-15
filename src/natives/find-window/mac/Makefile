all: clean build
clean:
	rm "${DEST}/find-window.scpt" || true
	rm "${DEST}/find-window-cocoa" || true
build:
	mkdir "${DEST}" || true
	osacompile -o "${DEST}/find-window.scpt" find-window.applescript
	clang -o "${DEST}/find-window-cocoa" -framework Cocoa find-window-cocoa.m
