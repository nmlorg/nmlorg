#!/usr/bin/python2.5

import math
import sys
import wx
import wx.glcanvas
from OpenGL import GLUT as glut
from OpenGL import GLU as glu
from OpenGL import GL as gl


class MyGLCanvas(wx.glcanvas.GLCanvas):
  def __init__(self, parent):
    print '__init__(parent=%s)' % parent

    wx.glcanvas.GLCanvas.__init__(self, parent, -1)
    wx.EVT_PAINT(self, self.OnPaint)
    self.init = False

  def OnPaint(self, event):
    print 'OnPaint(event=%s)' % event

    dc = wx.PaintDC(self)
    self.SetCurrent()
    if not self.init:
      self.InitGL()
      self.init = True
    self.OnDraw()

  def OnDraw(self):
    print 'OnDraw()'

    gl.glClear(gl.GL_COLOR_BUFFER_BIT | gl.GL_DEPTH_BUFFER_BIT)

    gl.glPushMatrix()
    color = [1.0, 0.0, 0.0, 1.0]
    gl.glMaterialfv(gl.GL_FRONT, gl.GL_DIFFUSE, color)
    glut.glutSolidSphere(2, 20, 20)
    gl.glPopMatrix()

    self.SwapBuffers()

  def InitGL(self):
    print 'InitGL()'

    # set viewing projection
    light_diffuse = [1.0, 1.0, 1.0, 1.0]
    light_position = [1.0, 1.0, 1.0, 0.0]

    gl.glLightfv(gl.GL_LIGHT0, gl.GL_DIFFUSE, light_diffuse)
    gl.glLightfv(gl.GL_LIGHT0, gl.GL_POSITION, light_position)

    gl.glEnable(gl.GL_LIGHTING)
    gl.glEnable(gl.GL_LIGHT0)
    gl.glEnable(gl.GL_DEPTH_TEST)
    gl.glClearColor(0.0, 0.0, 0.0, 1.0)
    gl.glClearDepth(1.0)

    gl.glMatrixMode(gl.GL_PROJECTION)
    gl.glLoadIdentity()
    glu.gluPerspective(40.0, 1.0, 1.0, 30.0)

    gl.glMatrixMode(gl.GL_MODELVIEW)
    gl.glLoadIdentity()
    glu.gluLookAt(0.0, 0.0, 10.0,
                  0.0, 0.0, 0.0,
                  0.0, 1.0, 0.0)


def main(argv):
  app = wx.PySimpleApp()
  frame = wx.Frame(None, -1, 'ball_wx', wx.DefaultPosition, wx.Size(400, 400))
  canvas = MyGLCanvas(frame)
  frame.Show()
  app.MainLoop()

if __name__ == '__main__':
  sys.exit(main(sys.argv))
