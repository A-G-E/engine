'use strict';

import Shader from '../shader.js';

export default class Vertex extends Shader
{
    constructor(renderer, path)
    {
        super(renderer, renderer.gl.VERTEX_SHADER, path);
    }
}