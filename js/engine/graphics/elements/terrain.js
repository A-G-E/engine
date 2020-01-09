import { Vector2, Vector3, Matrix4 } from '../../../math/exports.js';
import perlin from '../../../lib/perlin.js';
import Renderable from '../renderable.js';

export default class Terrain extends Renderable
{
    #size;
    #loaded = false;
    #indices = [];

    constructor(context, size)
    {
        super(context);

        this.#size = new Vector2(size);

        this.init();
    }

    async init()
    {
        const load = p => fetch(p, { credentials: 'same-origin' }).then(r => r.text());
        const [v, f] = await Promise.all([
            load('/assets/terrain.vs.glsl'),
            load('/assets/terrain.fs.glsl'),
        ]);

        super.init(v, f);

        console.log('terrain loaded');

        const vertexBuffer = [];
        const normalBuffer = [];
        const colorBuffer = [];

        const biome = [ [ 0, 130,  76,   6 ], [ .3,  78, 168,  15 ], [ .8, 178, 110,   0 ], [ 1, 255, 255, 255 ] ];
        let r = .25;
        let a = 2.5;
        const map = (s, e, v) => s + (e - s) * v;
        const color = z =>
        {
            let i = biome.findIndex(v => v[0] >= z);

            if(i === 0)
            {
                return new Vector3(...biome[i].slice(1));
            }

            let v1 = biome[i - 1];
            let v2 = biome[i];

            return new Vector3(
                map(v1[1], v2[1], z) / 255,
                map(v1[2], v2[2], z) / 255,
                map(v1[3], v2[3], z) / 255
            );
        };
        const vertex = (x, y) => new Vector3(x, perlin(x * r, y * r), y);
        const gridSquare = (row, col, indices) =>
        {
            let vertices = [ vertex(col, row), vertex(col + 1, row), vertex(col, row + 1), vertex(col + 1, row + 1) ];
            let colors = [ color(vertices[1].y), color(vertices[1].y), color(vertices[1].y), color(vertices[1].y) ];

            vertices.forEach(v =>
            {
                v.x += (perlin(v.y, v.z) - .5) / 2;
                v.z += (perlin(v.x, v.y) - .5) / 2;
                v.y *= a;
            });

            let normals = [ Vector3.normalFromPoints(vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]), Vector3.normalFromPoints(vertices[indices[3]], vertices[indices[4]], vertices[indices[5]]) ];

            return { vertices, colors, normals };
        };
        const lastRow = [];

        for(let z = 0.0; z < this.#size.y; z++)
        {
            for(let x = 0.0; x < this.#size.x; x++)
            {
                let indices = [];

                // Buffer indices
                {
                    let i = (col, row) =>
                    {
                        let doubleRows = Math.min(row, this.#size.y - 1) * (this.#size.x - 1);
                        let column = col * (row < this.#size.y - 1 ? 2 : 1);

                        return row * (this.#size.x + 1) + doubleRows + column;
                    };
                    let vertices = [
                        i(x, z),         // Top-left
                        i(x, z) + 1,     // Top-right
                        i(x, z + 1),     // Bottom-left
                        i(x, z + 1) + 1, // Bottom-right
                    ];

                    if(z < this.#size.y - 1)
                    {
                        switch((z % 2) * 2 + x % 2)
                        {
                            case 0:
                                indices = [ 0, 3, 2, 1, 3, 0 ];

                                break;
                            case 1:
                                indices = [ 0, 1, 2, 1, 3, 2 ];

                                break;
                            case 2:
                                indices = [ 1, 3, 2, 0, 1, 2 ];

                                break;
                            case 3:
                                indices = [ 1, 3, 0, 0, 3, 2 ];

                                break;
                        }
                    }
                    else
                    {
                        switch((z % 2) * 2 + x % 2)
                        {
                            case 0:
                                indices = [ 3, 0, 2, 1, 3, 0 ];

                                break;
                            case 1:
                                indices = [ 3, 2, 2, 1, 3, 2 ];

                                break;
                            case 2:
                                indices = [ 1, 3, 2, 0, 1, 2 ];

                                break;
                            case 3:
                                indices = [ 1, 3, 0, 0, 3, 2 ];

                                break;
                        }

                        let t = indices[0];
                        indices[0] = indices[1];
                        indices[1] = t;
                    }

                    // This.indices.push(indices.map(i => vertices[i]).join(','));
                    this.#indices.push(...indices.map(i => vertices[i]));
                }

                // Buffer vertices
                {
                    let { vertices, colors, normals } = gridSquare(z, x, indices);

                    // Top-left
                    vertexBuffer.push(...vertices[0]);
                    normalBuffer.push(...normals[0]);
                    colorBuffer.push(...colors[0]);

                    if((z !== this.#size.y - 1 || x === this.#size.x - 1))
                    {
                        // Top-right
                        vertexBuffer.push(...vertices[1]);
                        normalBuffer.push(...normals[1]);
                        colorBuffer.push(...colors[1]);
                    }

                    if(z === this.#size.y - 1)
                    {
                        if(x === 0)
                        {
                            // Bottom-left
                            lastRow.push([ vertices[2], normals[0], colors[2] ]);
                        }

                        // Bottom-right
                        lastRow.push([ vertices[3], normals[1], colors[3] ]);
                    }
                }
            }
        }

        for(let x of lastRow)
        {
            vertexBuffer.push(...x[0]);
            normalBuffer.push(...x[1]);
            colorBuffer.push(...x[2]);
        }

        this.vao.indices = this.#indices;
        this.vao.vertex = { dataView: new Float32Array(vertexBuffer) };
        this.vao.normal = { dataView: new Float32Array(normalBuffer) };
        this.vao.color = { dataView: new Float32Array(colorBuffer) };

        this.program.world = Matrix4.identity
            .translate(new Vector3(-this.#size.x / 2, -10, -this.#size.y / 2))
            // .rotate(60, new Vector3(1, 0, 0))
            .points;

        this.#loaded = true;
    }

    preRender(renderer)
    {
        if(this.#loaded !== true)
        {
            return;
        }

        super.preRender(renderer);
    }

    render(renderer)
    {
        if(this.#loaded !== true)
        {
            return;
        }

        super.render(renderer);
    }
}
