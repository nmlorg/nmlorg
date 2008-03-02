#!/usr/bin/python2.5

import sys
from OpenGL import GL as gl
from OpenGL import GLU as glu
from OpenGL import GLUT as glut

light_diffuse = [1.0, 0.0, 0.0, 1.0]  # Red diffuse light.
light_position = [1.0, 1.0, 1.0, 0.0]  # Infinite light location.
n = [  # Normals for the 6 faces of a cube.
  [-1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [1.0, 0.0, 0.0],
  [0.0, -1.0, 0.0], [0.0, 0.0, 1.0], [0.0, 0.0, -1.0]]
faces = [  # Vertex indices for the 6 faces of a cube.
  [0, 1, 2, 3], [3, 2, 6, 7], [7, 6, 5, 4],
  [4, 5, 1, 0], [5, 6, 2, 1], [7, 4, 0, 3]]
v = [  # Will be filled in with X,Y,Z vertexes.
  [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0],
  [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]]


def drawBox():
  for i in xrange(6):
    gl.glBegin(gl.GL_QUADS)
    gl.glNormal3fv(n[i])
    gl.glVertex3fv(v[faces[i][0]])
    gl.glVertex3fv(v[faces[i][1]])
    gl.glVertex3fv(v[faces[i][2]])
    gl.glVertex3fv(v[faces[i][3]])
    gl.glEnd()


def display():
  gl.glClear(gl.GL_COLOR_BUFFER_BIT | gl.GL_DEPTH_BUFFER_BIT)
  drawBox()
  glut.glutSwapBuffers()


def init():
  # Setup cube vertex data.
  v[0][0] = v[1][0] = v[2][0] = v[3][0] = -1
  v[4][0] = v[5][0] = v[6][0] = v[7][0] = 1
  v[0][1] = v[1][1] = v[4][1] = v[5][1] = -1
  v[2][1] = v[3][1] = v[6][1] = v[7][1] = 1
  v[0][2] = v[3][2] = v[4][2] = v[7][2] = 1
  v[1][2] = v[2][2] = v[5][2] = v[6][2] = -1

  # Enable a single OpenGL light.
  gl.glLightfv(gl.GL_LIGHT0, gl.GL_DIFFUSE, light_diffuse)
  gl.glLightfv(gl.GL_LIGHT0, gl.GL_POSITION, light_position)
  gl.glEnable(gl.GL_LIGHT0)
  gl.glEnable(gl.GL_LIGHTING)

  # Use depth buffering for hidden surface elimination.
  gl.glEnable(gl.GL_DEPTH_TEST)

  # Setup the view of the cube.
  gl.glMatrixMode(gl.GL_PROJECTION)
  glu.gluPerspective(40.0,  # field of view in degree
                     1.0,   # aspect ratio
                     1.0,   # Z near
                     10.0)  # Z far
  gl.glMatrixMode(gl.GL_MODELVIEW)
  glu.gluLookAt(0.0, 0.0, 5.0,  # eye is at (0,0,5)
                0.0, 0.0, 0.0,  # center is at (0,0,0)
                0.0, 1.0, 0.)  # up is in positive Y direction

  # Adjust cube position to be asthetic angle.
  gl.glTranslatef(0.0, 0.0, -1.0)
  gl.glRotatef(60, 1.0, 0.0, 0.0)
  gl.glRotatef(-20, 0.0, 0.0, 1.0)


def main(argv):
  glut.glutInit(argv)
  glut.glutInitDisplayMode(glut.GLUT_DOUBLE | glut.GLUT_RGB | glut.GLUT_DEPTH)
  glut.glutCreateWindow('red 3D lighted cube')
  glut.glutDisplayFunc(display)
  init()
  glut.glutMainLoop()

if __name__ == '__main__':
  sys.exit(main(sys.argv))
