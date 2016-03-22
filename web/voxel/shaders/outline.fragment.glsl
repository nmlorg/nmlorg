uniform lowp vec2 resolution;
uniform sampler2D textureSamplers[2];
varying mediump vec2 vTextureCoord;

lowp float GetDepth(lowp float s, lowp float t) {
  lowp float depth = texture2D(textureSamplers[1], vTextureCoord + vec2(s / resolution.s, t / resolution.t)).x;
  return depth;
}

void main(void) {
  lowp float depth = GetDepth(0., 0.);
  for (lowp float s = -3.; s <= 3.; s++) {
    for (lowp float t = -3.; t <= 3.; t++) {
      if ((s == 0.) && (t == 0.))
        continue;
      lowp float depth2 = GetDepth(s, t);
      if (abs(depth - depth2) > .01) {
        gl_FragColor = vec4(0, 0, 0, 1);
        return;
      }
    }
  }
  gl_FragColor = texture2D(textureSamplers[0], vTextureCoord);
}
