export interface IObserver {
    update(): void
}

export class Observer implements IObserver {
    callbacks: (() => void)[]

    addCallback(cb: () => void) {
        this.callbacks.push(cb)
    }

    update() {
        this.callbacks.forEach((cb) => {
            cb()
        })
    }

    constructor() {
        this.callbacks = []
    }
}

export class RequirementsObserver extends Observer {}
