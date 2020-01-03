export default class Buffer
{
    #context;
    #type;
    #buffer;
    #length;
    #attributes;
    #data;
    
    constructor(context, attributes, data = [], type = null)
    {
        this.#context = context;
        this.#type = type || context.ARRAY_BUFFER;
        this.#buffer = context.createBuffer();
        this.#length = 0;

        this.attributes = attributes;
        this.data = data;
    }

    bind()
    {
        this.#context.bindBuffer(this.#type, this.#buffer);

        return this;
    }

    set attributes(attributes)
    {
        this.#attributes = attributes;

        attributes = attributes.filter(i => i[0] !== undefined);

        if(attributes.length === 0)
        {
            return;
        }

        this.#context.bindBuffer(this.#type, this.#buffer);

        let offset = 0;
        let total = attributes.map(a => a[1]).sum;

        for(let [ key, size ] of attributes)
        {
            this.#context.enableVertexAttribArray(key);
            this.#context.vertexAttribPointer(
                key,
                size,
                this.#context.FLOAT,
                false,
                total * Float32Array.BYTES_PER_ELEMENT,
                offset * Float32Array.BYTES_PER_ELEMENT
            );

            offset += size;
        }
    }

    set data(data)
    {
        this.#context.bindBuffer(this.#type, this.#buffer);
        this.#context.bufferData(this.#type, data, this.#context.STATIC_DRAW);

        this.#length = data.length;
    }

    get length()
    {
        let attributes = this.#attributes.filter(i => i[0] !== undefined);

        return this.#length / Math.max(1, attributes.map(a => a[1]).sum);
    }
}
