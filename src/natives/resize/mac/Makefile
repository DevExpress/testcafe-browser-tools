include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/resize-x86.o" || true
	rm "${DEST}/resize-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/resize-x86.o" $(TARGET_ARGS_X86) resize.m
	clang -c -o "${DEST}/resize-arm.o" $(TARGET_ARGS_ARM) resize.m
