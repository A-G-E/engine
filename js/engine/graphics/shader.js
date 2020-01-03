export default class Shader
{
    #context;
    #src;
    #shader;

    constructor(context, type, src)
    {
        this.#context = context;
        this.#src = src;
        this.#shader = context.createShader(type);

        this.#context.shaderSource(this.#shader, src);
        this.#context.compileShader(this.#shader);

        if(!this.#context.getShaderParameter(this.#shader, this.#context.COMPILE_STATUS))
        {
            console.log(this.#context.getShaderInfoLog(this.#shader));

            this.delete();

            throw new Error('creation of shader went wrong');
        }
    }

    delete()
    {
        this.#context.deleteShader(this.#shader);
    }

    get src()
    {
        return this.#src;
    }

    get shader()
    {
        return this.#shader;
    }
}
