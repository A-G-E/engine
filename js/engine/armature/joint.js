export default class Joint
{
    #name;
    #parent;
    #children = [];
    #transform;

    constructor(name, parent, transform)
    {
        this.#name = name;
        this.#parent = parent;
        this.#transform = transform;
    }

    get name()
    {
        return this.#name;
    }

    get transform()
    {
        return this.#transform;
    }

    get children()
    {
        return this.#children;
    }

    set children(children)
    {
        this.#children = children
    }
}