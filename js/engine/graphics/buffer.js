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

    set attributes(attributes)
    {
        this._attributes = attributes;

        this.gl.bindBuffer(this._type, this._buffer);

        attributes = attributes.filter(i => i[0] !== undefined);

        if(attributes.length === 0)
        {
            return;
        }

        let offset = 0;
        let total = attributes.map(a => a[1]).sum;

        for(let [ key, size ] of attributes)
        {
            this.gl.vertexAttribPointer(
                key,
                size,
                this.gl.FLOAT,
                false,
                total * Float32Array.BYTES_PER_ELEMENT,
                offset * Float32Array.BYTES_PER_ELEMENT
            );
            this.gl.enableVertexAttribArray(key);

            offset += size;
        }

        // this.gl.bindBuffer(this._type, null);
    }

    set data(data)
    {
        this.gl.bindBuffer(this._type, this._buffer);
        this.gl.bufferData(this._type, new Float32Array(data), this.gl.STATIC_DRAW);
        // this.gl.bindBuffer(this._type, null);

        this._length = data.length;
    }

    get length()
    {
        let attributes = this._attributes.filter(i => i[0] !== undefined);

        if(attributes.length === 0)
        {
            return 0;
        }

        return this._length / attributes.map(a => a[1]).sum;
    }
}
