all: clean build
clean:
	rm "${DEST}/set-window-bounds.scpt" || true
build:
	mkdir "${DEST}" || true
	osacompile -o "${DEST}/set-window-bounds.scpt" set-window-bounds.applescript
