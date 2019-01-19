import Renderable from '../renderable.js';
import Vao from '../vao.js';
import Program from '../program.js';
import Vertex from '../shaders/vertex.js';
import Fragment from '../shaders/fragment.js';
import { Matrix4, Vector3 } from '../../../math/exports.js';

export default class Grid extends Renderable
{
    constructor(renderer)
    {
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

        super(renderer, v, f);

        let buffer = [];

        const size = 100;
        const distance = .4;
        const t = size * distance;

        for(let i = 0; i < size; i++)
        {
            let p = i * distance;

            buffer.push(
                 p, 0,  t, .8, .8, .8,      p, 0, -t, .8, .8, .8, // +z -> -z :: +x
                -p, 0,  t, .8, .8, .8,     -p, 0, -t, .8, .8, .8, // +z -> -z :: -x
                 t, 0,  p, .8, .8, .8,     -t, 0,  p, .8, .8, .8, // +x -> -x :: +z
                 t, 0, -p, .8, .8, .8,     -t, 0, -p, .8, .8, .8, // +x -> -x :: -z
            );
        }

        buffer.push(
            t, 0.007, 0, .8, .2, .2,     -t, 0.007,  0, .8, .2, .2, // +x -> -x
            0,     t, 0, .2, .2, .8,      0,    -t,  0, .2, .2, .8, // +y -> -y
            0, 0.007, t, .2, .8, .2,      0, 0.007, -t, .2, .8, .2, // +z -> -z
        );

        this.vao.vertices = buffer;
        this.program.world = Matrix4.identity.points;
    }

    render(renderer)
    {
        this.vao.draw();
    }
}
