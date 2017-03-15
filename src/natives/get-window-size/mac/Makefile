all: clean build
clean:
	rm "${DEST}/get-window-size.scpt" || true
build:
	mkdir "${DEST}" || true
	osacompile -o "${DEST}/get-window-size.scpt" get-window-size.applescript
