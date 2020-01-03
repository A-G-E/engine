import Shader from '../shader.js';

export default class Fragment extends Shader
{
    constructor(context, path)
    {
        super(context, context.FRAGMENT_SHADER, path);
    }
}
