import * as Fyn from 'http://fyn-software.cpb/component/fyn.js';
import Docks from 'http://fyn-software.cpb/suite/js/common/layout/docks.js';

export default class Editor extends Fyn.Component
{
    static get properties()
    {
        return {
            layout: {
                mode: Docks.horizontal,
                sizes: [ null, 150 ],
                children: [
                    {
                        mode: Docks.vertical,
                        sizes: [ null, 300 ],
                        children: [
                            [ 2, 3, 4 ],
                            [ 5, 6 ],
                        ],
                    },
                    [ 1, 7 ],
                ],
            },
        };
    }
}
