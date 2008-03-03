#ifndef NGL_H
#define NGL_H

enum {
	NGLE_SUCCESS = 0,
	NGLE_BADDISPLAY,
	NGLE_BADCOUNTER,
};

typedef struct ngl_display_t *ngl_display_t;
typedef struct ngl_win_t *ngl_win_t;

/* It is always the case that GL_LIGHTi = GL_LIGHT0 + i. */
#define GL_LIGHT(x)	(GL_LIGHT0 + (x))




/* Provide G_GNUC_INTERNAL that is used for marking library functions as being
 * used internally to the lib only, to not create inefficient PLT entries.
 */
#if defined (__GNUC__)
# define G_GNUC_INTERNAL        __attribute((visibility("hidden")))
#else
# define G_GNUC_INTERNAL
#endif

int	ngl_open_display(ngl_display_t *ngldpy) G_GNUC_INTERNAL;
int	ngl_close_display(ngl_display_t ngldpy) G_GNUC_INTERNAL;
int	ngl_create_window(ngl_win_t *nglwin, ngl_display_t ngldpy, int x, int y, int width, int height, const char *title) G_GNUC_INTERNAL;
void	ngl_win_ortho(ngl_win_t nglwin) G_GNUC_INTERNAL;
void	ngl_win_perspective(ngl_win_t nglwin) G_GNUC_INTERNAL;
int	ngl_destroy_window(ngl_win_t nglwin) G_GNUC_INTERNAL;
int	ngl_refresh(ngl_win_t nglwin) G_GNUC_INTERNAL;
int	ngl_win_width(ngl_win_t nglwin) G_GNUC_INTERNAL;
int	ngl_win_height(ngl_win_t nglwin) G_GNUC_INTERNAL;

#endif
