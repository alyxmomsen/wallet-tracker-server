'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.app = exports.dataBaseDriver = exports.webserverDriver = void 0
const ApplicationServerFacade_1 = require('./app/core/ApplicationServerFacade')
const app_1 = require('./app/db/app')
const app_2 = require('./app/web-server/app')
exports.webserverDriver = new app_2.WebServerDriver()
exports.dataBaseDriver = new app_1.DataBaseDriver()
exports.app = new ApplicationServerFacade_1.ApplicationSingletoneFacade()
