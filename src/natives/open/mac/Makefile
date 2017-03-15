all: clean build
clean:
	rm "${DEST}/open.scpt" || true
build:
	mkdir "${DEST}" || true
	osacompile -o "${DEST}/open.scpt" open.applescript
