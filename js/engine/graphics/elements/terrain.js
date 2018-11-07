'use strict';

import Buffer from '../buffer.js';
import Program from '../program.js';
import Vertex from '../shaders/vertex.js';
import Fragment from '../shaders/fragment.js';
import {Vector2, Vector3, Matrix4, Plane} from '../../../math/exports.js';
import perlin from '../../../lib/perlin.js';

export default class Terrain
{
    constructor(renderer, size, view, projection)
    {
        this.size = size;
        
        let load = p => fetch(p, {credentials: 'same-origin'}).then(r => r.text());
    
        Promise.all([
            load('vertex.glsl'),
            load('fragment.glsl'),
        ]).then(([v, f]) =>
        {
            this.program = new Program(
                renderer,
                new Vertex(renderer, v),
                new Fragment(renderer, f)
            );
            
            this.buffer = [];
            this.indices = [];
            
            let biome = [
                [ 0, 130,  76,   6 ],
                [.3,  78, 168,  15 ],
                [.8, 178, 110,   0 ],
                [ 1, 255, 255, 255 ],
            ];
            let r = .25;
            let a = 2.5;
            let map = (s, e, v) => s + (e - s) * v;
            let color = z => {
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
            let vertex = (x, y) => new Vector3(x, perlin(x * r, y * r), y);
            let buffer = (vertex, normal, color) => this.buffer.push(...vertex, ...normal, ...color);
            let gridSquare = (row, col, indices) => {
                let vertices = [
                    vertex(col    , row    ),
                    vertex(col + 1, row    ),
                    vertex(col    , row + 1),
                    vertex(col + 1, row + 1),
                ];
                let colors = [
                    color(vertices[1].y),
                    color(vertices[1].y),
                    color(vertices[1].y),
                    color(vertices[1].y),
                ];
                
                vertices.forEach(v => {
                    v.x += (perlin(v.y, v.z) - .5) / 2;
                    v.z += (perlin(v.x, v.y) - .5) / 2;
                    v.y *= a;
                });
                
                let normals = [
                    Vector3.normalFromPoints(vertices[indices[0]], vertices[indices[1]], vertices[indices[2]]),
                    Vector3.normalFromPoints(vertices[indices[3]], vertices[indices[4]], vertices[indices[5]]),
                ];
                
                return { vertices, colors, normals };
            };
            let lastRow = [];
            
            for(let z = 0.0; z < size.y; z++)
            {
                for(let x = 0.0; x < size.x; x++)
                {
                    let indices = [];
                    
                    // buffer indices
                    {
                        let i = (col, row) => {
                            let doubleRows = Math.min(row, size.y - 1) * (size.x - 1);
                            let column = col * (row < size.y - 1 ? 2 : 1);
                            
                            return row * (size.x + 1) + doubleRows + column;
                        };
                        let vertices = [
                            i(x, z),         // top-left
                            i(x, z) + 1,     // top-right
                            i(x, z + 1),     // bottom-left
                            i(x, z + 1) + 1, // bottom-right
                        ];
                        
                        switch((z % 2) * 2 + x % 2)
                        {
                            case 0:
                                indices = [
                                    0, 2, 3,
                                    1, 3, 0,
                                ];
                                break;
                            case 1:
                                indices = [
                                    0, 2, 1,
                                    1, 3, 2,
                                ];
                                break;
                            case 2:
                                indices = [
                                    1, 3, 2,
                                    0, 1, 2,
                                ];
                                break;
                            case 3:
                                indices = [
                                    1, 3, 0,
                                    0, 2, 3,
                                ];
                                break;
                        }
    
                        if(z === size.y - 1)
                        {
                            let t = indices[0];
                            indices[0] = indices[1];
                            indices[1] = t;
                        }
    
                        // this.indices.push(indices.map(i => vertices[i]).join(','));
                        this.indices.push(...indices.map(i => vertices[i]));
                    }
                    
                    // buffer vertices
                    {
                        let {vertices, colors, normals} = gridSquare(z, x, indices);
    
                        // top-left
                        buffer(vertices[0], normals[0], colors[0]);
    
                        if((z !== size.y - 1 || x === size.x - 1))
                        {
                            // top-right
                            buffer(vertices[1], normals[1], colors[1]);
                        }
    
                        if(z === size.y - 1)
                        {
                            if(x === 0)
                            {
                                // bottom-left
                                lastRow.push([vertices[2], normals[0], colors[2]]);
                            }
        
                            // bottom-right
                            lastRow.push([vertices[3], normals[1], colors[3]]);
                        }
                    }
                }
            }
            
            for(let x of lastRow)
            {
                buffer(...x);
            }
            
            let bv = new Buffer(renderer, [
                [ this.program['vertex'], 3 ],
                [ this.program['normal'], 3 ],
                [ this.program['color'], 3 ],
            ]);
            bv.data = new Float32Array(this.buffer);
            
            let bi = new Buffer(renderer, [], renderer.gl.ELEMENT_ARRAY_BUFFER);
            bi.data = new Uint16Array(this.indices);
            
            let world = Matrix4.identity
                .rotate(60, new Vector3(1, 0, 0))
                .translate(new Vector3(-size.x / 2, 0, -size.y / 2));
    
            this.program.world = world.points;
            this.program.view = view.points;
            this.program.projection = projection.points;
            this.program.lightDirection = new Vector3(.3, -1, .5).points;
            this.program.lightColour = new Vector3(1, .8, .8).points;
            this.program.lightBias = new Vector2(.3, .8).points;
            
            this.loaded = true;
        });
    }
    
    render(renderer)
    {
        if(this.loaded !== true)
        {
            return;
        }
        
        // angle = performance.now() / 150 * Math.PI;
        // renderer.program.world = world
        //     .rotate(angle, new Vector3(0, 1, 0))
        //     .translate(new Vector3(-s.x / 2, 0.0, -s.y / 2))
        //     .points;
    
        // renderer.gl.drawArrays(renderer.gl.TRIANGLES, 0, this.size.x * this.size.y / 3);
        renderer.gl.drawElements(renderer.gl.TRIANGLES, this.indices.length, renderer.gl.UNSIGNED_SHORT, 0);
    }
}