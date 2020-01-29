import Vector3 from './vector3.js';

export default class Matrix4
{
    #points = new Float32Array(16);

    constructor(points = null)
    {
        if(points !== null)
        {
            this.#points = new Float32Array(points);
        }
    }

    multiply(matrix)
    {
        if(!(matrix instanceof Matrix4))
        {
            return null;
        }

        let a = this.#points;
        let b = matrix.#points;

        return new Matrix4([
            a[0] * b[ 0] + a[4] * b[ 1] + a[ 8] * b[ 2] + a[12] * b[ 3],
            a[1] * b[ 0] + a[5] * b[ 1] + a[ 9] * b[ 2] + a[13] * b[ 3],
            a[2] * b[ 0] + a[6] * b[ 1] + a[10] * b[ 2] + a[14] * b[ 3],
            a[3] * b[ 0] + a[7] * b[ 1] + a[11] * b[ 2] + a[15] * b[ 3],

            a[0] * b[ 4] + a[4] * b[ 5] + a[ 8] * b[ 6] + a[12] * b[ 7],
            a[1] * b[ 4] + a[5] * b[ 5] + a[ 9] * b[ 6] + a[13] * b[ 7],
            a[2] * b[ 4] + a[6] * b[ 5] + a[10] * b[ 6] + a[14] * b[ 7],
            a[3] * b[ 4] + a[7] * b[ 5] + a[11] * b[ 6] + a[15] * b[ 7],

            a[0] * b[ 8] + a[4] * b[ 9] + a[ 8] * b[10] + a[12] * b[11],
            a[1] * b[ 8] + a[5] * b[ 9] + a[ 9] * b[10] + a[13] * b[11],
            a[2] * b[ 8] + a[6] * b[ 9] + a[10] * b[10] + a[14] * b[11],
            a[3] * b[ 8] + a[7] * b[ 9] + a[11] * b[10] + a[15] * b[11],

            a[0] * b[12] + a[4] * b[13] + a[ 8] * b[14] + a[12] * b[15],
            a[1] * b[12] + a[5] * b[13] + a[ 9] * b[14] + a[13] * b[15],
            a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15],
            a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15]
        ]);
    }

    translate(vector)
    {
        return this.multiply(Matrix4.translation(vector));
    }

    rotate(degrees, axis)
    {
        let m = Matrix4.rotation(degrees, axis).points;
        let p = this.#points;

        return new Matrix4([
            p[0] * m[0] + p[4] * m[1] + p[ 8] * m[ 3],
            p[1] * m[0] + p[5] * m[1] + p[ 9] * m[ 3],
            p[2] * m[0] + p[6] * m[1] + p[10] * m[ 3],
            p[3] * m[0] + p[7] * m[1] + p[11] * m[ 3],

            p[0] * m[4] + p[4] * m[5] + p[ 8] * m[ 6],
            p[1] * m[4] + p[5] * m[5] + p[ 9] * m[ 6],
            p[2] * m[4] + p[6] * m[5] + p[10] * m[ 6],
            p[3] * m[4] + p[7] * m[5] + p[11] * m[ 6],

            p[0] * m[8] + p[4] * m[9] + p[ 8] * m[10],
            p[1] * m[8] + p[5] * m[9] + p[ 9] * m[10],
            p[2] * m[8] + p[6] * m[9] + p[10] * m[10],
            p[3] * m[8] + p[7] * m[9] + p[11] * m[10],

            p[12], p[13], p[14], p[15],
        ]);
    }

    scale(vector)
    {
        return this.multiply(Matrix4.scaling(vector));
    }

    print()
    {
        let str = '';

        for(let i = 0; i < 16; i += 4)
        {
            str += `${this.#points.slice(i, i + 4).join(' ')}\n`;
        }

        console.log(str);
    }

    get points()
    {
        return this.#points;
    }

    static perspective(fovy, aspect, near, far)
    {
        let f = 1 / Math.tan(fovy / 2);
        let m22; let m32;

        if(far != null && far !== Infinity)
        {
            let nf = 1 / (near - far);
            m22 = (far + near) * nf;
            m32 = 2 * far * near * nf;
        }
        else
        {
            m22 = -1;
            m32 = -2 * near;
        }

        return new Matrix4([
            f / aspect, 0,   0,  0,
            0,          f,   0,  0,
            0,          0, m22, -1,
            0,          0, m32,  0
        ]);
    }

    static orthographic(l, r, b, t, n, f)
    {
        return new Matrix4([ 2 / (r - l),       0,                 0,                 0, 0,                 2 / (t - b),       0,                 0, 0,                 0,                 2 / (n - f),       0, (l + r) / (l - r), (b + t) / (b - t), (n + f) / (n - f), 1 ]);
    }

    static lookAt(eye, center, up)
    {
        if([ eye, center, up ].some(v => (v instanceof Vector3) !== true))
        {
            throw new Error('Expected 3 Vector3\'s got something else');
        }

        let x0, x1, x2, x3;
        let y0, y1, y2, y3;
        let z0, z1, z2, z3;
        z0 = eye.x - center.x;
        z1 = eye.y - center.y;
        z2 = eye.z - center.z;

        if([ z0, z1, z2 ].every(v => Math.abs(v) < Matrix4.epsilon))
        {
            return Matrix4.identity;
        }

        let length = 1 / Math.sqrt(z0 ** 2 + z1 ** 2 + z2 ** 2);

        z0 *= length;
        z1 *= length;
        z2 *= length;

        x0 = up.y * z2 - up.z * z1;
        x1 = up.z * z0 - up.x * z2;
        x2 = up.x * z1 - up.y * z0;

        length = Math.sqrt(x0 ** 2 + x1 ** 2 + x2 ** 2);

        if(!length)
        {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        }
        else
        {
            length = 1 / length;
            x0 *= length;
            x1 *= length;
            x2 *= length;
        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;

        length = Math.sqrt(y0 ** 2 + y1 ** 2 + y2 ** 2);
        if(!length)
        {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        }
        else
        {
            length = 1 / length;
            y0 *= length;
            y1 *= length;
            y2 *= length;
        }

        x3 = -(x0 * eye.x + x1 * eye.y  + x2 * eye.z);
        y3 = -(y0 * eye.x + y1 * eye.y  + y2 * eye.z);
        z3 = -(z0 * eye.x + z1 * eye.y  + z2 * eye.z);

        return new Matrix4([
            x0, y0, z0, 0,
            x1, y1, z1, 0,
            x2, y2, z2, 0,
            x3, y3, z3, 1
        ]);
    }

    static translation(vector)
    {
        let { x, y, z } = vector;

        return new Matrix4([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1 ]);
    }

    static rotation(degrees, axis)
    {
        // if(axis.magnitude < Matrix4.epsilon)
        // {
        //     console.log(axis, axis.magnitude, Matrix4.epsilon);
        //
        //     return null;
        // }

        axis = axis.multiply(1 / axis.magnitude);

        let s = Math.sin(degrees * Math.PI / 180);
        let c = Math.cos(degrees * Math.PI / 180);
        let t = 1 - c;
        let { x, y, z } = axis;

        return new Matrix4([ x * x * t + c,      y * x * t + z * s,   z * x * t - y * s,     0, x * y * t - z * s,  y * y * t + c,       z * y * t + x * s,     0, x * z * t + y * s,  y * z * t - x * s,   z * z * t + c,         0, 0,                  0,                   0,                     0 ]);
    }

    static scaling(vector)
    {
        let { x, y, z } = vector;

        return new Matrix4([ x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1 ]);
    }

    static fromColumnMajor(points)
    {
        return new Matrix4([
            points[0], points[4], points[ 8], points[12],
            points[1], points[5], points[ 9], points[13],
            points[2], points[6], points[10], points[14],
            points[3], points[7], points[11], points[15],
        ]);
    }

    static get identity()
    {
        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]);
        return new Matrix4([
            1, 0, 0, 0,
            0, 0, 1, 0,
            0, -1, 0, 0,
            0, 0, 0, 1,
        ]);
    }

    static get epsilon()
    {
        return 0.000001;
    }
}
