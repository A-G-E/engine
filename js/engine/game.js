import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.mjs';
import { Matrix4, Vector3 } from '../math/exports.js';
import Renderer from './graphics/renderer.js';
import Ubo from './graphics/ubo.js';
import Obj from './graphics/elements/obj.js';
import Grid from './graphics/elements/grid.js';
import Bone from './graphics/elements/bone.js';
import Gltf from './graphics/elements/gltf.js';
import Terrain from './graphics/elements/terrain.js';

export default class Game extends EventTarget
{
    #renderer;
    #camera;

    constructor(canvas)
    {
        super();

        this.#renderer = new Renderer(this, canvas);
        this.#camera = new Ubo(this.#renderer.context, 'camera', {
            view: Matrix4.lookAt(
                new Vector3(1, 1.25, 1.25), // Camara position
                new Vector3(0, 1, 0),       // Position to loot at
                new Vector3(0, 1, 0)        // ?????
            ),
            projection: this.#renderer.projection,
        });

        this.ready();
    }

    async ready()
    {
        new Ubo(this.#renderer.context, 'lighting', {
            position: new Vector3(5.0, 3.0, 5.0),
            color: new Vector3(0.25, 0.25, 0.25),
        });

        this.#renderer.on({
            resized: () => this.#camera.projection = this.#renderer.projection,
        });

        const bones = Array.from(Array(150), i => new Bone(this.#renderer.context, 1));
        const susan = new Obj(this.#renderer.context, await fetch('/assets/monkey.obj').then(r => r.text()));
        const vegeta = new Gltf(this.#renderer.context, '/assets/vegeta');
        vegeta.program.world = Matrix4.identity.points;

        const draw = () => {
            const r = performance.now() * .0005;
            const d = 1.25;

            this.#camera.view = Matrix4.lookAt(
                new Vector3(d * Math.cos(r), d + (.2 * Math.sin(r)), d * Math.sin(r)),
                new Vector3(0, 1, 0),
                new Vector3(0, 1, 0)
            );

            susan.program.world = Matrix4.identity
                .translate(new Vector3(2.5, 1.5, 0))
                .scale(new Vector3(.5, .5, .5))
                .rotate(25 * Math.sin(r * 5), new Vector3(1, 0, 0))
                .translate(new Vector3(0, .6, .3))
                .points;

            let m = Matrix4.identity.translate(new Vector3(-4, 0, 0));
            const modifier = Math.sin(performance.now() * .0005);
            const translation = new Vector3(0, 1, 0);

            for(const bone of bones)
            {
                bone.world = m;

                m = m.translate(translation)
                    .rotate(60 * modifier, new Vector3(1, -Math.abs(.05 * modifier), 0));
            }

            requestAnimationFrame(draw);
        };
        draw();

        this.#renderer.add(new Grid(this.#renderer.context));
        bones.forEach(b => this.#renderer.add(b));
        this.#renderer.add(susan);
        this.#renderer.add(vegeta);
        this.#renderer.play();
    }

    resize(w, h)
    {
        this.#renderer.resize(w, h);
    }
}

Comlink.expose(Game);
