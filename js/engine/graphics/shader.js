'use strict';

export default class Shader
{
    constructor(renderer, type, src)
    {
        this.gl = renderer.gl;
        this._src = src;
        this._shader = this.gl.createShader(type);
    
        this.gl.shaderSource(this._shader, src);
        this.gl.compileShader(this._shader);
    
        if(!this.gl.getShaderParameter(this._shader, this.gl.COMPILE_STATUS))
        {
            this.delete();
        
            throw new Error('creation of shader went wrong');
        }
    }

    delete()
    {
        this.gl.deleteShader(this._shader);
    }

    get src()
    {
        return this._src;
    }

    get shader()
    {
        return this._shader;
    }
}
