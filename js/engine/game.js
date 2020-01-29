import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.mjs';
import { Matrix4, Vector3 } from '../math/exports.js';
import Renderer from './graphics/renderer.js';
import Ubo from './graphics/ubo.js';
import Obj from './graphics/elements/obj.js';
import Grid from './graphics/elements/grid.js';
import Bone from './graphics/elements/bone.js';
import Gltf from './graphics/elements/gltf.js';

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
        const light = new Ubo(this.#renderer.context, 'lighting', {
            position: new Vector3(5.0, 3.0, 5.0),
            color: new Vector3(0.15, 0.15, 0.15),
        });

        this.#renderer.on({
            resized: () => this.#camera.projection = this.#renderer.projection,
        });

        const susan = new Obj(this.#renderer.context, await fetch('/assets/monkey.obj').then(r => r.text()));
        const vegeta = new Gltf(this.#renderer.context, '/assets/', 'vegeta');

        const roborex = new Gltf(this.#renderer.context, '/assets/', 'robo_trex');
        roborex.world = Matrix4.identity.translate(new Vector3(-1.5, 0, 0));

        // const monster = new Gltf(this.#renderer.context, '/assets/', 'Monster');
        // monster.program.world = Matrix4.identity.translate(new Vector3(.15, 0, -.25)).scale(new Vector3(.025)).rotate(-90, new Vector3(1, 0, 0)).points;

        let d = 1.25;
        let angle = [ 0, 0 ];

        const draw = () => {
            const r = performance.now() * .0005;

            susan.world = Matrix4.identity
                .translate(new Vector3(2.5, 1.5, 0))
                .scale(new Vector3(.5, .5, .5))
                .rotate(25 * Math.sin(r * 5), new Vector3(1, 0, 0))
                .translate(new Vector3(0, .6, .3));

            requestAnimationFrame(draw);
        };
        draw();

        this.#renderer.add(new Grid(this.#renderer.context));
        this.#renderer.add(susan);
        this.#renderer.add(vegeta);
        this.#renderer.add(roborex);
        // this.#renderer.add(monster);

        await vegeta.parsing;
        const armatureWalker = (matrix, joint) => {
            const bone = new Bone(this.#renderer.context);
            const m = matrix
                .translate(new Vector3(...joint.transform.translation))
                .rotate(joint.transform.rotation[0], new Vector3(...joint.transform.rotation.slice(1)))

            bone.world = m.scale(new Vector3(...joint.transform.scale));
            this.#renderer.add(bone);

            for(const c of joint.children ?? [])
            {
                armatureWalker(m, c);
            }
        };

        armatureWalker(Matrix4.identity, vegeta.armature.bones);

        this.#renderer.play();

        const updateCamera = () => {
            const position = new Vector3(
                d * Math.sin(angle[0]),
                d * (1 + Math.cos(angle[1])),
                d * Math.cos(angle[0]),
            );

            this.#camera.view = Matrix4.lookAt(position.clone, new Vector3(0, 1, 0), new Vector3(0, 1, 0));
            light.position = position.clone;
        };

        let moving = false;
        let start = null;
        let startAngle = null;

        this.on({
            mouse: ({ buttons, position }) => {
                moving = buttons[0] !== 0;

                if(moving === false)
                {
                    start = null;

                    return;
                }

                if(start === null)
                {
                    start = position;
                    startAngle = angle;
                }

                const delta = [
                    (position[0] - start[0]) / 50,
                    (position[1] - start[1]) / 100,
                ];

                angle = [
                    (startAngle[0] - delta[0]) % 360,
                    Math.clamp(0, 3, startAngle[1] - delta[1]),
                ];

                updateCamera();
            },
            wheel: delta => {
                d = Math.clamp(1.25, 5.25, d + delta);

                updateCamera();
            },
        });

        updateCamera();
    }

    resize(w, h)
    {
        this.#renderer.resize(w, h);
    }
}

Comlink.expose(Game);
