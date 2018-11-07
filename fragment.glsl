#version 300 es

precision mediump float;

flat in vec3 fragColor;

void main() {
    gl_FragColor = vec4(fragColor, 1.0);
}