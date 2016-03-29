attribute vec4 vertexColor;
attribute vec3 vertexPosition;
uniform mat4 bufferPosition;
uniform mat4 cameraPosition;
uniform mat4 cameraProjection;
varying mediump vec4 var_vertexColor;

void main(void) {
  gl_Position = cameraProjection * cameraPosition * bufferPosition * vec4(vertexPosition, 1.);
  var_vertexColor = vertexColor;
}
