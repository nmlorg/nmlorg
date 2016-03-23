attribute vec2 textureCoord;
attribute vec3 vertexPosition;
varying mediump vec2 var_textureCoord;

void main(void) {
  gl_Position = vec4(vertexPosition.xy, -1., 1.);
  var_textureCoord = textureCoord;
}
