
export interface MessageTransport {
    conn: any;

    init(): any;
    onConnection(client: any): any;

}

export class DefaultTransport implements MessageTransport {
    conn: any;

    constructor() {
        this.conn = this.init();
    }

    init() {}
    onConnection(client) {}
}
