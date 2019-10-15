UNAME := $(shell uname -s)

all: clean build
clean:
ifeq ("${UNAME}", "Darwin")
	rm "${DEST}/lodepng.o" || true
	rm "${DEST}/generate-thumbnail.o" || true
else
	rm "${DEST}/generate-thumbnail" || true
endif
build:
	mkdir "${DEST}" || true
ifeq ("${UNAME}", "Darwin")
	${CXX} -c -o "${DEST}/lodepng.o" -DLODEPNG_NO_COMPILE_CPP lib/lodepng.cpp
	${CXX} -c -o "${DEST}/generate-thumbnail.o" generate-thumbnail.cpp
else
	${CXX} -o "${DEST}/generate-thumbnail" -DLODEPNG_NO_COMPILE_CPP lib/lodepng.cpp generate-thumbnail.cpp
endif
