import { ApplicationSingletoneFacade } from './app/core/src/ApplicationServerFacade'
import { DataBaseDriver } from './app/db/app'
import { WebServerDriver } from './app/web-server/app'

export const webserverDriver = new WebServerDriver()
export const dataBaseDriver = new DataBaseDriver()
export const app = new ApplicationSingletoneFacade()
