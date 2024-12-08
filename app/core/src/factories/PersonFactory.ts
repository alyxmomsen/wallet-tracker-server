import { IPerson, OrdinaryPerson } from '../person/Person'
import { Factory } from './AbstractFactory'

export abstract class PersonFactory extends Factory<IPerson> {
    abstract create(name: string, walletInitValue: number): IPerson

    constructor() {
        super()
    }
}

export class PlayerPersonFactory extends PersonFactory {
    create(name: string, walletInitValue: number): IPerson {
        return new OrdinaryPerson(name, walletInitValue)
    }
}
