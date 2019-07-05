import Vao from './vao.js';
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
    }

    preRender(renderer)
    {
        this.program.use();
    }

    render(renderer)
    {
        this.vao.draw(renderer.gl.TRIANGLES);
    }

    postRender(renderer)
    {
    }
}