import * as Fyn from '/node_modules/@fyn-software/component/fyn.js';
import * as Types from '/node_modules/@fyn-software/data/types.js';
import { Layout } from '/node_modules/@fyn-software/suite/js/common/layout/docks.js';
import { Direction } from '/node_modules/@fyn-software/suite/js/common/layout/resizable.js';

const Sizes = Types.Enum.define({
    mobile: { icon: 'mobile-alt', x: '360px', y: '680px' },
    tablet: { icon: 'tablet-alt', x: '768px', y: '1024px' },
    desktop: { icon: 'desktop', x: '1920px', y: '1080px' },
});

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
            sizes: Sizes,
        };
    }
}
