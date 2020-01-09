import Vao from './vao.js';
import Program from './program.js';
import Vertex from './shaders/vertex.js';
import Fragment from './shaders/fragment.js';

export default class Renderable
{
    #context;
    #program;
    #vao;

    constructor(context)
    {
        this.#context = context;
    }

    init(vertexShaderSource, fragmentShaderSource)
    {
        this.#program = new Program(
            this.#context,
            new Vertex(this.#context, vertexShaderSource),
            new Fragment(this.#context, fragmentShaderSource),
        );
        this.#vao = new Vao(this.#context, this.#program);
    }

    preRender(renderer)
    {
        this.#program.use();
    }

    render(renderer)
    {
        this.#vao.draw(renderer.context.TRIANGLES);
    }

    postRender(renderer)
    {
    }

    get context()
    {
        return this.#context;
    }

    get program()
    {
        return this.#program;
    }

    get vao()
    {
        return this.#vao;
    }

    set vertices(v)
    {
        this.#vao.vertices = v;
    }

    set indices(i)
    {
        this.#vao.indices = i;
    }
}