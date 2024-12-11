import { ApplicationSingletoneFacade } from './core/src/ApplicationFacade'
import {
    PersonFactory,
    UserPersonFactory,
} from './core/src/factories/PersonFactory'
import { DataBaseConnector } from './db/app'
import { WebServerDriver } from './web-server/app'

export const webserverDriver = new WebServerDriver()
export const dataBaseConnector = new DataBaseConnector()
const personFactory = new UserPersonFactory()
export const myApplication = ApplicationSingletoneFacade.Instance(
    dataBaseConnector,
    personFactory
)
