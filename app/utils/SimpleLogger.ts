export class SimpleLogger {
    createLogger() {
        return (
            logTitle: string,
            payload: (string | object) | null = null,
            force: boolean | undefined = undefined
        ) => {
            if (force === false) {
                // console.log('>>>>>>>> log forced as FALSE');
                return
            }

            if (this.state || force)
                console.log(`>>> ${this.title} :: ${logTitle}`)
            if (payload)
                console.log(`>>> ${this.title} :: ${logTitle} :: `, { payload })
        }
    }

    protected state: boolean
    protected title: string

    constructor(title: string, state: boolean = true) {
        this.state = state
        this.title = title
    }
}
