export default class Vector2
{
    #x;
    #y;

    constructor(x, y)
    {
        this.#x = x;
        this.#y = y ?? x;
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
        return this.#x;
    }

    set x(x)
    {
        this.#x = x;
    }

    get y()
    {
        return this.#y;
    }

    set y(y)
    {
        this.#y = y;
    }

    get points()
    {
        return [ this.x, this.y ];
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
    }

    get snapped()
    {
        // TODO(Chris Kruining) Turn this getter into a method taking steps as the argument
        const steps = 8;
        const interval = 360 / steps;
        return this.clone.angle = (Math.round((this.angle % 360 + 180) / interval) * interval - 180);
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
