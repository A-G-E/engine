#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define COLOR_LOCATION 2

precision highp float;

layout(location = POSITION_LOCATION) in vec3 vertex;
layout(location = NORMAL_LOCATION) in vec3 normal;
layout(location = COLOR_LOCATION) in vec3 color;

uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
uniform vec3 lightDirection;
uniform vec3 lightColour;
uniform vec2 lightBias;

flat out vec3 fragColor;

vec3 calculateLighting(){
	float brightness = max(dot(-lightDirection, normal), 0.0);
	return (lightColour * lightBias.x) + (brightness * lightColour * lightBias.y);
}

void main() {
    gl_Position = projection * view * world * vec4(vertex, 1.0);
    fragColor = color * calculateLighting();
}