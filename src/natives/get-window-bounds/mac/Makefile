all: clean build
clean:
	rm "${DEST}/get-window-bounds.scpt" || true
build:
	mkdir "${DEST}" || true
	osacompile -o "${DEST}/get-window-bounds.scpt" get-window-bounds.applescript
