#include <cstdlib>
#include <cstddef>
#include <iostream>
#include <sstream>
#include <exception>
#include "lib/lodepng.h"

inline unsigned char doubleToSubpixel (double x) {
	if (x > 255.0)
		return 255;

	if (x < 0.0)
		return 0;

	return (unsigned char)x;
}

// NOTE: Check Wikipedia for math: https://en.wikipedia.org/wiki/Bicubic_interpolation
double cubicInterpolation (double t, double t2, double t3, double f[4]) {
	double C[4] = {
		0 - 1 * t + 2 * t2 - 1 * t3,
		2 + 0 * t - 5 * t2 + 3 * t3,
		0 + 1 * t + 4 * t2 - 3 * t3,
		0 + 0 * t - 1 * t2 + 1 * t3,
	};

	return 0.5 * (C[0] * f[0] + C[1] * f[1] + C[2] * f[2] + C[3] * f[3]);
}

struct Image {
	unsigned char *data;

	size_t width;
	size_t height;
	size_t channels;
	size_t stride;

	Image (size_t width, size_t height, size_t channels = 4) {
		this->width = width;
		this->height = height;
		this->channels = channels;

		stride = width * channels;

		data = (unsigned char *)malloc(width * height * channels);

		if (!data)
			throw std::runtime_error("Memory allocation failed");
	}

	Image (const char* filename) {
		unsigned int pngWidth, pngHeight;

		unsigned error = lodepng_decode32_file(&data, &pngWidth, &pngHeight, filename);

		if (error)
			_throwLibraryError(error);

		width    = pngWidth;
		height   = pngHeight;
		channels = 4;
		stride   = width * channels;
	}

	~Image () {
		free(data);
	}

	void _throwLibraryError (unsigned errorCode) {
		std::stringstream msg;

		msg << "Error " << errorCode << ": " << lodepng_error_text(errorCode);

		throw std::runtime_error(msg.str());
	}

	void save (const char* filename) {
		unsigned error = lodepng_encode32_file(filename, data, width, height);

		if (error)
			_throwLibraryError(error);
	}

	unsigned char& subpixel (size_t y, size_t x, size_t channel) {
		static unsigned char sink;

		sink = 0;

		if (y >= height || x >= width)
			return sink;

		return data[y * stride + x * channels + channel];
	}

	// NOTE: Two dimensional cubic interpolation, chech Wikipedia for math:
	// https://en.wikipedia.org/wiki/Bicubic_interpolation
	void copyFrom (Image& src) {
		const double cx = double(src.width) / width;
		const double cy = double(src.height) / height;

		double interpolated[4];

		for (size_t i = 0; i < height; ++i) {
			const double targetY = cy * i;
			const size_t sourceY = (size_t) targetY;

			const double dy  = targetY - sourceY;
			const double dy2 = dy * dy;
			const double dy3 = dy2 * dy;

			for (size_t j = 0; j < width; ++j) {
				const double targetX = cx * j;
				const size_t sourceX = (size_t) targetX;

				const double dx  = targetX - sourceX;
				const double dx2 = dx * dx;
				const double dx3 = dx2 * dx;

				for (size_t k = 0; k < 3; ++k) {
					for (size_t ii = 0, interpolY = sourceY - 1; ii < 4; ++ii, ++interpolY) {
						double pixels[] = {
							src.subpixel(interpolY, sourceX - 1, k),
							src.subpixel(interpolY, sourceX, k),
							src.subpixel(interpolY, sourceX + 1, k),
							src.subpixel(interpolY, sourceX + 2, k)
						};

						interpolated[ii] = cubicInterpolation(dx, dx2, dx3, pixels);
					}

					subpixel(i, j, k) = doubleToSubpixel(cubicInterpolation(dy, dy2, dy3, interpolated));
				}

				subpixel(i, j, 3) = 255;
			}
		}
	}
};

int main (int argc, char *argv[]) {
	if (argc != 5) {
		std::cout << "Incorrect arguments" <<std::endl;
		return 1;
	}

	const char* sourceName = argv[1];

	// NOTE: The thumbnail directory has to be created before execution
	const char* thumbnailName = argv[2];

	int thumbnailWidth  = atoi(argv[3]);
	int thumbnailHeight = atoi(argv[4]);

	try {
		Image src(sourceName), dst(thumbnailWidth, thumbnailHeight);

		dst.copyFrom(src);

		dst.save(thumbnailName);
	}
	catch (std::exception& e) {
		std::cout << e.what() << std::endl;
		return 1;
	}

	return 0;
}
