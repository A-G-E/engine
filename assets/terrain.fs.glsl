#version 300 es

precision mediump float;

in vec3 v_normal;
flat in vec3 fragColor;

uniform lighting{
    vec3 position;
    vec3 color;
} light;

out vec4 color;

void main(void) {
    float diffAngle = max(dot(v_normal, normalize(light.position - v_normal)), 0.0);
    color = vec4(fragColor + light.color * diffAngle, 1.0);
}