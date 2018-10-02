import { Participant } from "../participant/participant-manager";
import { toJSON, toBinary } from "../binary-utils";

var uuid = () => {
    return Math.floor(Math.random() * 100000000) + '';
}


export class Room {
    id: string;
    name: string = '';
    participants: Participant[] = [];

    constructor(name: string, participants: Participant[]) {
        this.participants = participants;
        this.name = name;
        
        this.id = uuid();

        this.participants.forEach((participant) => {
            participant.conn.emit('inviteRoom', toBinary({
                name: this.name,
                id: this.id,
                participants: this.participants.map(p => p.id)
            }));
        });
    }

    send(json: any): void {
        this.participants.forEach((participant) => {
            participant.conn.emit('roommessage', json);
        });
    }
}

export class RoomsManager {
    private rooms = {};

    create(name: string, participants: Participant[]) {
        const room = new Room(name, participants);
        this.rooms[room.id] = room;
        return room;
    }

    getRoomsByParticipant(id: string) {
        return Object.keys(this.rooms)
        .map((key) => this.rooms[key])
        .filter((room: Room) => {
            let hasParticipant = false;
            for (let i = 0; i < room.participants.length; i++) {
                if (room.participants[i].id === id) {
                    hasParticipant = true;
                    break;
                }
            }
            return hasParticipant;
        });
    }

    getRoomById(id: string): Room {
        return this.rooms[id];
    }
}