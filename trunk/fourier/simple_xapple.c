#ifndef XAPPLE_INTERNAL_1
#include <GL/gl.h>
#include <stdlib.h>
#include <stdio.h>
#include <limits.h>

#include "ngl.h"

static int N, samplespersec, samplelen, bitspersample, numchannels;
static ngl_display_t xapple_ngldpy = NULL;
static ngl_win_t xapple_nglwin = NULL;

void	xapple_init(const int _N, const int _samplespersec, const int _samplelen, const int _bitspersample, const int _numchannels) {
	N = _N;
	samplespersec = _samplespersec;
	samplelen = _samplelen;
	bitspersample = _bitspersample;
	numchannels = _numchannels;

	if (ngl_open_display(&xapple_ngldpy) != 0) {
		fprintf(stderr, "Unable to open display.\r\n");
		exit(EXIT_FAILURE);
	}

	if (ngl_create_window(&xapple_nglwin, xapple_ngldpy, 0, 0, -1, -1, "FFFS Xapple") != 0) {
		fprintf(stderr, "Unable to create window.\r\n");
		exit(EXIT_FAILURE);
	}

	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glEnable(GL_NORMALIZE);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

static int MIN(const int a, const int b) {
	return((a < b)?a:b);
}

static int MAX(const int a, const int b) {
	return((a > b)?a:b);
}

void	xapple_sample(const void *_buf, const double *Lmags, const double *Rmags) {
	const int COLS = ngl_win_width(xapple_nglwin), LINES = ngl_win_height(xapple_nglwin);
	int	i;

	glBegin(GL_QUADS);
		glColor4ub(0xFF, 0xFF, 0xFF, 0x50);
		glVertex2d(0, 0);
		glVertex2d(COLS, 0);
		glColor4ub(0x55, 0x55, 0x55, 0x50);
		glVertex2d(COLS, LINES/3);
		glVertex2d(0, LINES/3);

		glVertex2d(COLS, LINES/3);
		glVertex2d(0, LINES/3);
		glVertex2d(0, 5*LINES/6);
		glVertex2d(COLS, 5*LINES/6);

		glVertex2d(0, 5*LINES/6);
		glVertex2d(COLS, 5*LINES/6);
		glColor4ub(0, 0, 0, 0x50);
		glVertex2d(COLS, LINES);
		glVertex2d(0, LINES);
	glEnd();

	glPushMatrix();

	if ((bitspersample == 16) && (numchannels == 2)) {
		const struct {
			const int16_t L, R;
		} *buf = _buf;
		const int maxval = SHRT_MAX;
		const int zeropoint = LINES/2;

#define XAPPLE_INTERNAL_1
#include "xapple.c"
#undef XAPPLE_INTERNAL_1
	} else if ((bitspersample == 16) && (numchannels == 1)) {
		const union {
			const int16_t L, R;
		} *buf = _buf;
		const int maxval = SHRT_MAX;
		const int zeropoint = LINES/2;

#define XAPPLE_INTERNAL_1
#include "xapple.c"
#undef XAPPLE_INTERNAL_1
	} else if ((bitspersample == 8) && (numchannels == 2)) {
		const struct {
			const unsigned char L, R;
		} *buf = _buf;
		const int maxval = 0x80;
		const int zeropoint = 0;

#define XAPPLE_INTERNAL_1
#include "xapple.c"
#undef XAPPLE_INTERNAL_1
	} else if ((bitspersample == 8) && (numchannels == 1)) {
		const union {
			const unsigned char L, R;
		} *buf = _buf;
		const int maxval = 0x80;
		const int zeropoint = 0;

#define XAPPLE_INTERNAL_1
#include "xapple.c"
#undef XAPPLE_INTERNAL_1
	}

#else
		for (i = 0; i < COLS; i++) {
			int	left = zeropoint+(LINES/2)*buf[samplelen*i/COLS].L/maxval,
				right = zeropoint+(LINES/2)*buf[samplelen*i/COLS].R/maxval,
				j,
				Lmag = LINES*Lmags[N*i/COLS]/maxval,
				Rmag = LINES*Rmags[N*i/COLS]/maxval;

			for (j = N*i/COLS+1; j < N*(i+1)/COLS; j++) {
				Lmag = MAX(Lmag, LINES*Lmags[j]/maxval);
				Rmag = MAX(Rmag, LINES*Rmags[j]/maxval);
			}
			Lmag = MIN(Lmag, LINES);
			Rmag = MIN(Rmag, LINES);

			if (Lmag+Rmag > 0) {
# if 0
				if (Lmag > Rmag) {
					if (Rmag > 0) {
						glColor3ub(0xAD, 0x00, 0xAD);
						glBegin(GL_LINES);
						glVertex2d(i, 0);
						glVertex2d(i, Rmag);
						glEnd();
					}
					glBegin(GL_LINES);
						glColor3ub(0xAD, 0x00, 0x00);
						glVertex2d(i, Rmag);
						glVertex2d(i, Lmag-Rmag);
					glEnd();
				} else if (Rmag > Lmag) {
					if (Lmag > 0) {
						glBegin(GL_LINES);
							glColor3ub(0xAD, 0x00, 0xAD);
							glVertex2d(i, 0);
							glVertex2d(i, Lmag);
						glEnd();
					}
					glBegin(GL_LINES);
						glColor3ub(0x00, 0x00, 0xAD);
						glVertex2d(i, Lmag);
						glVertex2d(i, Rmag-Lmag);
					glEnd();
				} else {
					glBegin(GL_LINES);
						glColor3ub(0xAD, 0x00, 0xAD);
						glVertex2d(i, 0);
						glVertex2d(i, Lmag);
					glEnd();
				}
# else
				glBegin(GL_LINES);
					glColor4ub(0xAD, 0x00, 0x00, 0x80);
					glVertex2d(i, 0);
					glVertex2d(i, Lmag);

					glColor4ub(0x00, 0x00, 0xAD, 0x80);
					glVertex2d(i, 0);
					glVertex2d(i, Rmag);
				glEnd();
# endif
			}

			if (i > 0) {
				int	lleft = zeropoint+(LINES/2)*buf[samplelen*(i-1)/COLS].L/maxval,
					lright = zeropoint+(LINES/2)*buf[samplelen*(i-1)/COLS].R/maxval;

				glLineWidth(5.0);
				glBegin(GL_LINES);
					glColor4ub(0xFF, 0x00, 0x00, 0x80);
					glVertex2d(i, lleft);
					glVertex2d(i, left);

					glColor4ub(0x00, 0x00, 0xFF, 0x80);
					glVertex2d(i, lright);
					glVertex2d(i, right);
				glEnd();
				glLineWidth(1.0);
			}
		}

		const int slots = 10;

		for (i = 0; i < slots; i++) {
			double	Lavg = 0, Ravg = 0;
			double	Lmax = 0, Rmax = 0;
			int	j, Lavgi, Ravgi, Lmaxi, Rmaxi;

			for (j = i*N/slots; j < (i+1)*N/slots; j++) {
				Lavg += Lmags[j];
				Ravg += Rmags[j];
				if (Lmags[j] > Lmax)
					Lmax = Lmags[j];
				if (Rmags[j] > Rmax)
					Rmax = Rmags[j];
			}
			Lavg = slots*Lavg/N;
			Ravg = slots*Ravg/N;

			Lavgi = LINES*Lavg/maxval;
			Ravgi = LINES*Ravg/maxval;

			if (Lavgi == Ravgi) {
				glBegin(GL_LINES);
					glColor4f(0xAD, 0x00, 0xAD, 0.5);
					glVertex2d(i*COLS/slots, Lavgi);
					glVertex2d((i+1)*COLS/slots, Lavgi);
				glEnd();
			} else {
				glBegin(GL_LINES);
					glColor4f(0xAD, 0x00, 0x00, 0.5);
					glVertex2d(i*COLS/slots, Lavgi);
					glVertex2d((i+1)*COLS/slots, Lavgi);

					glColor4f(0x00, 0x00, 0xAD, 0.5);
					glVertex2d(i*COLS/slots, Ravgi);
					glVertex2d((i+1)*COLS/slots, Ravgi);
				glEnd();
			}

			Lmaxi = LINES*Lmax/maxval;
			Rmaxi = LINES*Rmax/maxval;

			glBegin(GL_LINES);
				glColor4f(0xAD, 0xAD, 0x00, 0.5);
				if (Lmaxi > Rmaxi) {
					glVertex2d(i*COLS/slots, Lmaxi);
					glVertex2d((i+1)*COLS/slots, Lmaxi);
				} else {
					glVertex2d(i*COLS/slots, Rmaxi);
					glVertex2d((i+1)*COLS/slots, Rmaxi);
				}
			glEnd();
		}

# if 0
		for (i = 0; i < COLS; i++) {
			char	*key = apple_note(N*(i+1)/COLS);
			int	j;

			if ((i > 2) && (mags[i] > mags[i-1]) && (mags[i] > mags[i+1]) && (mags[i] > 2*mags[i-2]) && (mags[i] > 2*mags[i+2]))
				apple_color_set(
					(((i*6)%0xFF) << 16) | (((i*0)%0xFF) << 8) | ((i*0)%0xFF),
					(((i*0)%0x80 /*+ 0x80*/) << 16) | (((i*0)%0x80 /*+ 0x80*/) << 8) | ((i*3)%0x80 + 0x80));
			else
				apple_color_set(
					(((i*0)%0xFF) << 16) | (((i*6)%0xFF) << 8) | ((i*0)%0xFF),
					(((i*0)%0x80) << 16) | (((i*0)%0x80) << 8) | ((i*3)%0x80));
			for (j = LINES-strlen(key); j < LINES; j++)
				mvaddch(j, i, *(key++));
		}
# endif
#endif

#ifndef XAPPLE_INTERNAL_1
	glPopMatrix();

	ngl_refresh(xapple_nglwin);
}

void	xapple_end(void) {
	if (ngl_destroy_window(xapple_nglwin) != 0) {
		fprintf(stderr, "Error destroying window. Sorry.\r\n");
		exit(EXIT_FAILURE);
	}
	xapple_nglwin = NULL;

	if (ngl_close_display(xapple_ngldpy) != 0) {
		fprintf(stderr, "Error closing display. Sorry.\r\n");
		exit(EXIT_FAILURE);
	}
	xapple_ngldpy = NULL;
}

#endif
