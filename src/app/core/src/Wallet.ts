export interface IWallet {
    add(value: number): number
    remove(value: number): number
    getBalance(): number
    updateBalance(value: number): number
}

export class Wallet implements IWallet {
    protected balance: number

    updateBalance(value: number): number {
        this.balance = value

        return this.balance
    }

    add(value: number): number {
        const result = this.balance + value

        this.balance = result

        return this.balance
    }

    getBalance(): number {
        return this.balance
    }

    remove(value: number): number {
        const result = this.balance - value
        this.balance = result
        return this.balance
    }

    constructor(initValue: number = 0) {
        this.balance = initValue
    }
}
