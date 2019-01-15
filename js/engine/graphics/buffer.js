'use strict';

export default class Buffer
{
    constructor(renderer, attributes, data = [], type = null)
    {
        this.gl = renderer.gl;
        this._type = type || this.gl.ARRAY_BUFFER;
        this._buffer = this.gl.createBuffer();
        this._length = 0;

        this.attributes = attributes;
        this.data = data;
    }

    bind()
    {
        this.gl.bindBuffer(this._type, this._buffer);

        return this;
    }

    set attributes(attributes)
    {
        this._attributes = attributes;

        attributes = attributes.filter(i => i[0] !== undefined);

        if(attributes.length === 0)
        {
            return;
        }

        this.gl.bindBuffer(this._type, this._buffer);

        let offset = 0;
        let total = attributes.map(a => a[1]).sum;

        for(let [ key, size ] of attributes)
        {
            this.gl.enableVertexAttribArray(key);
            this.gl.vertexAttribPointer(
                key,
                size,
                this.gl.FLOAT,
                false,
                total * Float32Array.BYTES_PER_ELEMENT,
                offset * Float32Array.BYTES_PER_ELEMENT
            );

            offset += size;
        }
    }

    set data(data)
    {
        this.gl.bindBuffer(this._type, this._buffer);
        this.gl.bufferData(this._type, data, this.gl.STATIC_DRAW);

        this._length = data.length;
    }

    get length()
    {
        let attributes = this._attributes.filter(i => i[0] !== undefined);

        return this._length / Math.max(1, attributes.map(a => a[1]).sum);
    }
}
