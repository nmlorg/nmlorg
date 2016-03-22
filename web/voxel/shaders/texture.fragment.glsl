uniform sampler2D textureSamplers[1];
varying mediump vec2 var_textureCoord;

void main(void) {
  gl_FragColor = texture2D(textureSamplers[0], var_textureCoord);
}
