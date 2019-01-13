'use strict';

import Shader from '../shader.js';

export default class Fragment extends Shader
{
    constructor(renderer, path)
    {
        super(renderer, renderer.gl.FRAGMENT_SHADER, path);
    }
}
