import { toJSON, toBinary } from "../binary-utils";
import { MemQueue } from "../memqueue";


export interface Participant {
  id: string;
  conn: any;
  name?: string;
  online: boolean;
}

export class ParticipantsManager {
  participants: Participant[] = [];
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
    client.on('message', (json: any) => {
      json = toJSON(json);
      const c = this.find(json.to);
      if (c) {
        if (c.online) {
          c.conn.emit('message', toBinary({
            from: json.from,
            body: json.body
          }));
        } else {
          this.queue.push(json.to, json);
        }
      }
    });

    client.on('archive', () => {
      const a = this.queue.popAll(clientId);
      console.log(a);
      
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