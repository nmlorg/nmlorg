attribute vec2 textureCoord;
attribute vec3 vertexPosition;
uniform vec4 box;
varying mediump vec2 var_textureCoord;

void main(void) {
  float width = box[1] - box[0];
  float height = box[3] - box[2];
  gl_Position = vec4(box[0] + (vertexPosition.x + 1.) * width / 2.,
                     box[2] + (vertexPosition.y + 1.) * height / 2., -1., 1.);
  var_textureCoord = textureCoord;
}
