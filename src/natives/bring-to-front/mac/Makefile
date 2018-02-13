all: clean build
clean:
	rm "${DEST}/bring-to-front.scpt" || true
build:
	mkdir "${DEST}" || true
	osacompile -o "${DEST}/bring-to-front.scpt" bring-to-front.applescript
