import Renderable from '../renderable.js';

const v = `#version 300 es
    precision mediump float;
    
    in vec2 vertex;
    
    void main(void) {
        gl_Position = vec4(vertex, 0.0, 1.0);
    }
`;
const f = `#version 300 es
    precision mediump float;
    
    const vec4 baseColor = vec4(.8, .5, .8, 1.0);
    
    uniform sampler2D tex;
                
    out vec4 color;
    
    void main(void) {
        color = texelFetch(tex, ivec2(gl_FragCoord.xy), 0);
        // color = baseColor;
    }
`;

export default class Quad extends Renderable
{
    constructor(renderer)
    {
        super(renderer, v, f, [
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
        ], [
            0, 1, 2,
            1, 3, 2,
        ]);

        this.program.tex = 0;
    }
}