import Buffer from './buffer.js';

export default class Vao
{
    constructor(renderer, attributes, vertices = null, indices = null)
    {
        this.gl = renderer.gl;
        this._renderer = renderer;
        this._vao = renderer.gl.createVertexArray();
        this._attributes = attributes;
        this._vertices = null;
        this._indices = null;

        if(vertices !== null)
        {
            this.vertices = vertices;
        }

        if(indices !== null)
        {
            this.indices = indices;
        }
    }

    draw(type = this.gl.LINES)
    {
        if(this._vertices === null)
        {
            return this;
        }

        this.gl.bindVertexArray(this._vao);

        if(this._indices !== null)
        {
            this.gl.drawElements(type, this._indices.length, this.gl.UNSIGNED_SHORT, 0);
        }
        else
        {
            this.gl.drawArrays(type, 0, this._vertices.length);
        }

        this.gl.bindVertexArray(null);

        return this;
    }

    bind()
    {
        this.gl.bindVertexArray(this._vao);

        return this;
    }

    unbind()
    {
        this.gl.bindVertexArray(null);

        return this;
    }

    set vertices(v)
    {
        this.bind();

        this._vertices = new Buffer(this._renderer, this._attributes, new Float32Array(v));

        this.unbind();
    }

    set indices(i)
    {
        this.bind();

        this._indices = new Buffer(
            this._renderer,
            [],
            new Uint16Array(i),
            this._renderer.gl.ELEMENT_ARRAY_BUFFER
        );

        this.unbind();
    }
}