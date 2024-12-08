'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.RequirementsObserver = exports.Observer = void 0
class Observer {
    addCallback(cb) {
        this.callbacks.push(cb)
    }
    update() {
        this.callbacks.forEach((cb) => {
            cb()
            // console.log('callback');
        })
    }
    constructor() {
        this.callbacks = []
    }
}
exports.Observer = Observer
class RequirementsObserver extends Observer {}
exports.RequirementsObserver = RequirementsObserver
