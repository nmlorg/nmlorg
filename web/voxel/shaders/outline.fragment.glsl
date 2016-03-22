#extension GL_EXT_frag_depth : enable

uniform mediump vec2 resolution;
uniform sampler2D textureSamplers[2];
varying mediump vec2 var_textureCoord;

highp float GetDepth(mediump float s, mediump float t) {
  return texture2D(
      textureSamplers[1], var_textureCoord + vec2(s / resolution.s, t / resolution.t)).x;
}

void main(void) {
  gl_FragDepthEXT = GetDepth(0., 0.);
  for (mediump float s = -3.; s <= 3.; s++) {
    for (mediump float t = -3.; t <= 3.; t++) {
      if ((s == 0.) && (t == 0.))
        continue;
      highp float depth2 = GetDepth(s, t);
      if (abs(gl_FragDepthEXT - depth2) > .01) {
        gl_FragColor = vec4(0, 0, 0, 1);
        return;
      }
    }
  }
  gl_FragColor = texture2D(textureSamplers[0], var_textureCoord);
}
