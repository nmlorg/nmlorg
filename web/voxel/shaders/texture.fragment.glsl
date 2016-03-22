uniform sampler2D textureSamplers[1];
varying mediump vec2 vTextureCoord;

void main(void) {
  gl_FragColor = texture2D(textureSamplers[0], vTextureCoord);
}
