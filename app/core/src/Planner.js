'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.RequirementPlanner = void 0
const Task_1 = require('./Task')
class RequirementPlanner {
    addTask(task) {
        this.tasks.push(task)
        return task
    }
    check() {
        const updatedTasks = []
        this.tasks = this.tasks.filter((task) => {
            if (true) {
                // task.apply(this.subject)
                const dateObj = task.getDateStart()
                dateObj.setDate(dateObj.getDate() + 1)
                updatedTasks.push(
                    new Task_1.RequirementTask(dateObj, task.getRequirement())
                )
                return false
            }
            return true
        })
        this.tasks = [...this.tasks, ...updatedTasks]
    }
    constructor(person) {
        this.tasks = []
        this.subject = person
    }
}
exports.RequirementPlanner = RequirementPlanner
