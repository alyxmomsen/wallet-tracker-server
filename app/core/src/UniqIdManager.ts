import { IdRegistry } from './Registry'

export class UniqIdManager {
    protected registry: IdRegistry

    gen(): number {
        // this.registry.isExist()
        return 0
    }

    constructor() {
        this.registry = new IdRegistry()
    }
}
