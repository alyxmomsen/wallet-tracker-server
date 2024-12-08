export interface IRegistry<T> {}

export abstract class Registry<T> implements IRegistry<T> {
    protected registry: T[]

    abstract isExist(value: T): boolean

    constructor() {
        this.registry = []
    }
}

export class IdRegistry extends Registry<number> {
    isExist(value: number): boolean {
        return this.registry.includes(value)
    }
}
