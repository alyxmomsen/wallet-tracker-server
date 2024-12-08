'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.ApplicationSingletoneFacade = void 0
class ApplicationSingletoneFacade {
    static Instance() {
        if (ApplicationSingletoneFacade.instance === null) {
            ApplicationSingletoneFacade.instance =
                new ApplicationSingletoneFacade()
        }
        console.log({ instance: ApplicationSingletoneFacade.instance })
        return ApplicationSingletoneFacade.instance
    }
    addRequirementSchedule(task) {}
    addPerson(person) {
        this.persons.push(person)
        return 0
    }
    getPersons() {
        return this.persons
    }
    update() {}
    /* private  */ constructor() {
        this.requirements = []
        this.persons = []
    }
}
exports.ApplicationSingletoneFacade = ApplicationSingletoneFacade
ApplicationSingletoneFacade.instance = null
