include targets.mak


all: clean build

clean:
	rm "${DEST}/utils-x86.o" || true
	rm "${DEST}/utils-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/utils-x86.o" $(TARGET_ARGS_X86) utils.m
	clang -c -o "${DEST}/utils-arm.o" $(TARGET_ARGS_ARM) utils.m
