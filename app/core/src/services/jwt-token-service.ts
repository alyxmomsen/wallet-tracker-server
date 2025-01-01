import jwt from 'jsonwebtoken'
import { SimpleLogger } from '../../../utils/SimpleLogger'

export interface IJWTokenService {
    sign(value: string | Buffer | object, expires: string): string
    decode(token: string): any
    verify(token: string): { value: string; iat: number; exp: number } | null
}

export class JWTokenService implements IJWTokenService {
    private secret: string
    private expiresIn: string
    private loggerService: SimpleLogger

    sign(value: string | Buffer | object, expiresIn: string) {
        const token = jwt.sign({ value }, this.secret, {
            expiresIn,
        })

        return token
    }

    decode(token: string): any {
        // try {
        //     const result = jwt.verify(token, this.secret);
        //     return result;
        // }
        // catch(error) {
        //     console.log('>>> token decode :: ERROR ::', { error });
        //     return null;
        // }
    }

    verify(token: string): {
        value: string
        iat: number
        exp: number
    } | null {
        const log = this.loggerService.createLogger()

        log('trying verify...')
        log('internal params: ' + token)

        try {
            const result = jwt.verify(token, this.secret) as {
                value: string
                iat: number
                exp: number
            }

            log('VERIFIED')
            log('Token is VALID')

            return result
        } catch (error) {
            log('FAIL. token INVALID. maibe expired?')

            return null
        }
    }

    constructor() {
        this.secret = 'foobar'
        this.expiresIn = '120s'
        this.loggerService = new SimpleLogger('JWT service', false)
    }
}
