#include <assert.h>
#include <GL/gl.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <limits.h>
#include <ngl.h>
#include <lua.h>
#include <lualib.h>
#include <lauxlib.h>

#define ROOT	"ffs"
#define PREFIX	ROOT "."

static lua_State *lua = NULL;
static int N = 0, samplelen = 0, bitspersample = 0, numchannels = 0;
static ngl_display_t xapple_ngldpy = NULL;

static void _replace_entv(lua_State *L, const char *name, va_list msg) {
	const int top = lua_gettop(L);

	assert(top > 0);

	while (name != NULL) {
		const char *dot;

		assert(lua_istable(L, top));

		if (!lua_istable(L, top)) {			// { t }
			luaL_error(L, "trying to look up stack[%i][...] but stack[%i] is not a table (it is a %s)\r\n", top, top, lua_typename(L, lua_type(L, top)));
			abort(); /* NOTREACH */
		}

		if ((dot = strchr(name, '.')) != NULL) {
			lua_pushlstring(L, name, dot-name);	// { NAME, t }
			name = dot+1;
		} else {
			lua_pushstring(L, name);		// { NAME, t }
			name = va_arg(msg, const char *);
		}
		lua_gettable(L, top);				// { t[NAME], t }
		lua_replace(L, top);				// { t[NAME] }
		assert(lua_gettop(L) == top);
	}

	assert(lua_gettop(L) == top);
}

void	_get_entv(lua_State *L, int index, const char *name, va_list msg) {
	const int top = lua_gettop(L);

	if (name == NULL)
		return;

	if (!lua_istable(L, index)) {
		luaL_error(L, "trying to look up %i[..] but %i is not a table (it is a %s)", index, index, lua_typename(L, lua_type(L, index)));
		abort(); /* NOTREACH */
	}

	lua_pushvalue(L, index);				// { t }

	if (!lua_istable(L, -1)) {
		luaL_error(L, "made a copy of %i to -1 but -1 is not a table (it is a %s)", index, lua_typename(L, lua_type(L, -1)));
		abort(); /* NOTREACH */
	}

	_replace_entv(L, name, msg);				// { t[NAME] }

	assert(lua_gettop(L) == top+1);
}

void	_get_ent(lua_State *L, const int index, const char *name, ...) {
	va_list	msg;

	va_start(msg, name);
	_get_entv(L, index, name, msg);
	va_end(msg);
}

void	_get_global_entv(lua_State *L, const char *name, va_list msg) {
	_get_entv(L, LUA_GLOBALSINDEX, name, msg);
}

void	_get_global_ent(lua_State *L, const char *name, ...) {
	const int top = lua_gettop(L);
	va_list	msg;

	if (name == NULL)
		return;

	va_start(msg, name);
	_get_global_entv(L, name, msg);
	va_end(msg);

	assert(lua_gettop(L) == top+1);
}

static void _setparami(lua_State *L, const char *group, const char *name, const int val) {
	_get_global_ent(L, group, NULL);
	lua_pushstring(L, name);
	lua_pushinteger(L, val);
	lua_settable(L, -3);
	lua_pop(L, 1);
}

/*
static void _setparamf(lua_State *L, const char *group, const char *name, const float val) {
	_get_global_ent(L, group, NULL);
	lua_pushstring(L, name);
	lua_pushnumber(L, val);
	lua_settable(L, -3);
	lua_pop(L, 1);
}
*/

static int _draw_color(lua_State *L) {
	GLfloat	ar[] = { 0, 0, 0, 1 };
	int	i;

	for (i = 0; i < lua_gettop(L); i++)
		ar[i] = luaL_checknumber(L, i+1);
	glColor4fv(ar);

	return(0);
}

static int _draw_vertex(lua_State *L) {
	GLfloat	ar[] = { 0, 0, 0, 1 };
	int	i;

	for (i = 0; i < lua_gettop(L); i++)
		ar[i] = luaL_checknumber(L, i+1);
	glVertex3fv(ar);

	return(0);
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

static int _draw_drawquads(lua_State *L) {
	float	x1, y1, z1,
		x2, y2, z2,
		x3, y3, z3,
		x4, y4, z4;

	x1 = luaL_checknumber(L, 1);
	y1 = luaL_checknumber(L, 2);
	z1 = luaL_checknumber(L, 3);
	x2 = luaL_checknumber(L, 4);
	y2 = luaL_checknumber(L, 5);
	z2 = luaL_checknumber(L, 6);
	x3 = luaL_checknumber(L, 7);
	y3 = luaL_checknumber(L, 8);
	z3 = luaL_checknumber(L, 9);
	x4 = luaL_checknumber(L, 10);
	y4 = luaL_checknumber(L, 11);
	z4 = luaL_checknumber(L, 12);

	xapple_draw_quad(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4);

	return(0);
}

static int _draw_linewidth(lua_State *L) {
	glLineWidth(luaL_checknumber(L, 1));

	return(0);
}

static int _draw_register(lua_State *L) {
	luaL_checktype(L, 1, LUA_TFUNCTION);		// { func }

	_get_global_ent(L, "ffs.draw.hooks", NULL);	// { ffs.draw.hooks, func }
	lua_pushvalue(L, 1);				// { func, ffs.draw.hooks, func }
	luaL_ref(L, -2);				// { ffs.draw.hooks, func }
	lua_pop(L, 1);					// { func }

	return(0);
}

static int _light_enable(lua_State *L) {
	if (lua_gettop(L) == 0)
		glEnable(GL_LIGHTING);
	else
		glEnable(GL_LIGHT(luaL_checkinteger(L, 1)-1));

	return(0);
}

static int _light_disable(lua_State *L) {
	if (lua_gettop(L) == 0)
		glDisable(GL_LIGHTING);
	else
		glDisable(GL_LIGHT(luaL_checkinteger(L, 1)-1));

	return(0);
}

static void _light_attrib(lua_State *L, const int what) {
	const int top = lua_gettop(L);
	int	light = luaL_checkinteger(L, 1)-1;
	GLfloat	pos[] = {
		luaL_checknumber(L, 2),
		luaL_checknumber(L, 3),
		luaL_checknumber(L, 4),
		(top >= 5)?luaL_checknumber(L, 5):1.0,
	};

	glLightfv(GL_LIGHT(light), what, pos);
}

static int _light_position(lua_State *L) {
	_light_attrib(L, GL_POSITION);

	return(0);
}

static int _light_direction(lua_State *L) {
	_light_attrib(L, GL_SPOT_DIRECTION);

	return(0);
}

static int _light_diffuse(lua_State *L) {
	_light_attrib(L, GL_DIFFUSE);

	return(0);
}

static int _light_specular(lua_State *L) {
	_light_attrib(L, GL_SPECULAR);

	return(0);
}

static int _shade_flat(lua_State *L) {
	glShadeModel(GL_FLAT);

	return(0);
}

static int _shade_smooth(lua_State *L) {
	glShadeModel(GL_SMOOTH);

	return(0);
}

static int _shape_quads(lua_State *L) {
	glBegin(GL_QUADS);

	return(0);
}

static int _shape_lines(lua_State *L) {
	glBegin(GL_LINES);

	return(0);
}

static int _shape_done(lua_State *L) {
	glEnd();

	return(0);
}

static int _depth_enable(lua_State *L) {
	glEnable(GL_DEPTH_TEST);

	return(0);
}

static int _depth_disable(lua_State *L) {
	glDisable(GL_DEPTH_TEST);

	return(0);
}

static int _window_create(lua_State *L) {
	int	x = luaL_checkint(L, 1),
		y = luaL_checkint(L, 2),
		width = luaL_checkint(L, 3),
		height = luaL_checkint(L, 4);
	const char *title = luaL_checkstring(L, 5);
	ngl_win_t nglwin;

	if (ngl_create_window(&nglwin, xapple_ngldpy, x, y, width, height, title) != 0) {
		fprintf(stderr, "Unable to create window.\r\n");
		exit(EXIT_FAILURE);
	}

	ngl_win_refresh(nglwin);
	ngl_win_perspective(nglwin);

	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glEnable(GL_NORMALIZE);
//	glEnable(GL_CULL_FACE);

	lua_pushlightuserdata(L, nglwin);
	return(1);
}

static int _window_maxlights(lua_State *L) {
	int	val;

	glGetIntegerv(GL_MAX_LIGHTS, &val);
	lua_pushinteger(L, val);
	return(1);
}

static int _window_height(lua_State *L) {
//	ngl_win_t nglwin = luaL_checkudata(L, 1, "ngl_win_t");
	ngl_win_t nglwin = lua_touserdata(L, 1);

	lua_pushinteger(L, ngl_win_height(nglwin));
	return(1);
}

static int _window_width(lua_State *L) {
//	ngl_win_t nglwin = luaL_checkudata(L, 1, "ngl_win_t");
	ngl_win_t nglwin = lua_touserdata(L, 1);

	lua_pushinteger(L, ngl_win_width(nglwin));
	return(1);
}

static int _window_pick(lua_State *L) {
//	ngl_win_t nglwin = luaL_checkudata(L, 1, "ngl_win_t");
	ngl_win_t nglwin = lua_touserdata(L, 1);

	ngl_win_pick(nglwin);

	return(0);
}

static int _window_clear(lua_State *L) {
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	return(0);
}

static int _window_refresh(lua_State *L) {
//	ngl_win_t nglwin = luaL_checkudata(L, 1, "ngl_win_t");
	ngl_win_t nglwin = lua_touserdata(L, 1);

	ngl_win_refresh(nglwin);

	return(0);
}

static int _window_destroy(lua_State *L) {
//	ngl_win_t nglwin = luaL_checkudata(L, 1, "ngl_win_t");
	ngl_win_t nglwin = lua_touserdata(L, 1);

	if (ngl_destroy_window(nglwin) != 0) {
		fprintf(stderr, "Error destroying window. Sorry.\r\n");
		exit(EXIT_FAILURE);
	}

	return(0);
}

static void _loadfunctions(lua_State *L) {
	const struct luaL_reg waveformlib[] = {
			{ NULL,			NULL },
		}, transformlib[] = {
			{ NULL,			NULL },
		}, drawlib[] = {
			{ "color",		_draw_color },
			{ "vertex",		_draw_vertex },
			{ "drawquads",		_draw_drawquads },
			{ "linewidth",		_draw_linewidth },
			{ "register",		_draw_register },
			{ NULL,			NULL },
		}, hookslib[] = {
			{ NULL,			NULL },
		}, windowlib[] = {
			{ "create",		_window_create },
			{ "maxlights",		_window_maxlights },
			{ "height",		_window_height },
			{ "width",		_window_width },
			{ "pick",		_window_pick },
			{ "clear",		_window_clear },
			{ "refresh",		_window_refresh },
			{ "destroy",		_window_destroy },
			{ NULL,			NULL },
		}, lightlib[] = {
			{ "enable",		_light_enable },
			{ "disable",		_light_disable },
			{ "position",		_light_position },
			{ "direction",		_light_direction },
			{ "diffuse",		_light_diffuse },
			{ "specular",		_light_specular },
			{ NULL,			NULL },
		}, shadelib[] = {
			{ "flat",		_shade_flat },
			{ "smooth",		_shade_smooth },
			{ NULL,			NULL },
		}, shapelib[] = {
			{ "quads",		_shape_quads },
			{ "lines",		_shape_lines },
			{ "done",		_shape_done },
			{ NULL,			NULL },
		}, depthlib[] = {
			{ "enable",		_depth_enable },
			{ "disable",		_depth_disable },
			{ NULL,			NULL },
		};

	luaL_register(L, PREFIX "waveform", waveformlib);
	luaL_register(L, PREFIX "transform", transformlib);
	luaL_register(L, PREFIX "draw", drawlib);
	luaL_register(L, PREFIX "draw.hooks", hookslib);
	luaL_register(L, PREFIX "draw.window", windowlib);
	luaL_register(L, PREFIX "draw.light", lightlib);
	luaL_register(L, PREFIX "draw.shade", shadelib);
	luaL_register(L, PREFIX "draw.shape", shapelib);
	luaL_register(L, PREFIX "draw.depth", depthlib);
}

void	xapple_init(const int _N, const int _samplespersec, const int _samplelen, const int _bitspersample, const int _numchannels) {
	lua = luaL_newstate();

	lua_gc(lua, LUA_GCSTOP, 0);
		luaL_openlibs(lua);
		_loadfunctions(lua);
	lua_gc(lua, LUA_GCRESTART, 0);

	if (ngl_open_display(&xapple_ngldpy) != 0) {
		fprintf(stderr, "Unable to open display.\r\n");
		exit(EXIT_FAILURE);
	}

	N = _N;
	_setparami(lua, PREFIX "transform", "N", _N);

	samplelen = _samplelen;
	bitspersample = _bitspersample;
	numchannels = _numchannels;

	if (bitspersample == 8) {
		_setparami(lua, PREFIX "waveform", "maxval", 128);
		_setparami(lua, PREFIX "waveform", "zeropoint", 0);
	} else if (bitspersample == 16) {
		_setparami(lua, PREFIX "waveform", "maxval", 32768);
		_setparami(lua, PREFIX "waveform", "zeropoint", 1);
	}

	{
		const char *files[] = { "wavewindow.lua", "transwindow.lua", "fun.lua" };
		int	i;

		for (i = 0; i < sizeof(files)/sizeof(*files); i++)
			if (luaL_dofile(lua, files[i]) != 0) {
				printf("Error loading %s: %s\n", files[i], luaL_checkstring(lua, -1));
				lua_pop(lua, 1);
			}
	}
}

#if 0
static void xapple_draw_spectrum(const void *_buf, const double *Lmags, const double *Rmags, const int COLS, const int LINES) {
		const int slots = max_lights;

		for (i = 0; i < slots; i++) {
			int	j, Lmaxpos = 0, Rmaxpos = 0;
			float	Lavg = 0, Ravg = 0,
				Lavgs, Ravgs,
				Lmax = 0, Rmax = 0,
				max, maxs;

			for (j = i*N/slots; j < (i+1)*N/slots; j++) {
				float	L = (j-3 >= 0)?Lmags[j-3]:0 + (j-2 >= 0)?Lmags[j-2]:0 + (j-1 >= 0)?Lmags[j-1]:0 + Lmags[j] + (j+1 < N)?Lmags[j+1]:0 + (j+2 < N)?Lmags[j+2]:0 + (j+3 < N)?Lmags[j+3]:0,
					R = (j-3 >= 0)?Rmags[j-3]:0 + (j-2 >= 0)?Rmags[j-2]:0 + (j-1 >= 0)?Rmags[j-1]:0 + Rmags[j] + (j+1 < N)?Rmags[j+1]:0 + (j+2 < N)?Rmags[j+2]:0 + (j+3 < N)?Rmags[j+3]:0;

				Lavg += Lmags[j];
				Ravg += Rmags[j];
				if (L > Lmax) {
					Lmax = Lmags[j];
					Lmaxpos = j;
				}
				if (R > Rmax) {
					Rmax = Rmags[j];
					Rmaxpos = j;
				}
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

			glColor3f(lights[i].col[0], lights[i].col[1], lights[i].col[2]);
			glBegin(GL_LINES);
				glVertex3f(COLS*Lmaxpos/N, 0, 0);
				glVertex3f(COLS*Lmaxpos/N, 0, -100);

				glVertex3f(COLS*Rmaxpos/N, 0, 0);
				glVertex3f(COLS*Rmaxpos/N, 0, -100);
			glEnd();

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
}
#endif

static void _pushwaveform16S(lua_State *L, const void *_buf) {
	const struct {
		int16_t	L, R;
	} *buf = _buf;
	int	i;

	lua_createtable(L, 0, 2);
		lua_pushstring(L, "L");
		lua_createtable(L, samplelen, 0);
		for (i = 0; i < samplelen; i++) {
			lua_pushinteger(L, buf[i].L);
			lua_rawseti(L, -2, i+1);
		}
		lua_settable(L, -3);

		lua_pushstring(L, "R");
		lua_createtable(L, samplelen, 0);
		for (i = 0; i < samplelen; i++) {
			lua_pushinteger(L, buf[i].R);
			lua_rawseti(L, -2, i+1);
		}
		lua_settable(L, -3);
}

static void _pushwaveform16M(lua_State *L, const void *_buf) {
	const union {
		int16_t	L, R;
	} *buf = _buf;
	int	i;

	lua_createtable(L, 0, 2);
		lua_pushstring(L, "R");
		lua_createtable(L, samplelen, 0);
		for (i = 0; i < samplelen; i++) {
			lua_pushinteger(L, buf[i].L);
			lua_rawseti(L, -2, i+1);
		}

		lua_pushstring(L, "L");
		lua_pushvalue(L, -2);
		lua_settable(L, -5);
		lua_settable(L, -3);
}

static void _pushwaveform8S(lua_State *L, const void *_buf) {
	const struct {
		uint8_t	L, R;
	} *buf = _buf;
	int	i;

	lua_createtable(L, 0, 2);
		lua_pushstring(L, "L");
		lua_createtable(L, samplelen, 0);
		for (i = 0; i < samplelen; i++) {
			lua_pushinteger(L, buf[i].L);
			lua_rawseti(L, -2, i+1);
		}
		lua_settable(L, -3);

		lua_pushstring(L, "R");
		lua_createtable(L, samplelen, 0);
		for (i = 0; i < samplelen; i++) {
			lua_pushinteger(L, buf[i].R);
			lua_rawseti(L, -2, i+1);
		}
		lua_settable(L, -3);
}

static void _pushwaveform8M(lua_State *L, const void *_buf) {
	const union {
		uint8_t	L, R;
	} *buf = _buf;
	int	i;

	lua_createtable(L, 0, 2);
		lua_pushstring(L, "R");
		lua_createtable(L, samplelen, 0);
		for (i = 0; i < samplelen; i++) {
			lua_pushinteger(L, buf[i].L);
			lua_rawseti(L, -2, i+1);
		}

		lua_pushstring(L, "L");
		lua_pushvalue(L, -2);
		lua_settable(L, -5);
		lua_settable(L, -3);
}

static void _pushtransformS(lua_State *L, const double *Lmags, const double *Rmags) {
	int	i;

	lua_createtable(L, 0, 2);
		lua_pushstring(L, "L");
		lua_createtable(L, N, 0);
		for (i = 0; i < N; i++) {
			lua_pushnumber(L, Lmags[i]);
			lua_rawseti(L, -2, i+1);
		}
		lua_settable(L, -3);

		lua_pushstring(L, "R");
		lua_createtable(L, N, 0);
		for (i = 0; i < N; i++) {
			lua_pushnumber(L, Rmags[i]);
			lua_rawseti(L, -2, i+1);
		}
		lua_settable(L, -3);
}

static void _pushtransformM(lua_State *L, const double *Lmags) {
	int	i;

	lua_createtable(L, 0, 2);
		lua_pushstring(L, "R");
		lua_createtable(L, N, 0);
		for (i = 0; i < N; i++) {
			lua_pushnumber(L, Lmags[i]);
			lua_rawseti(L, -2, i+1);
		}

		lua_pushstring(L, "L");
		lua_pushvalue(L, -2);
		lua_settable(L, -5);
		lua_settable(L, -3);
}

void	xapple_sample(const void *_buf, const double *Lmags, const double *Rmags) {
	int	idx;

	_get_global_ent(lua, "ffs.draw.hooks", NULL);
	idx = lua_gettop(lua);
	lua_pushnil(lua);
	while (lua_next(lua, idx)) {
		if ((bitspersample == 16) && (numchannels == 2))
			_pushwaveform16S(lua, _buf);
		else if ((bitspersample == 16) && (numchannels == 1))
			_pushwaveform16M(lua, _buf);
		else if ((bitspersample == 8) && (numchannels == 2))
			_pushwaveform8S(lua, _buf);
		else if ((bitspersample == 8) && (numchannels == 1))
			_pushwaveform8M(lua, _buf);

		if (numchannels == 2)
			_pushtransformS(lua, Lmags, Rmags);
		else
			_pushtransformM(lua, Lmags);

		if (lua_pcall(lua, 2, 0, 0) != 0) {
			printf("Error calling lapple.draw_spectrum: %s\n", luaL_checkstring(lua, -1));
			lua_pop(lua, 1);
		}
		assert(lua_gettop(lua) == idx+1);
	}
	assert(lua_gettop(lua) == idx);
	lua_pop(lua, 1);
}

void	xapple_end(void) {
	lua_close(lua);
	lua = NULL;

	if (ngl_close_display(xapple_ngldpy) != 0) {
		fprintf(stderr, "Error closing display. Sorry.\r\n");
		exit(EXIT_FAILURE);
	}
	xapple_ngldpy = NULL;
}
