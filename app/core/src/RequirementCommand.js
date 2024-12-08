'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.DecrementMoneyRequirementCommand =
    exports.IncrementMoneyRequirementCommand = void 0
class RequirementCommand {
    getTransactionTypeCode() {
        return this.transactionTypeCode
    }
    checkIfExecuted() {
        return this.isExecuted
    }
    getExecutionDate() {
        return this.date
    }
    getDescription() {
        return this.description
    }
    getValue() {
        return this.value
    }
    constructor(value, title, description, date, transactionTypeCode) {
        this.value = value
        this.description = description
        this.date = date
        this.isExecuted = false
        this.title = title
        this.transactionTypeCode = transactionTypeCode
    }
}
class IncrementMoneyRequirementCommand extends RequirementCommand {
    execute(person) {
        if (this.isExecuted) {
            return false
        }
        const balanceBefore = person.getWalletBalance()
        person.incrementWallet(this.value)
        this.isExecuted = true
        return true
    }
    executeWithValue(value) {
        return value + this.value
    }
    constructor(value, title, description, date) {
        super(value, title, description, date, 0)
    }
}
exports.IncrementMoneyRequirementCommand = IncrementMoneyRequirementCommand
class DecrementMoneyRequirementCommand extends RequirementCommand {
    executeWithValue(value) {
        return value - this.value
    }
    getValue() {
        return this.value
    }
    getDescription() {
        return `pay ${this.value}`
    }
    execute(person) {
        if (this.isExecuted) {
            return false
        }
        const balanceBefore = person.getWalletBalance()
        person.decrementWallet(this.value)
        this.isExecuted = true
        return true
    }
    constructor(value, title, description, date) {
        super(value, title, description, date, 1)
    }
}
exports.DecrementMoneyRequirementCommand = DecrementMoneyRequirementCommand
