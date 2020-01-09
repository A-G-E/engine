#version 300 es

precision mediump float;

in vec3 vertex;
in vec3 normal;
in vec3 color;

uniform mat4 world;

uniform camera{
    mat4 view;
    mat4 projection;
};

flat out vec3 fragColor;
out vec3 v_normal;

void main(void) {
    fragColor = color;
    v_normal = (world * vec4(normal, 1.0)).xyz;

    gl_Position = projection * view * world * vec4(vertex, 1.0);
}