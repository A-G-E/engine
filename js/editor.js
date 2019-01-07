import * as Fyn from 'http://fyn-software.cpb/component/fyn.js';
import Docks from 'http://fyn-software.cpb/suite/js/common/layout/docks.js';

export default class Editor extends Fyn.Component
{
    static get properties()
    {
        return {
            layout: {
                mode: Docks.vertical,
                sizes: [ 120, null, 300 ],
                children: [
                    [ 1 ],
                    [ 2, 3, 4 ],
                    {
                        mode: Docks.horizontal,
                        sizes: [ null, 300 ],
                        children: [
                            [ 5, 6 ],
                            [ 7 ],
                        ],
                    }
                ],
            },
        };
    }
}
