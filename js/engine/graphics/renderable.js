import Vao from './vao.js';
import Program from './program.js';
import Vertex from './shaders/vertex.js';
import Fragment from './shaders/fragment.js';

export default class Renderable
{
    constructor(context, v, f, vertices = null, indices = null)
    {
        this.program = new Program(
            context,
            new Vertex(context, v),
            new Fragment(context, f)
        );
        this.vao = new Vao(context, this.program.attributes, vertices, indices);
    }

    preRender(renderer)
    {
        this.program.use();
    }

    render(renderer)
    {
        this.vao.draw(renderer.context.TRIANGLES);
    }

    postRender(renderer)
    {
    }
}