'use strict';

import Store from './store.js';

export default class Database
{
    constructor(name)
    {
        let prototype = this.__proto__;
        this.__proto__ = new Proxy({
            driver: window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB,
            name: name,
            connection: null,
            context: null,
            _stores: {}
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

                return container._stores[property];
            },
            set: (container, property, value) => {

                if(container.hasOwnProperty(property))
                {
                    container[property] = value;

                    return true;
                }

                if(!container._stores.hasOwnProperty(property))
                {
                    container._stores[property] = new Store(property, this, value);
                }
                else
                {
                    return this.put(property, ...value);
                }

                return true;
            }
        });
    }

    stores(stores)
    {
        for(let [name, data] of Object.entries(stores))
        {
            this[name] = data;
        }

        return this;
    }

    open(version = undefined)
    {
        return new Promise((resolve, revoke) => {
            this.connection = this.driver.open(this.name, version);

            this.connection.onerror = (e) => {
                revoke(e);
            };

            this.connection.onupgradeneeded = () => {
                this.context = this.connection.result;

                for(let store of Object.values(this._stores))
                {
                    this.context.createObjectStore(store.name, { keyPath: store.indexes.primary.path || '' });
                }
            };

            this.connection.onsuccess = () => {
                this.context = this.connection.result;

                return resolve(this);
            };
        });
    }

    transaction(store)
    {
        return new Promise((resolve, revoke) => {
            let transaction = this.context.transaction(store, 'readwrite');

            resolve(transaction.objectStore(store));

            transaction.oncomplete = () => {
                this.context.close();
            };
        })
    }

    get(name, query)
    {
        return new Promise((resolve, revoke) => {
            this.transaction(name).then(table => {
                let key = table.get(query);

                key.onsuccess = () => {
                    key.result
                        ? resolve(key.result)
                        : revoke({
                            message: 'row not found',
                            key,
                            query,
                        });
                };

                key.onerror = (e) => {
                    revoke(e);
                };
            });
        });
    }

    static get(name)
    {
        let parts = name.split('.');
        return (new Database(parts.shift())).open().then(db => db.get(...parts))
    }

    put(name, ...rows)
    {
        return this.transaction(name).then(table => {
            for(let row of rows)
            {
                table.put(row);
            }
        });
    }

    static put(name, ...rows)
    {
        let parts = name.split('.');
        return (new Database(parts[0])).open().then(db => db.put(parts[1], ...rows)).then(() => rows);
    }

    static init(name, stores, version = undefined)
    {
        return (new Database(name)).stores(stores).open(version);
    }
}
