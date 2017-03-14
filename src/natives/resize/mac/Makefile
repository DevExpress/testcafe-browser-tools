all: clean build
clean:
	rm "${DEST}/resize.scpt" || true
build:
	mkdir "${DEST}" || true
	osacompile -o "${DEST}/resize.scpt" resize.applescript
