'use strict';

export default class Buffer
{
    constructor(renderer, key, size)
    {
        this.gl = renderer.gl;
        this._key = key;
        this._size = size;
        this._renderer = renderer;
        this._buffer = this.gl.createBuffer();
    }

    bind()
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._buffer);
    }

    activate()
    {
        this.bind();
        
        this.gl.vertexAttribPointer(
            this._renderer.program[this._key],
            this._size,
            this.gl.FLOAT,
            false,
            this._size * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.gl.enableVertexAttribArray(this._renderer.program[this._key]);
    }
    
    get buffer()
    {
        return this._buffer;
    }

    set data(vertices)
    {
        this.bind();

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    }
}
