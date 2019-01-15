import Vao from './vao.js';
import Ubo from './ubo.js';
import Program from './program.js';
import Vertex from './shaders/vertex.js';
import Fragment from './shaders/fragment.js';

export default class Renderable
{
    constructor(renderer, v, f, vertices = null, indices = null)
    {
        this.renderer = renderer;
        this.program = new Program(
            renderer,
            new Vertex(renderer, v),
            new Fragment(renderer, f)
        );
        this.vao = new Vao(renderer, this.program.attributes, vertices, indices);
        // this.ubo = new Ubo(renderer, this.program.uniforms);
    }

    preRender(renderer)
    {
        this.program.use();
    }

    render(renderer)
    {
    }

    postRender(renderer)
    {
    }
}