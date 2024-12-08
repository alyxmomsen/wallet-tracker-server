import { IdRegistry } from './Registry'

export class UniqIdManager {
    protected registry: IdRegistry

    gen(): number {
        // this.registry.isExist()
        return 0
    }

    // lastId(): number {

    //     )

    //     return this.registr
    // }

    constructor() {
        this.registry = new IdRegistry()
    }
}
