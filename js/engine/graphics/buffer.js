'use strict';

export default class Buffer
{
    constructor(renderer, attributes, type = null)
    {
        this.gl = renderer.gl;
        this._attributes = attributes;
        this._type = type || this.gl.ARRAY_BUFFER;
        this._renderer = renderer;
        this._buffer = this.gl.createBuffer();
    }

    bind()
    {
        this.gl.bindBuffer(this._type, this._buffer);
    }
    
    get buffer()
    {
        return this._buffer;
    }

    set data(data)
    {
        this.bind();
        
        this.gl.bufferData(this._type, data, this.gl.STATIC_DRAW);
        
        let attributes = this._attributes.filter(i => i[0] !== undefined);
        
        if(attributes.length === 0)
        {
            return;
        }
        
        let offset = 0;
        let total = attributes.map(a => a[1]).sum();
        
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
    }
}
