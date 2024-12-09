import { ApplicationSingletoneFacade } from './core/src/ApplicationServerFacade'
import { DataBaseDriver } from './db/app'
import { WebServerDriver } from './web-server/app'

export const webserverDriver = new WebServerDriver()
export const dataBaseDriver = new DataBaseDriver()
export const app = ApplicationSingletoneFacade.Instance()
