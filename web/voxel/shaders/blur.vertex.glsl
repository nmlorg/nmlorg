attribute vec2 textureCoord;
attribute vec3 vertexPosition;
varying mediump vec2 vTextureCoord;

void main(void) {
  gl_Position = vec4(vertexPosition.xy, -1., 1.);
  vTextureCoord = textureCoord;
}
