'use strict';

import Vector3 from './vector3.js';

export default class Plane
{
    constructor(ab = new Vector3(0, 0, 0), ac = new Vector3(0, 0, 0), translation = new Vector3(0, 0, 0))
    {
        this.ab = ab;
        this.ac = ac;
        this._translation = translation;
    }
    
    intersectsAt(line)
    {
        return line.a.add(line.delta.normalized.multiply(
            (this.normal.dotProduct(this._translation) - this.normal.dotProduct(line.a)) / this.normal.dotProduct(line.delta)
        ));
    }
    
    get normal()
    {
        return this.ab.crossProduct(this.ac);
    }
    
    get translation()
    {
        return this._translation;
    }
    
    set translation(v3)
    {
        if(!(v3 instanceof Vector3))
        {
            throw new Error('translation must be a Vector 3 instance');
        }
        
        this._translation = v3;
    }
    
    static fromPoints(a, b, c)
    {
        if(![a, b, c].every(p => p instanceof Vector3))
        {
            throw new Error('all 3 points must be a Vector 3 instance');
        }
        
        return new Plane(b.add(a.multiply(-1)), c.add(a.multiply(-1)), a);
    }
}
