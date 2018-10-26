'use strict';

export default class Vector2 {
    constructor(x, y)
    {
        this._x = x;
        this._y = y !== undefined
            ? y
            : x;
    }

    normalize()
    {
        if(this.magnitude === 0)
        {
            return Vector2.normalized;
        }

        let f = this.magnitude;
        return new Vector2(this.x / f, this.y / f);
    }

    max(max = 1)
    {
        return this.multiply(1 / Math.max(1, this.magnitude / max));
    }

    add(x, y)
    {
        if(x instanceof Vector2)
        {
            y = x.y;
            x = x.x;
        }
        else if(Number.isInteger(x) && y === undefined)
        {
            y = x;
        }

        return new Vector2(this.x + x, this.y + y);
    }

    subtract(x, y)
    {
        if(x instanceof Vector2)
        {
            y = x.y;
            x = x.x;
        }
        else if(Number.isInteger(x) && y === undefined)
        {
            y = x;
        }

        return new Vector2(this.x - x, this.y - y);
    }

    multiply(x, y)
    {
        if(x instanceof Vector2)
        {
            y = x.y;
            x = x.x;
        }
        else if(!Number.isNaN(x) && y === undefined)
        {
            y = x;
        }

        return new Vector2(this.x * x, this.y * y);
    }

    dotProduct(b)
    {
        return this.x * b.x + this.y * b.y;
    }

    *[Symbol.iterator]()
    {
        yield this.x;
        yield this.y;
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

    get magnitude()
    {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    get angle()
    {
        return Math.atan2(this.y, this.x) * 180 / Math.PI;
    }

    set angle(angle)
    {
        let magnitude = this.magnitude;

        this.x = magnitude * Math.cos(angle * Math.PI / 180);
        this.y = magnitude * Math.sin(angle * Math.PI / 180);

        return this;
    }

    get snapped()
    {
        let angle = this.angle % 360 + 180;

        if (angle <= 22.5 || angle >= 337.5) {
            angle = 0;
        } else if (angle <= 67.5) {
            angle = 45;
        } else if (angle <= 112.5) {
            angle = 90;
        } else if (angle <= 157.5) {
            angle = 135
        } else if (angle <= 202.5) {
            angle = 180
        } else if (angle <= 247.5) {
            angle = 225
        } else if (angle <= 292.5) {
            angle = 270
        } else if (angle < 337.5) {
            angle = 315
        }

        angle -= 180;

        return this.clone.angle = angle;
    }

    get clone()
    {
        return new Vector2(this.x, this.y);
    }

    static get normalized()
    {
        return new Vector2(Math.sqrt(2));
    }
}
