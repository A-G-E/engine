import Vao from './vao.js';
import Program from './program.js';
import Vertex from './shaders/vertex.js';
import Fragment from './shaders/fragment.js';
import Matrix4 from '../../math/matrix4.js';

export default class Renderable
{
    #context;
    #program;
    #vao;
    #world = Matrix4.identity;

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
        this.world = this.#world;
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

    set indices(i)
    {
        this.#vao.indices = i;
    }

    get world()
    {
        return this.#world;
    }

    set world(matrix)
    {
        this.#world = matrix;

        if('world' in this.#program)
        {
            this.#program.world = matrix.points;
        }
    }
}