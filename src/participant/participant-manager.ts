import { toJSON, toBinary } from "../binary-utils";
import { MemQueue } from "../memqueue";
import { RoomsManager, Room } from "../rooms/room-manager";
import { Interceptor } from "../interceptor";


export interface Participant {
  id: string;
  conn: any;
  name?: string;
  online: boolean;
}

export class ParticipantsManager {
  interceptor = new Interceptor();
  participants: Participant[] = [];
  rooms: RoomsManager = new RoomsManager();
  queue: MemQueue = new MemQueue();

  add(client) {

    let clientId: string = '';

    client.on('init', (buff: Buffer) => {
      const obj: {
        id: string,
        name: string
      } = toJSON(buff);

      clientId = obj.id;

      const c = this.find(obj.id);
      if (!c) {
        this.participants.push({
          id: obj.id,
          conn: client,
          name: obj.name,
          online: true
        });
      } else {
        c.conn = client;
        c.name = obj.name;
        c.online = true;
      }
      client.emit('init:res');
      this.broadcast('update', {
        participants: this.serializeParticipants()
      });
    });
    client.on('getParticipants', () => {
      client.emit('getParticipants:res', toBinary(this.serializeParticipants()));
    });
    client.on('getRooms', () => {
      const rooms = this.rooms.getRoomsByParticipant(clientId).map((room: Room) => {
        return {
          participants: room.participants.map((participant) => {
            return {
              id: participant.id,
              name: participant.name
            }
          }),
          id: room.id,
          name: room.name
        };
      });
      client.emit('getRooms:res', toBinary(rooms));
    });
    client.on('message', (json: any) => {
      json = toJSON(json);
      const c = this.find(json.to);
      if (c) {
        if (c.online) {
          c.conn.emit('message', toBinary({
            from: json.from,
            body: json.body
          }));
          this.interceptor.write(json);
        } else {
          this.queue.push(json.to, json);
        }
      }
    });
    client.on('roommessage', (json: any) => {
      json = toJSON(json);
      const room: Room = this.rooms.getRoomById(json.to);
      console.log('roommessage', room.id);
      
      room.send(toBinary({
        from: json.from,
        to: json.to,
        body: json.body
      }));
      this.interceptor.write(json);
    });
    client.on('createroom', (json: any) => {
      json = toJSON(json);
      
      const participants: Participant[] = json.participants
      .concat(clientId)
      .map((id) => {
        return this.find(id);
      })
      .filter((participant: Participant) => !!participant)

      const room = this.rooms.create(json.name, participants);
      participants.forEach((participant) => {
        participant.conn.emit('update');
      });
      client.join(room.id);
    });

    client.on('archive', () => {
      const a = this.queue.popAll(clientId);
      client.emit('archive:res', toBinary(a));
    });

    client.on('disconnect', () => {
      
      const c = this.find(clientId);
      if (c) {
        c.online = false;
        
        this.broadcast('update', {
          participants: this.serializeParticipants()
        });
      }
    });
  }      

  find(id: string) {
    for (let i = 0; i < this.participants.length; i++) {
      if (this.participants[i].id === id) {
        return this.participants[i];
      }
    }
    return null;
  }

  broadcast(type, body, f ? : (p: Participant) => boolean) {
    f = typeof (f) === 'function' ? f : () => true;
    this.participants
      .filter(f)
      .forEach((p) => {
        p.conn.emit(type, toBinary(body));
      });
  }

  serializeParticipants() {   
    return this.participants
      .map((p) => {
        return {
          id: p.id,
          name: p.name,
          online: p.online
        };
      });
  }

}