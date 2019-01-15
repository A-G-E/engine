import Renderable from '../renderable.js';
import { Matrix4, Vector3 } from '../../../math/exports.js';

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

export default class Bone extends Renderable
{
    constructor(renderer)
    {
        super(renderer, v, f, [
               0,  0,    0,
             .25, .5,  .25,
            -.25, .5,  .25,
            -.25, .5, -.25,
             .25, .5, -.25,
               0,  2,    0,
        ], [
            0, 1, 2,
            0, 2, 3,
            0, 3, 4,
            0, 4, 1,

            5, 1, 4,
            5, 4, 3,
            5, 3, 2,
            5, 2, 1,
        ]);

        this.program.world = Matrix4.identity.points;
        this.program.projection = renderer.projection.points;

        renderer.on({ resized: () => this.program.projection = renderer.projection.points });
    }

    render(renderer)
    {
        const r = performance.now() * -.00025;
        const d = 5;

        this.program.view = Matrix4.lookAt(
            new Vector3(d * Math.cos(r), 4, d * Math.sin(r)),
            new Vector3(0, 0, 0),
            new Vector3(0, 1, 0)
        ).points;

        this.vao.draw(renderer.gl.TRIANGLES);
    }
}
