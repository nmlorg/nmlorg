#include <GL/glx.h>
#include <sys/time.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>

#include "ngl.h"

struct ngl_display_t {
	Display	*dpy;
	Screen	*screen;
};

struct ngl_win_t {
	ngl_display_t ngldpy;
	Window	win;
	GLXContext ctx;
	uint64_t fps_start;
	int	fps_frames;
	int	width, height;
	uint32_t ortho:1;
};

static void ngl_reshape(ngl_win_t nglwin, int width, int height) {
	nglwin->width = width;
	nglwin->height = height;

	glViewport(0, 0, (GLint)width, (GLint)height);
	glMatrixMode(GL_PROJECTION);
	glLoadIdentity();
	if (nglwin->ortho)
		glOrtho(-width/2.0, width/2.0, -height/2.0, height/2.0, 47.0, 1000.0);
	else
		glFrustum(-width/2.0, width/2.0, -height/2.0, height/2.0, 47.0, 1000.0);

	glMatrixMode(GL_MODELVIEW);
	glLoadIdentity();
	glTranslatef(-width/2.0, -height/2.0, -47.0);
}

static void ngl_make_window(Display *dpy, Screen *scr, const char *name, int x, int y, int width, int height, Window *winRet, GLXContext *ctxRet) {
	int	attrib[] = {
				GLX_RGBA,
				GLX_DOUBLEBUFFER,
				GLX_RED_SIZE, 8,
				GLX_GREEN_SIZE, 8,
				GLX_BLUE_SIZE, 8,
				GLX_ALPHA_SIZE, 8,
				GLX_DEPTH_SIZE, 8,
				None
		};
	int	scrnum;
	XSetWindowAttributes attr;
	unsigned long mask;
	Window	root;
	Window	win;
	GLXContext ctx;
	XVisualInfo *visinfo;

	scrnum = XScreenNumberOfScreen(scr);
	root = XRootWindow(dpy, scrnum);

	if ((visinfo = glXChooseVisual(dpy, scrnum, attrib)) == NULL) {
		fprintf(stderr, "Error: couldn't get an RGB, Double-buffered visual.\n");
		exit(EXIT_FAILURE);
	}

	attr.background_pixel = 0;
	attr.border_pixel = 0;
	attr.colormap = XCreateColormap(dpy, root, visinfo->visual, AllocNone);
	attr.event_mask = StructureNotifyMask | KeyPressMask | KeyReleaseMask;
	mask = CWBackPixel | CWBorderPixel | CWColormap | CWEventMask;

	win = XCreateWindow(dpy, root, x, y, width, height, 0, visinfo->depth, InputOutput, visinfo->visual, mask, &attr);

	{
		XSizeHints sizehints;

		sizehints.x = x;
		sizehints.y = y;
		sizehints.width = width;
		sizehints.height = height;
		sizehints.flags = USSize | USPosition;
		XSetNormalHints(dpy, win, &sizehints);
		XSetStandardProperties(dpy, win, name, name, None, NULL, 0, &sizehints);
	}

	if ((ctx = glXCreateContext(dpy, visinfo, NULL, True)) == NULL) {
		fprintf(stderr, "Error: glXCreateContext failed.\n");
		exit(EXIT_FAILURE);
	}

	XFree(visinfo);

	XMapWindow(dpy, win);
	glXMakeCurrent(dpy, win, ctx);

	*winRet = win;
	*ctxRet = ctx;
}

int	ngl_open_display(ngl_display_t *ngldpy) {
	Display	*dpy;

	if ((dpy = XOpenDisplay(NULL)) == NULL)
		return(-NGLE_BADDISPLAY);

	*ngldpy = calloc(1, sizeof(**ngldpy));
	(*ngldpy)->dpy = dpy;
	(*ngldpy)->screen = XDefaultScreenOfDisplay(dpy);

	return(0);
}

int	ngl_close_display(ngl_display_t dpy) {
	XCloseDisplay(dpy->dpy);
	dpy->dpy = NULL;

	free(dpy);
	return(0);
}

/* current time in microseconds */
static uint64_t ngl_current_time(void) {
	struct timeval tv;

	gettimeofday(&tv, NULL);
	return((uint64_t)tv.tv_sec*1000000 + (uint64_t)tv.tv_usec);
}

static int ngl_fps_reset(ngl_win_t win, float *fps) {
	uint64_t now = ngl_current_time();

	if (fps != NULL) {
		GLfloat	seconds = (now - win->fps_start)/1000000.0;

		*fps = win->fps_frames/seconds;
	}

	win->fps_start = now;
	win->fps_frames = 0;

	return(0);
}

static int ngl_fps_count(ngl_win_t win) {
	win->fps_frames++;
	return(0);
}

int	ngl_create_window(ngl_win_t *nglwin, ngl_display_t ngldpy, int x, int y, int width, int height, const char *title) {
	Window	win;
	GLXContext ctx;

	ngl_make_window(ngldpy->dpy, ngldpy->screen, title, x, y, width, height, &win, &ctx);

	*nglwin = calloc(1, sizeof(**nglwin));
	(*nglwin)->ngldpy = ngldpy;
	(*nglwin)->win = win;
	(*nglwin)->ctx = ctx;

	ngl_reshape(*nglwin, width, height);
	ngl_fps_reset(*nglwin, NULL);

	return(0);
}

void	ngl_win_ortho(ngl_win_t nglwin) {
	nglwin->ortho = 1;
	ngl_reshape(nglwin, nglwin->width, nglwin->height);
}

void	ngl_win_perspective(ngl_win_t nglwin) {
	nglwin->ortho = 0;
	ngl_reshape(nglwin, nglwin->width, nglwin->height);
}

int	ngl_destroy_window(ngl_win_t win) {
	glXDestroyContext(win->ngldpy->dpy, win->ctx);
	win->ctx = NULL;

	XDestroyWindow(win->ngldpy->dpy, win->win);
	win->win = 0;

	win->ngldpy = NULL;
	free(win);

	return(0);
}

static int ngl_ui_dispatch(ngl_win_t nglwin) {
	Display	*dpy = nglwin->ngldpy->dpy;

	while (XPending(dpy) > 0) {
		XEvent	event;

		XNextEvent(dpy, &event);
		switch (event.type) {
		  case ConfigureNotify:
			ngl_reshape(nglwin, event.xconfigure.width, event.xconfigure.height);
			break;
		  case KeyPress: {
				int	code;
				char	buffer[10];

				code = XLookupKeysym(&event.xkey, 0);
				printf("PRESS %i '%c' -- ", code, ((code<256) && isprint(code))?code:' ');

				XLookupString(&event.xkey, buffer, sizeof(buffer), NULL, NULL);
				printf("%i '%c' '%c' '%c' '%c' '%c' '%c' '%c' '%c' '%c' '%c'\n", buffer[0], buffer[0], buffer[1], buffer[2], buffer[3], buffer[4], buffer[5], buffer[6], buffer[7], buffer[8], buffer[9]);
#ifdef XKB
//				XkbStdBell(XtDisplay(dpy, win, 0, XkbBI_MinorError);
#else
//				XBell(dpy, 0);
#endif
			}
			break;
		  case KeyRelease: {
				int	code;
				char	buffer[10];

				code = XLookupKeysym(&event.xkey, 0);
				printf("RELEA %i '%c' -- ", code, ((code<256) && isprint(code))?code:' ');

				XLookupString(&event.xkey, buffer, sizeof(buffer), NULL, NULL);
				printf("%i '%c' '%c' '%c' '%c' '%c' '%c' '%c' '%c' '%c' '%c'\n", buffer[0], buffer[0], buffer[1], buffer[2], buffer[3], buffer[4], buffer[5], buffer[6], buffer[7], buffer[8], buffer[9]);
			}
			break;
		}
	}

	return(0);
}

int	ngl_refresh(ngl_win_t nglwin) {
	glXSwapBuffers(nglwin->ngldpy->dpy, nglwin->win);

	ngl_ui_dispatch(nglwin);
	ngl_fps_count(nglwin);

	if ((ngl_current_time() - nglwin->fps_start) >= 5000000L) {
		int	frames = nglwin->fps_frames;
		float	fps;

		if (ngl_fps_reset(nglwin, &fps) != 0) {
			fprintf(stderr, "Error calculating FPS.\r\n");
			return(-1);
		}

		printf("%i frames at %.3f since last reset.\n", frames, fps);
	}

	return(0);
}

int	ngl_win_width(ngl_win_t nglwin) {
	return(nglwin->width);
}

int	ngl_win_height(ngl_win_t nglwin) {
	return(nglwin->height);
}
