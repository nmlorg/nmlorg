attribute vec4 vertexColor;
attribute vec3 vertexPosition;
uniform mat4 bufferPosition;
uniform mat4 cameraPosition;
uniform mat4 cameraProjection;
varying lowp vec4 vColor;

void main(void) {
  gl_Position = vec4(vertexPosition, 1.) * bufferPosition * cameraPosition * cameraProjection;
  vColor = vertexColor;
}
