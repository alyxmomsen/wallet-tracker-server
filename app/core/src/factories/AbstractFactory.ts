export abstract class Factory<T> {
    abstract create(name: string, walletInitValue: number): T
}
