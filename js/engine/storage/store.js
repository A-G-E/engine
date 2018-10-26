'use strict';

export default class Store
{
    constructor(name, database, data)
    {
        // NOTE(Chris Kruining)
        // If the indexedDb doesn't get a
        // keyPath(translated to primary
        // index in this class) it is
        // impossible to insert rows into
        // that table
        if(data.indexes === undefined || data.indexes.primary === undefined)
        {
            throw new Error('No primary key given');
        }

        let prototype = this.__proto__;
        this.__proto__ = new Proxy({
            name: name,
            database: database,
            fields: data.fields,
            indexes: data.indexes
        }, {
            get: (container, property) => {
                if(prototype.hasOwnProperty(property))
                {
                    return prototype[property];
                }

                if(container.hasOwnProperty(property))
                {
                    return container[property];
                }

                return this.database.get(this.name, property);
            },
            set: (container, property, value) => {
                if(container.hasOwnProperty(property))
                {
                    container[property] = value;

                    return true;
                }

                // TODO(Chris Kruuining)
                // Start database transaction to
                // actually store the value

                // container.fields[property] = value;

                return true;
            },
        });
    }
}
