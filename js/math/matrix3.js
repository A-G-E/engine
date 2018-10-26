'use strict';

export default class Matrix3
{
    constructor(points = null)
    {
        this._points = new Float32Array(points || 9);
    }

    multiply(matrix)
    {
        let a = this._points;
        let b = matrix._points;

        a[0] = a[0] * b[0] + a[3] * b[1] + a[6] * b[2];
        a[1] = a[1] * b[0] + a[4] * b[1] + a[7] * b[2];
        a[2] = a[2] * b[0] + a[5] * b[1] + a[8] * b[2];

        a[3] = a[0] * b[3] + a[3] * b[4] + a[6] * b[5];
        a[4] = a[1] * b[3] + a[4] * b[4] + a[7] * b[5];
        a[5] = a[2] * b[3] + a[5] * b[4] + a[8] * b[5];

        a[6] = a[0] * b[6] + a[3] * b[7] + a[6] * b[8];
        a[7] = a[1] * b[6] + a[4] * b[7] + a[7] * b[8];
        a[8] = a[2] * b[6] + a[5] * b[7] + a[8] * b[8];

        return new Matrix3(a);
    }

    translate(vector)
    {
        return this.multiply(Matrix3.translation(vector));
    }

    scale(vector)
    {
         return this.multiply(Matrix3.scaling(vector));
    }

    get points()
    {
         return this._points;
    }

    static projection(w, h)
    {
        return new Matrix3([
            2 / w, 0,      0,
            0,     -2 / h, 0,
            -1,    1,      1,
        ]);
    }

    static translation(vector)
    {
        let { x, y } = vector;

        return new Matrix3([
            1, 0, 0,
            0, 1, 0,
            x, y, 1,
        ]);
    }

    static scaling(vector)
    {
        let { x, y } = vector;

        return new Matrix4([
            x, 0, 0,
            0, y, 0,
            0, 0, 1,
        ]);
    }
}