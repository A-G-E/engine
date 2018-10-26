'use strict';

import Vector2 from './vector2.js';

export default class Vector4
{
    constructor(x, y, z, w)
    {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
    }

    normalize()
    {
        if(this.magnitude === 0)
        {
            return (new Vector4(1)).normalize();
        }

        let f = this.magnitude;
        return new Vector3(this.x / f, this.y / f, this.z / f, this.w / f);
    }

    add(x, y, z)
    {
        if(x instanceof Vector2)
        {
            y = x.y;
            z = x.z;
            x = x.x;
        }
        else if(Number.isInteger(x) && y === undefined)
        {
            y = x;
            z = x;
        }

        return new Vector3(this.x + x, this.y + y, this.z + z);
    }

    multiply(x, y, z, w)
    {
        if(x instanceof Vector4)
        {
            y = x.y;
            z = x.z;
            w = x.w;
            x = x.x;
        }
        else if(!Number.isNaN(x) && y === undefined)
        {
            y = x;
            z = x;
            w = x;
        }

        return new Vector4(this.x * x, this.y * y, this.z * z, this.w * w);
    }

    *[Symbol.iterator]()
    {
        yield this.x;
        yield this.y;
        yield this.z;
        yield this.w;
    }

    get x()
    {
        return this._x;
    }

    set x(x)
    {
        this._x = x;
    }

    get y()
    {
        return this._y;
    }

    set y(y)
    {
        this._y = y;
    }

    get z()
    {
        return this._z;
    }

    set z(z)
    {
        this._z = z;
    }

    get w()
    {
        return this._w;
    }

    set w(w)
    {
        this._w = w;
    }
    
    get xy()
    {
        return new Vector2(this.x, this.y);
    }
    
    get zw()
    {
        return new Vector2(this.z, this.w);
    }
    
    get normalized()
    {
        return this.normalize();
    }

    get magnitude()
    {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2);
    }

    get clone()
    {
        return new Vector4(...this);
    }
}