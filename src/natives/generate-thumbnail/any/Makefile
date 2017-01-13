all: clean build
clean:
	rm "${DEST}/generate-thumbnail" || true
build:
	mkdir "${DEST}" || true
	${CXX} -o "${DEST}/generate-thumbnail" -DLODEPNG_NO_COMPILE_CPP lib/lodepng.cpp generate-thumbnail.cpp
