precision mediump float;

attribute vec3 position;
attribute vec3 color;

uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;

varying vec3 fragColor;

void main() {
    fragColor = color;
    gl_Position = projection * view * world * vec4(position, 1.0);
}