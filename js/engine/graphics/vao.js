import Buffer from './buffer.js';

export default class Vao
{
    #context;
    #vao;
    #program;
    #attributes;
    #mode = null;
    #buffers = [];

    constructor(context, program, mode = null)
    {
        this.#context = context;
        this.#vao = context.createVertexArray();
        this.#program = program;
        this.#attributes = program.attributes;
        this.#mode = mode;

        const define = (variable, key, size) => {
            Object.defineProperty(this, variable, {
                set: v => {
                    this.bind();

                    let buffer = this.#buffers.find(b => b.variable === variable);

                    if(buffer === undefined)
                    {
                        buffer = {
                            variable,
                            buffer: new Buffer(this.#context, [ [ key, size ] ]),
                            target: v.target ?? this.#context.ARRAY_BUFFER,
                        };

                        this.#buffers.push(buffer);
                    }

                    buffer.buffer.data = v.dataView;

                    this.unbind();
                },
            });
        };

        // define('indices');

        for(const [ variable, [,, key, size ] ] of Object.entries(program.variables).filter(v => v[1][0] === 'Attribute'))
        {
            define(variable, key, size);
        }
    }

    draw(type = this.#context.LINES)
    {
        if(this.#buffers.length === 0)
        {
            return this;
        }

        this.#context.bindVertexArray(this.#vao);

        for(const buffer of this.#buffers)
        {
            switch(buffer.target)
            {
                case this.#context.ELEMENT_ARRAY_BUFFER:
                    this.#context.drawElements(this.#mode ?? type, buffer.buffer.length, this.#context.UNSIGNED_SHORT, 0);
                    break;

                case this.#context.ARRAY_BUFFER:
                    this.#context.drawArrays(this.#mode ?? type, 0, buffer.buffer.length);
                    break;
            }
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

    set mode(mode)
    {
        this.#mode = mode;
    }

    set indices(i)
    {
        this.bind();

        if((i instanceof Uint16Array) === false && (i instanceof DataView) === false)
        {
            i = new Uint16Array(i);
        }

        this.#buffers.push({
            variable: 'indices',
            buffer: new Buffer(this.#context, [], i, this.#context.ELEMENT_ARRAY_BUFFER),
            target: this.#context.ELEMENT_ARRAY_BUFFER,
        });

        this.unbind();
    }
}