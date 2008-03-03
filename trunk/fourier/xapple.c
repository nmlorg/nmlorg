#ifndef XAPPLE_INTERNAL_1
#include <GL/gl.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <limits.h>

#include "ngl.h"

static int N, samplespersec, samplelen, bitspersample, numchannels;
static ngl_display_t xapple_ngldpy = NULL;
static ngl_win_t xapple_nglwin = NULL;
static int max_lights = 0;
static struct {
	GLfloat	pos[4],
		col[4];
	unsigned int right:1, up:1;
} *lights = NULL;
static struct {
	GLfloat	pos[4], width;
	unsigned int right:1, up:1;
} flecs[2000];

void	xapple_init(const int _N, const int _samplespersec, const int _samplelen, const int _bitspersample, const int _numchannels) {
	int	i;

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
//	glEnable(GL_CULL_FACE);

	glGetIntegerv(GL_MAX_LIGHTS, &max_lights);
	lights = calloc(max_lights, sizeof(*lights));
	for (i = 0; i < max_lights; i++) {
		switch (rand()%3) {
		  case 0:
			lights[i].col[0] = 0.5 + 0.5*rand()/RAND_MAX;
			lights[i].col[1] = 0.5*rand()/RAND_MAX;
			lights[i].col[2] = 0.5*rand()/RAND_MAX;
			break;
		  case 1:
			lights[i].col[0] = 0.5*rand()/RAND_MAX;
			lights[i].col[1] = 0.5 + 0.5*rand()/RAND_MAX;
			lights[i].col[2] = 0.5*rand()/RAND_MAX;
			break;
		  case 2:
			lights[i].col[0] = 0.5*rand()/RAND_MAX;
			lights[i].col[1] = 0.5*rand()/RAND_MAX;
			lights[i].col[2] = 0.5 + 0.5*rand()/RAND_MAX;
			break;
		}
		lights[i].col[3] = 1.0;
		lights[i].pos[0] = 1.0* /*ngl_win_width(xapple_nglwin)*/ 1024 *rand()/RAND_MAX;
		lights[i].pos[1] = 1.0* /*ngl_win_height(xapple_nglwin)*/ 768 *rand()/RAND_MAX;
		lights[i].pos[2] = 0.0;
		lights[i].pos[3] = 1.0;
	}
	for (i = 0; i < sizeof(flecs)/sizeof(*flecs); i++) {
		flecs[i].pos[0] = 10;
		flecs[i].pos[1] = 10;
		flecs[i].pos[2] = -1.0*(i%100);
		flecs[i].width = 0;
	}
}

static float MIN(const float a, const float b) {
	return((a < b)?a:b);
}

static float MAX(const float a, const float b) {
	return((a > b)?a:b);
}

static float xapple_2d_interp(float i, float j, float P1, float P2, float P3, float P4) {
	return((1.0-i)*(1-j)*P1 + i*(1-j)*P2 + i*j*P3 + (1.0-i)*j*P4);
}

static void xapple_draw_quad(const float x1, const float y1, const float z1,
		const float x2, const float y2, const float z2,
		const float x3, const float y3, const float z3,
		const float x4, const float y4, const float z4) {
	const float istep = 0.05, jstep = 0.05;
	float	i, j;

	glBegin(GL_QUADS);

	for (i = 0.0; i < 1.0; i += istep)
		for (j = 0.0; j < 1.0; j += jstep) {
			float	xa, ya, za,
				xb, yb, zb,
				xc, yc, zc,
				xd, yd, zd;

			xa = xapple_2d_interp(i, j, x1, x2, x3, x4);
			ya = xapple_2d_interp(i, j, y1, y2, y3, y4);
			za = xapple_2d_interp(i, j, z1, z2, z3, z4);
			xb = xapple_2d_interp(i+istep, j, x1, x2, x3, x4);
			yb = xapple_2d_interp(i+istep, j, y1, y2, y3, y4);
			zb = xapple_2d_interp(i+istep, j, z1, z2, z3, z4);
			xc = xapple_2d_interp(i+istep, j+jstep, x1, x2, x3, x4);
			yc = xapple_2d_interp(i+istep, j+jstep, y1, y2, y3, y4);
			zc = xapple_2d_interp(i+istep, j+jstep, z1, z2, z3, z4);
			xd = xapple_2d_interp(i, j+jstep, x1, x2, x3, x4);
			yd = xapple_2d_interp(i, j+jstep, y1, y2, y3, y4);
			zd = xapple_2d_interp(i, j+jstep, z1, z2, z3, z4);

			glVertex3f(xa, ya, za);
			glVertex3f(xb, yb, zb);
			glVertex3f(xc, yc, zc);
			glVertex3f(xd, yd, zd);
		}

	glEnd();
}

static uint64_t timei(void) {
	struct timeval tv;

	gettimeofday(&tv, NULL);
	return((uint64_t)tv.tv_sec*1000000 + tv.tv_usec);
}

static void xapple_draw_scene(const void *_buf, const double *Lmags, const double *Rmags, const int COLS, const int LINES) {
	int	i;

	glEnable(GL_LIGHTING);
	for (i = 0; i < max_lights; i++) {
		glLightfv(GL_LIGHT(i), GL_POSITION, lights[i].pos);
		glLightfv(GL_LIGHT(i), GL_DIFFUSE, lights[i].col);
		glLightfv(GL_LIGHT(i), GL_SPECULAR, lights[i].col);
		glEnable(GL_LIGHT(i));
	}

	glShadeModel(GL_FLAT);
	xapple_draw_quad(0.0, 0.0, -100.0,
			COLS, 0.0, -100.0,
			COLS, LINES, -100.0,
			0.0, LINES, -100.0);
	xapple_draw_quad(0.0, 0.0, 0.0,
			COLS, 0.0, 0.0,
			COLS, 0.0, -100.0,
			0.0, 0.0, -100.0);
	xapple_draw_quad(0.0, LINES, 0.0,
			0.0, 0.0, 0.0,
			0.0, 0.0, -100.0,
			0.0, LINES, -100.0);
	xapple_draw_quad(COLS, LINES, 0.0,
			0.0, LINES, 0.0,
			0.0, LINES, -100.0,
			COLS, LINES, -100.0);
	xapple_draw_quad(COLS, 0.0, 0.0,
			COLS, LINES, 0.0,
			COLS, LINES, -100.0,
			COLS, 0.0, -100.0);

	for (i = 0; i < max_lights; i++)
		glDisable(GL_LIGHT(i));
	glDisable(GL_LIGHTING);

	glBegin(GL_QUADS);
	for (i = 0; i < sizeof(flecs)/sizeof(*flecs); i++) {
		GLfloat	x = flecs[i].pos[0], y = flecs[i].pos[1], z = flecs[i].pos[2], width = flecs[i].width;

		glColor4f(0.6, 1.0, 0.6, -0.75*flecs[i].pos[2]/100.0);
		glVertex3f(x-width, y+width, z);
		glVertex3f(x+width, y+width, z);
		glVertex3f(x+width, y-width, z);
		glVertex3f(x-width, y-width, z);
	}
	glEnd();

	glLineWidth(4.0);
	glBegin(GL_LINES);
		for (i = 0; i < max_lights; i++) {
			glColor3fv(lights[i].col);
			glVertex3fv(lights[i].pos);
			glVertex3f(lights[i].pos[0], lights[i].pos[1], lights[i].pos[2]-1000.0);
		}
	glEnd();
	glLineWidth(1.0);
}

static void xapple_draw_spectrum(const void *_buf, const double *Lmags, const double *Rmags, const int COLS, const int LINES) {
	int	i;

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
			int	j;
			float	left = zeropoint+1.0*(LINES/2)*buf[samplelen*i/COLS].L/maxval,
				right = zeropoint+1.0*(LINES/2)*buf[samplelen*i/COLS].R/maxval,
				Lmag = LINES*Lmags[N*i/COLS]/maxval,
				Rmag = LINES*Rmags[N*i/COLS]/maxval;

			for (j = N*i/COLS+1; j < N*(i+1)/COLS; j++) {
				Lmag = MAX(Lmag, LINES*Lmags[j]/maxval);
				Rmag = MAX(Rmag, LINES*Rmags[j]/maxval);
			}
			Lmag = MIN(Lmag, LINES);
			Rmag = MIN(Rmag, LINES);

			glBegin(GL_LINES);
				glColor4ub(0xAD, 0x00, 0x00, 0x80);
//				glVertex2f(i, 0);
//				glVertex2f(i, Lmag);
				glVertex3f(i, 0, 0);
				glVertex3f(i, 0, -100.0*Lmag/LINES);

				glColor4ub(0x00, 0x00, 0xAD, 0x80);
//				glVertex2f(i, 0);
//				glVertex2f(i, Rmag);
				glVertex3f(i, 0, 0);
				glVertex3f(i, 0, -100.0*Rmag/LINES);
			glEnd();

			if (i > 0) {
				float	lleft = zeropoint+1.0*(LINES/2)*buf[samplelen*(i-1)/COLS].L/maxval,
					lright = zeropoint+1.0*(LINES/2)*buf[samplelen*(i-1)/COLS].R/maxval;

				glLineWidth(5.0);
				glBegin(GL_LINES);
					glColor4ub(0xFF, 0x00, 0x00, 0x30);
//					glVertex2f(i, lleft);
//					glVertex2f(i, left);
					glVertex3f(0, lleft, -100.0*i/COLS);
					glVertex3f(0, left, -100.0*i/COLS);
					glVertex3f(i, LINES, -100.0*lleft/LINES);
					glVertex3f(i, LINES, -100.0*left/LINES);

					glColor4ub(0x00, 0x00, 0xFF, 0x30);
//					glVertex2f(i, lright);
//					glVertex2f(i, right);
					glVertex3f(COLS, lright, -100.0*i/COLS);
					glVertex3f(COLS, right, -100.0*i/COLS);
					glVertex3f(i, LINES, -100.0*lright/LINES);
					glVertex3f(i, LINES, -100.0*right/LINES);
				glEnd();
				glLineWidth(1.0);
			}
		}

		const int slots = max_lights;

		for (i = 0; i < slots; i++) {
			int	j;
			float	Lavg = 0, Ravg = 0,
				Lavgs, Ravgs,
				Lmax = 0, Rmax = 0,
				max, maxs;

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

			Lavgs = LINES*Lavg/maxval;
			Ravgs = LINES*Ravg/maxval;

			if (Lmax > Rmax)
				max = Lmax;
			else
				max = Rmax;

			maxs = LINES*max/maxval;

			glLineWidth(3.0);
			glBegin(GL_LINES);
				glColor4ub(0xAD, 0x00, 0x00, 0x80);
//				glVertex2f(i*COLS/slots, Lavgs);
//				glVertex2f((i+1)*COLS/slots, Lavgs);
				glVertex3f(i*COLS/slots, 0, -100.0*Lavgs/LINES);
				glVertex3f((i+1)*COLS/slots, 0, -100.0*Lavgs/LINES);

				glColor4ub(0x00, 0x00, 0xAD, 0x80);
//				glVertex2f(i*COLS/slots, Ravgs);
//				glVertex2f((i+1)*COLS/slots, Ravgs);
				glVertex3f(i*COLS/slots, 0, -100.0*Ravgs/LINES);
				glVertex3f((i+1)*COLS/slots, 0, -100.0*Ravgs/LINES);
			glEnd();

			glBegin(GL_LINES);
//				glColor4ub(0xAD, 0xAD, 0x00, 0x80);
//				glVertex2f(i*COLS/slots, maxs);
//				glVertex2f((i+1)*COLS/slots, maxs);
				glColor3f(lights[i].col[0], lights[i].col[1], lights[i].col[2]);
				glVertex3f(i*COLS/slots, 0, -100.0*maxs/LINES);
				glVertex3f((i+1)*COLS/slots, 0, -100.0*maxs/LINES);
			glEnd();
			glLineWidth(1.0);

			float	d0 = lights[i].right?-1.0:1.0,
				d1 = lights[i].up?-1.0:1.0;

			lights[i].pos[0] += d0*(2.0 - Lmax/400);
			lights[i].pos[1] += d1*(2.0 - Rmax/400);;
			lights[i].pos[2] = -90.0 + 200.0*max/maxval;

			if (lights[i].pos[0] < 0.0) {
				lights[i].pos[0] = 0.0;
				lights[i].right = 1;
			} else if (lights[i].pos[0] > COLS) {
				lights[i].pos[0] = COLS;
				lights[i].right = 0;
			}

			if (lights[i].pos[1] < 0.0) {
				lights[i].pos[1] = 0.0;
				lights[i].up = 1;
			} else if (lights[i].pos[1] > LINES) {
				lights[i].pos[1] = LINES;
				lights[i].up = 0;
			}
		}

		for (i = 0; i < sizeof(flecs)/sizeof(*flecs); i++) {
			int	Lpos = rand()%N, Rpos = rand()%N;
			float	d0 = flecs[i].right?-1.0:1.0,
				d1 = flecs[i].up?-1.0:1.0,
				Lmag = Lmags[Lpos], Rmag = Rmags[Rpos], maxmag = (Lmag > Rmag)?Lmag:Rmag;

			flecs[i].pos[0] += d0*(3.0 - 200.0*Lmag/maxval);
			flecs[i].pos[1] += d1*(3.0 - 200.0*Rmag/maxval);
			flecs[i].pos[2] += 2.0*rand()/RAND_MAX;
			flecs[i].width = 1.0 + 10.0*maxmag/maxval;

			if (flecs[i].pos[0] < 0.0) {
				flecs[i].pos[0] = 0.0;
				flecs[i].right = 1;
			} else if (flecs[i].pos[0] > COLS) {
				flecs[i].pos[0] = COLS;
				flecs[i].right = 0;
			}

			if (flecs[i].pos[1] < 0.0) {
				flecs[i].pos[1] = 0.0;
				flecs[i].up = 1;
			} else if (flecs[i].pos[1] > LINES) {
				flecs[i].pos[1] = LINES;
				flecs[i].up = 0;
			}

			if (flecs[i].pos[2] > 0.0)
				flecs[i].pos[2] = -100.0;
			if (flecs[i].pos[2] < -100.0)
				flecs[i].pos[2] = 0;
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
}

static struct {
	GLfloat	x, y, z,
		dx, dy, dz,
		ux, uy, uz;
} cam = {
	0.0, 0.0, 0.0,
	0.0, 0.0, -1.0,
	0.0, 1.0, 0.0,
};

void	xapple_sample(const void *_buf, const double *Lmags, const double *Rmags) {
	const int COLS = ngl_win_width(xapple_nglwin), LINES = ngl_win_height(xapple_nglwin);

//	if (time(NULL)%20 < 5)
//		ngl_win_ortho(xapple_nglwin);
//	else
		ngl_win_perspective(xapple_nglwin);

	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	glEnable(GL_DEPTH_TEST);
	glPushMatrix();
//		gluLookAt(cam.x, cam.y, cam.z, cam.x+cam.dx, cam.y+cam.dy, cam.z+cam.dz, cam.ux, cam.uy, cam.uz);

		xapple_draw_scene(_buf, Lmags, Rmags, COLS, LINES);
	glPopMatrix();

	glDisable(GL_DEPTH_TEST);
	glPushMatrix();
		xapple_draw_spectrum(_buf, Lmags, Rmags, COLS, LINES);
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
