import Buffer from '../buffer.js';
import Program from '../program.js';
import Vertex from '../shaders/vertex.js';
import Fragment from '../shaders/fragment.js';
import { Matrix4, Vector3 } from '../../../math/exports.js';

export default class line
{
    constructor(renderer)
    {
        const v = `#version 300 es
            precision mediump float;
            
            in vec3 vertex;
            
            uniform mat4 world;
            uniform mat4 view;
            uniform mat4 projection;
            
            void main(void) {           
                gl_Position = projection * view * world * vec4(vertex, 1.0);
            }
        `;
        const f = `#version 300 es
            precision mediump float;
                        
            out vec4 color;
            
            void main(void) {
                color = vec4(.8, .5, .8, 1.0);
            }
        `;

        this.program = new Program(
            renderer,
            new Vertex(renderer, v),
            new Fragment(renderer, f)
        );
        this.buffer = new Buffer(
            renderer,
            [
                [ this.program.vertex, 3 ]
            ],
            [
                  0, 0, 0,
                  0, 1, 0,
            ]
        );

        this.program.world = Matrix4.identity.points;
        this.program.projection = renderer.projection.points;
        this.program.view = Matrix4.lookAt(
            new Vector3(5, 4, 5),
            new Vector3(0, 0, 0),
            new Vector3(0, 1, 0)
        ).points;

        renderer.on({ resized: () => this.program.projection = renderer.projection.points });
        renderer.gl.drawArrays(renderer.gl.LINE_LOOP, 0, this.buffer.length);
    }

    render(renderer)
    {
        // renderer.gl.drawArrays(renderer.gl.LINE_LOOP, 0, this.buffer.length);
    }
}
