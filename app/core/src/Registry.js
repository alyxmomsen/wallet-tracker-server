'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.IdRegistry = exports.Registry = void 0
class Registry {
    constructor() {
        this.registry = []
    }
}
exports.Registry = Registry
class IdRegistry extends Registry {
    isExist(value) {
        return this.registry.includes(value)
    }
}
exports.IdRegistry = IdRegistry
