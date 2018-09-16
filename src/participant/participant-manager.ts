import { toJSON, toBinary } from "../binary-utils";


export interface Participant {
  id: string;
  conn: any;
  name? : string;
}

export class ParticipantsManager {
  participants: Participant[] = [];

  add(client) {

    client.on('init', (buff: Buffer) => {
      const obj: {
        id: string,
        name: string
      } = toJSON(buff);

      const c = this.find(obj.id);
      if (!c) {
        this.participants.push({
          id: obj.id,
          conn: client,
          name: obj.name
        });
      } else {
        c.conn = client;
        c.name = obj.name;
      }
      client.emit('init:res');
      this.broadcast('update', {
        participants: this.serializeParticipants()
      }, (p) => {
        return p.conn.id !== client.id;
      });
    });
    client.on('getParticipants', () => {
      client.emit('getParticipants:res', toBinary(this.serializeParticipants()));
    });
    client.on('message', (json: any) => {
      json = toJSON(json);
      const c = this.find(json.to);
      if (c) {
        c.conn.emit('message', toBinary({
          from: json.from,
          body: json.body
        }));
      }
    });

    client.on('disconnect', () => {
      for (let i = 0; i < this.participants.length; i++) {
        if (this.participants[i].conn.id === client.id) {
          this.participants.splice(i, 1);
          this.broadcast('update', {
            participants: this.serializeParticipants()
          });
          break;
        }
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
          name: p.name
        };
      });
  }

}