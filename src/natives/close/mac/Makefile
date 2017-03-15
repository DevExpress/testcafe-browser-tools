all: clean build
clean:
	rm "${DEST}/close.scpt" || true
build:
	mkdir "${DEST}" || true
	osacompile -o "${DEST}/close.scpt" close.applescript
