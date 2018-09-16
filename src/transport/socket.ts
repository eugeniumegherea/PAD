var io = require('socket.io')();
import { DefaultTransport } from "./transport.interface";
import { ParticipantsManager } from "../participant/participant-manager";

export class SocketTransport extends DefaultTransport {
    participants = new ParticipantsManager();

    init() {
        io.on('connection', (client) => this.onConnection(client));
        console.log('app listening on 3000');
        io.listen(3000);
    }

    onConnection(client) {     
        this.participants.add(client);
    }

    findSocket(id: string) {
        return this.participants.find(id)
    }

}