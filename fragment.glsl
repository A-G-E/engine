precision mediump float;

varying vec3 fragColor;
varying vec3 lighting;

void main() {
//    gl_FragColor = vec4(fragColor * lighting, 1.0);
    gl_FragColor = vec4(fragColor, 1.0);
}