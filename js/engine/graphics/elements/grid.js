import Renderable from '../renderable.js';
import { Matrix4 } from '../../../math/exports.js';

const v = `#version 300 es
        
            precision mediump float;
            
            in vec3 vertex;
            in vec3 color;
            
            out vec3 f_color;
            
            uniform mat4 world;
    
            uniform camera{
                mat4 view;
                mat4 projection;
            };
            
            void main(void) {
                f_color = color;
            
                gl_Position = projection * view * world * vec4(vertex, 1.0);
            }
        `;
const f = `#version 300 es
        
            precision mediump float;
            
            in vec3 f_color;
                        
            out vec4 color;
            
            void main(void) {
                color = vec4(f_color, 1.0);
            }
        `;

export default class Grid extends Renderable
{
    constructor(context)
    {
        super(context);
        super.init(v, f);

        const vertex = [];
        const color = [];

        const size = 100;
        const distance = .4;
        const t = size * distance;

        for(let i = 0; i < size; i++)
        {
            const p = i * distance;
            const v = i % 10 === 0 ? .6 : .4;

            vertex.push(
                 p, 0,  t,      p, 0, -t, // +z -> -z :: +x
                -p, 0,  t,     -p, 0, -t, // +z -> -z :: -x
                 t, 0,  p,     -t, 0,  p, // +x -> -x :: +z
                 t, 0, -p,     -t, 0, -p, // +x -> -x :: -z
            );
            color.push(
                v, v, v,
                v, v, v,
                v, v, v,
                v, v, v,
                v, v, v,
                v, v, v,
                v, v, v,
                v, v, v,
            );
        }

        vertex.push(
            t, 0.007, 0,    -t, 0.007,  0, // +x -> -x
            0,     t, 0,     0,    -t,  0, // +y -> -y
            0, 0.007, t,     0, 0.007, -t, // +z -> -z
        );
        color.push(
            .8, .2, .2,     .8, .2, .2, // +x -> -x
            .2, .2, .8,     .2, .2, .8, // +y -> -y
            .2, .8, .2,     .2, .8, .2, // +z -> -z
        );


        this.vao.vertex = { dataView: new Float32Array(vertex) };
        this.vao.color = { dataView: new Float32Array(color) };
        this.program.world = Matrix4.identity.points;
    }

    render(renderer)
    {
        this.vao.draw();
    }
}
