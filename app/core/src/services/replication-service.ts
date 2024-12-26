import { IDataBaseConnector } from '../../../db/app'
import { IPerson } from '../person/Person'

export interface IReplicationService {
    // addIntoQueue(subj:IPerson):Promise<any>
    // execute(dataBaseConnector:IDataBaseConnector): any;
}

export class UserReplicationService implements IReplicationService {
    private queue: { subj: IPerson; cb: () => void }[]

    execute(dataBaseConnector: IDataBaseConnector) {
        const item = this.queue.pop()

        if (item === undefined) {
            return null
        }

        // item.cb()

        dataBaseConnector
    }

    async addIntoQueue(subj: IPerson, dataBaseConnector: IDataBaseConnector) {
        return new Promise((res, rej) => {
            this.queue.push({ cb: () => res(''), subj })
        })
    }

    constructor() {
        this.queue = []
    }
}
