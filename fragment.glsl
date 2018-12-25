#version 300 es
#define FRAG_COLOR_LOCATION 0

precision highp float;

flat in vec3 fragColor;

layout(location = FRAG_COLOR_LOCATION) out vec4 color;

void main() {
    color = vec4(fragColor, 1.0);
}