precision mediump float;

attribute vec3 vertex;
attribute vec3 normal;
attribute vec3 color;

uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;

varying vec3 fragColor;
varying vec3 lighting;

void main() {
//    gl_Position = world * vec4(vertex, 1.0);
    gl_Position = projection * view * world * vec4(vertex, 1.0);

    lighting = vec3(1, 1, 1) * normal;//ambientLight + (directionalLightColor * directional);
    fragColor = color;
}