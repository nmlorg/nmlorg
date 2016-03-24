#extension GL_EXT_draw_buffers : require

uniform highp mat4 bufferPosition;
varying mediump vec4 var_vertexColor;

void main(void) {
  gl_FragData[0] = var_vertexColor;
  gl_FragData[1] = vec4(bufferPosition[0][3], bufferPosition[1][3], bufferPosition[2][3], 255.) / 255.;
}
