import * as Fyn from '/node_modules/@fyn-software/component/fyn.js';
import { Layout } from '/node_modules/@fyn-software/suite/js/common/layout/docks.js';
import { Direction } from '/node_modules/@fyn-software/suite/js/common/layout/resizable.js';

export default class Editor extends Fyn.Component
{
    static get properties()
    {
        return {
            layout: Layout.default({
                mode: Direction.horizontal,
                sizes: [ null, 150 ],
                children: [
                    {
                        mode: Direction.vertical,
                        sizes: [ null, 300 ],
                        children: [
                            [ 2, 3, 4 ],
                            [ 5, 6 ],
                        ],
                    },
                    [ 1, 7 ],
                ],
            }),
        };
    }
}
