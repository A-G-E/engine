'use strict';

import Vector2 from './vector2.js';

export default class Vector3
{
    constructor(x, y, z)
    {
        this._x = x;
        this._y = y !== undefined
            ? y
            : x;
        this._z = z !== undefined
            ? z
            : x;
    }

    normalize()
    {
        if(this.magnitude === 0)
        {
            return Vector3.normalized;
        }

        let f = this.magnitude;
        return new Vector3(this.x / f, this.y / f, this.z / f);
    }

    max(max = 1)
    {
        return this.multiply(1 / Math.max(1, this.magnitude / max));
    }

    add(x, y, z)
    {
        if(x instanceof Vector3)
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

    subtract(x, y, z)
    {
        if(x instanceof Vector3)
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

        return new Vector3(this.x - x, this.y - y, this.z - z);
    }

    multiply(x, y, z)
    {
        if(x instanceof Vector3)
        {
            y = x.y;
            z = x.z;
            x = x.x;
        }
        else if(!Number.isNaN(x) && y === undefined)
        {
            y = x;
            z = x;
        }

        return new Vector3(this.x * x, this.y * y, this.z * z);
    }

    dotProduct(b)
    {
        return this.x * b.x + this.y * b.y + this.z * b.z;
    }

    crossProduct(b)
    {
        return new Vector3(
            this.x * b.z - this.z * b.y,
            this.z * b.x - this.x * b.z,
            this.x * b.y - this.y * b.x
        );
    }

    equals(b)
    {
        return this.x === b.x && this.y === b.y && this.z === b.z;
    }

    floor()
    {
        return new Vector3(
            Math.floor(this._x),
            Math.floor(this._y),
            Math.floor(this._z)
        );
    }

    ceil()
    {
        return new Vector3(
            Math.ceil(this._x),
            Math.ceil(this._y),
            Math.ceil(this._z)
        );
    }

    round()
    {
        return new Vector3(
            Math.round(this._x),
            Math.round(this._y),
            Math.round(this._z)
        );
    }

    toFixed(decimals)
    {
        return new Vector3(
            this._x.toFixed(decimals),
            this._y.toFixed(decimals),
            this._z.toFixed(decimals)
        );
    }

    [Symbol.toPrimitive]()
    {
        return Object.entries({X: this.x, Y: this.y, Z: this.z}).map(d => d.join(': ')).join(', ');
    }

    *[Symbol.iterator]()
    {
        yield this.x;
        yield this.y;
        yield this.z;
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

    get xy()
    {
        return new Vector2(this.x, this.y);
    }

    get magnitude()
    {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }

    get angle()
    {
        return new Vector2(this.x, this.y).angle;
    }

    get clone()
    {
        return new Vector3(this.x, this.y, this.z);
    }
    
    get normalized()
    {
        return this.normalize();
    }

    static get normalized()
    {
        return new Vector3(Math.sqrt(3));
    }
}
