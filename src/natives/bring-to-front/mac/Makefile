include ../../utils/mac/targets.mak


all: clean build

clean:
	rm "${DEST}/bring-to-front-x86.o" || true
	rm "${DEST}/bring-to-front-arm.o" || true

build:
	mkdir "${DEST}" || true

	clang -c -o "${DEST}/bring-to-front-x86.o" $(TARGET_ARGS_X86) bring-to-front.m
	clang -c -o "${DEST}/bring-to-front-arm.o" $(TARGET_ARGS_ARM) bring-to-front.m
