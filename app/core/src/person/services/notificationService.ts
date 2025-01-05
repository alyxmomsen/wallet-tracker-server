
export interface INotifyItem {
    cb: () => any
    reason: string;
}



export interface INotificationService {
    set(item: INotifyItem): any;
    round(reason:string): any;
}

export class NotifycationService implements INotificationService {

    private notifies: INotifyItem[];

    set(item: INotifyItem) {
        this.notifies.push(item);
    }

    round(reason:string) {
        this.notifies.forEach(elem => {
            if (elem.reason === reason) {
                elem.cb();
            }
        });

    }

    constructor() {
        this.notifies = [];
    }

}