'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.OrdinaryPerson = exports.Person = void 0
exports.getDateUtil = getDateUtil
const Wallet_1 = require('../Wallet')
const PersonStatus_1 = require('./PersonStatus')
class Person {
    getStatusDescription() {
        return this.status.getDescription()
    }
    setStatus(status) {
        this.status = status
        return true
    }
    getWalletTrackForActualRequirements() {
        let balance = this.wallet.getBalance()
        return this.getActualRequirementCommands().map((requirement) => {
            const value = requirement.getValue()
            const valueBefore = balance
            const valueAfter = requirement.executeWithValue(balance)
            balance = valueAfter
            return {
                value,
                valueBefore,
                valueAfter,
                executionDate: Number.parseInt(
                    requirement
                        .getExecutionDate()
                        .getTime() /* / 1000 */
                        .toString()
                ),
                transactionTypeCode: requirement.getTransactionTypeCode(),
            }
        })
    }
    getName() {
        return this.name
    }
    incrementWallet(value) {
        this.wallet.add(value)
    }
    decrementWallet(value) {
        this.wallet.remove(value)
    }
    addRequirementCommand(requirementCommand) {
        this.requirementCommands.push(requirementCommand)
        return requirementCommand
    }
    getWalletBalance() {
        return this.wallet.getBalance()
    }
    update() {}
    getActualRequirementCommands() {
        return this.requirementCommands.filter((requirementCommand) => {
            if (requirementCommand.checkIfExecuted()) {
                return false
            }
            const currDateObj = getDateUtil(new Date())
            const requirementDateObj = getDateUtil(
                requirementCommand.getExecutionDate()
            )
            if (
                requirementDateObj.year >= currDateObj.year &&
                requirementDateObj.month >= currDateObj.month &&
                requirementDateObj.date >= currDateObj.date
            ) {
                return true
            }
            return false
        })
    }
    getAllReauirementCommands() {
        return this.requirementCommands
    }
    getExecutedRequirementCommands() {
        return this.requirementCommands.filter((elem) => {
            return !elem.checkIfExecuted()
        })
    }
    constructor(wallet, name) {
        this.wallet = wallet
        this.name = name
        this.requirementCommands = []
        this.averageSpending = 700
        this.status = new PersonStatus_1.GoingSleepStatus()
    }
}
exports.Person = Person
class OrdinaryPerson extends Person {
    constructor(name, walletInitValue) {
        super(new Wallet_1.Wallet(walletInitValue), name)
    }
}
exports.OrdinaryPerson = OrdinaryPerson
function getDateUtil(dateObj) {
    const date = dateObj.getDate()
    const month = dateObj.getMonth()
    const year = dateObj.getFullYear()
    return {
        date,
        month,
        year,
    }
}
