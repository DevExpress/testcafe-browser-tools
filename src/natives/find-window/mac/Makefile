all: clean build
clean:
	rm "${DEST}/find-window.scpt" || true
build:
	mkdir "${DEST}" || true
	osacompile -o "${DEST}/find-window.scpt" find-window.applescript
