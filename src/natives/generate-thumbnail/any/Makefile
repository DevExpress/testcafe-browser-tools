all: clean build
clean:
	rm "${DEST}/generate-thumbnail" || true
build:
	mkdir "${DEST}" || true
	clang++ -o "${DEST}/generate-thumbnail" lib/lodepng.cpp generate-thumbnail.cpp
