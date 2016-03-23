#extension GL_EXT_frag_depth : enable

uniform sampler2D textureSamplers[2];
varying mediump vec2 var_textureCoord;

void main(void) {
  gl_FragDepthEXT = texture2D(textureSamplers[1], var_textureCoord).x;
  gl_FragColor = texture2D(textureSamplers[0], var_textureCoord) * (1. - gl_FragDepthEXT);
}
