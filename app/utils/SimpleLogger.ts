export class SimpleLogger {
    // switchOn() {
    //     this.state = true;
    // }

    // switchOff() {
    //     this.state = false;
    // }

    createLogger() {
        return (value: string, force: boolean | undefined = undefined) => {
            if (force === false) {
                // console.log('>>>>>>>> log forced as FALSE');
                return
            }

            if (this.state || force)
                console.log(`>>> ${this.title} :: ${value}`)
        }
    }

    protected state: boolean
    protected title: string

    constructor(title: string, state: boolean = true) {
        this.state = state
        this.title = title
    }
}
