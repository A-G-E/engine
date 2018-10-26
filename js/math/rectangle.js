'use strict';

export default class Rectangle
{
    constructor(x, y, w, h)
    {
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
    }
    
    includes(v2)
    {
        return v2.x >= this._x && v2.x <= this._x + this._w && v2.y >= this._y && v2.y <= this._y + this._h;
    }

    static clone(rectangle)
    {
        return new Rectangle(
            rectangle._x,
            rectangle._y,
            rectangle._w,
            rectangle._h
        );
    }

    *[Symbol.iterator]()
    {
        yield this.x;
        yield this.y;
        yield this.width;
        yield this.height;
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

    get width()
    {
        return this._w;
    }

    set width(w)
    {
        return this._w = w;
    }

    get height()
    {
        return this._h;
    }

    set height(h)
    {
        return this._h = h;
    }

    get position()
    {
        return new Vector2(this._x, this._y);
    }

    get size()
    {
        return new Vector2(this._w, this._h);
    }
}
