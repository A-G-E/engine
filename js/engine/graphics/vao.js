import Buffer from './buffer.js';

export default class Vao
{
    #context;
    #vao;
    #attributes;
    #vertices;
    #indices;

    constructor(context, attributes, vertices = null, indices = null)
    {
        this.#context = context;
        this.#vao = context.createVertexArray();
        this.#attributes = attributes;
        this.#vertices = null;
        this.#indices = null;

        if(vertices !== null)
        {
            this.vertices = vertices;
        }

        if(indices !== null)
        {
            this.indices = indices;
        }
    }

    draw(type = this.#context.LINES)
    {
        if(this.#vertices === null)
        {
            return this;
        }

        this.#context.bindVertexArray(this.#vao);

        if(this.#indices !== null)
        {
            this.#context.drawElements(type, this.#indices.length, this.#context.UNSIGNED_SHORT, 0);
        }
        else
        {
            this.#context.drawArrays(type, 0, this.#vertices.length);
        }

        this.#context.bindVertexArray(null);

        return this;
    }

    bind()
    {
        this.#context.bindVertexArray(this.#vao);

        return this;
    }

    unbind()
    {
        this.#context.bindVertexArray(null);

        return this;
    }

    set vertices(v)
    {
        this.bind();

        this.#vertices = new Buffer(this.#context, this.#attributes, new Float32Array(v));

        this.unbind();
    }

    set indices(i)
    {
        this.bind();

        this.#indices = new Buffer(
            this.#context,
            [],
            new Uint16Array(i),
            this.#context.ELEMENT_ARRAY_BUFFER
        );

        this.unbind();
    }
}