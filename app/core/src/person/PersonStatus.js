'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.SlepStatusFactory =
    exports.AwakenStatusFactory =
    exports.PersonStatusFactory =
    exports.AwakeningStatus =
    exports.GoingSleepStatus =
        void 0
class PersonStatusSystem {
    getDifference() {
        return Date.now() - this.date
    }
    constructor(title, id) {
        this.title = title
        this.id = id
        this.date = Date.now()
    }
}
class GoingSleepStatus extends PersonStatusSystem {
    getDate() {
        return this.date
    }
    getDescription() {
        return `You fell asleep ${Math.floor(this.getDifference() / 1000)} seconds ago`
    }
    constructor() {
        super('going to sleep', 0)
    }
}
exports.GoingSleepStatus = GoingSleepStatus
class AwakeningStatus extends PersonStatusSystem {
    getDate() {
        return this.date
    }
    getDescription() {
        return `You woke up ${Math.floor(this.getDifference() / 1000)} seconds ago`
    }
    constructor() {
        super('awakening', 1)
        this.date = Date.now()
    }
}
exports.AwakeningStatus = AwakeningStatus
class PersonStatusFactory {
    addLinkFactory(linkFactory) {
        this.links.push(linkFactory)
    }
    getLinks() {
        return this.links
    }
    getTitle() {
        return this.title
    }
    constructor(title) {
        this.title = title
        this.links = []
    }
}
exports.PersonStatusFactory = PersonStatusFactory
class AwakenStatusFactory extends PersonStatusFactory {
    instance() {
        return new AwakeningStatus()
    }
    constructor() {
        super('wake up')
    }
}
exports.AwakenStatusFactory = AwakenStatusFactory
class SlepStatusFactory extends PersonStatusFactory {
    instance() {
        return new GoingSleepStatus()
    }
    constructor() {
        super('sleep')
    }
}
exports.SlepStatusFactory = SlepStatusFactory
