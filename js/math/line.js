'use strict';

import Vector3 from './vector3.js';

export default class Line
{
    constructor(a = new Vector3(0, 0, 0), b = new Vector3(0, 0, 0))
    {
        this._a = a;
        this._b = b;
    }
    
    get a()
    {
        return this._a;
    }
    
    get b()
    {
        return this._b;
    }
    
    get delta()
    {
        return this._b.add(this._a.multiply(-1));
    }
}
