UNAME := $(shell uname -s)

ifeq ("${UNAME}", "Darwin")
    include ../../utils/mac/targets.mak
endif

all: clean build

clean:
ifeq ("${UNAME}", "Darwin")
	rm "${DEST}/lodepng-x86.o" || true
	rm "${DEST}/generate-thumbnail-x86.o" || true
	rm "${DEST}/lodepng-arm.o" || true
	rm "${DEST}/generate-thumbnail-arm.o" || true
else
	rm "${DEST}/generate-thumbnail" || true
endif

build:
	mkdir "${DEST}" || true
ifeq ("${UNAME}", "Darwin")
	${CXX} -c -o "${DEST}/lodepng-x86.o" $(TARGET_ARGS_X86) -DLODEPNG_NO_COMPILE_CPP lib/lodepng.cpp
	${CXX} -c -o "${DEST}/generate-thumbnail-x86.o" $(TARGET_ARGS_X86) generate-thumbnail.cpp
	${CXX} -c -o "${DEST}/lodepng-arm.o" $(TARGET_ARGS_ARM) -DLODEPNG_NO_COMPILE_CPP lib/lodepng.cpp
	${CXX} -c -o "${DEST}/generate-thumbnail-arm.o" $(TARGET_ARGS_ARM) generate-thumbnail.cpp
else
	${CXX} -o "${DEST}/generate-thumbnail" -DLODEPNG_NO_COMPILE_CPP lib/lodepng.cpp generate-thumbnail.cpp
endif
