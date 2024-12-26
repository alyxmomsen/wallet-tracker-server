import jwt from 'jsonwebtoken'
import { SimpleLogger } from '../../../utils/SimpleLogger'

export interface IJWTokenService {
    sign(value: string | Buffer | object): string
    decode(token: string): any
    verify(token: string): { value: string; iat: number; exp: number } | null
}

export class JWTokenService implements IJWTokenService {
    private secret: string
    private expiresIn: string
    private loggerService: SimpleLogger

    sign(value: string | Buffer | object) {
        const token = jwt.sign({ value }, this.secret, {
            expiresIn: this.expiresIn,
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
        log('token', { token })
        log('trying verify...')

        try {
            const result = jwt.verify(token, this.secret) as {
                value: string
                iat: number
                exp: number
            }

            log('verifyed', result)

            return result
        } catch (error) {
            console.log({ e: error })

            return null
        }
    }

    constructor() {
        this.secret = 'foobar'
        this.expiresIn = '120s'
        this.loggerService = new SimpleLogger('JWT service')
    }
}
