export default class Armature
{
    #bones;

    constructor(bones)
    {
        this.#bones = bones;
    }

    get bones()
    {
        return this.#bones;
    }
}