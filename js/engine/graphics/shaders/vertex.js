import Shader from '../shader.js';

export default class Vertex extends Shader
{
    constructor(context, path)
    {
        super(context, context.VERTEX_SHADER, path);
    }
}
