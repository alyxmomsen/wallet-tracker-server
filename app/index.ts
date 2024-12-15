import { ApplicationSingletoneFacade } from './core/src/ApplicationFacade'
import { AuthService, IAuthService } from './core/src/auth-service/AuthService'
import {
    PersonFactory,
    UserPersonFactory,
} from './core/src/factories/PersonFactory'
import { FirebaseConnector } from './db/app'

const firebaseConnector = new FirebaseConnector()
const personFactory = new UserPersonFactory()
export const authService: IAuthService = new AuthService(firebaseConnector)
export const myApplication = ApplicationSingletoneFacade.Instance(
    firebaseConnector,
    personFactory,
    authService
)
