import { IPerson } from '../person/Person'

export interface IUsersPoolStorage {
    getUserById(userId: string): IPerson | null
    addUser(userId: string, user: IPerson): boolean
    checkByName(userName: string): boolean
}

export class UserPoolStoragee implements IUsersPoolStorage {
    private usersPool: Map<string, IPerson>

    checkByName(userName: string): boolean {
        for (const person of this.usersPool.values()) {
            if (person.getUserName() === userName) {
                return true
            }
        }

        return false
    }

    getUserById(userId: string): IPerson | null {
        this.usersPool.forEach((elem, i, map) => {})

        const user = this.usersPool.get(userId)

        if (user === undefined) {
            return null
        }

        return user
    }

    addUser(userId: string, user: IPerson): boolean {
        const fetchedUser = this.usersPool.get(userId)

        if (fetchedUser !== undefined) {
            return false
        }

        this.usersPool.set(userId, user)

        return true
    }

    constructor() {
        this.usersPool = new Map<string, IPerson>()
    }
}
