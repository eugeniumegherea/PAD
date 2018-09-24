"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var binary_utils_1 = require("../binary-utils");
var memqueue_1 = require("../memqueue");
var ParticipantsManager = /** @class */ (function () {
    function ParticipantsManager() {
        this.participants = [];
        this.queue = new memqueue_1.MemQueue();
    }
    ParticipantsManager.prototype.add = function (client) {
        var _this = this;
        var clientId = '';
        client.on('init', function (buff) {
            var obj = binary_utils_1.toJSON(buff);
            clientId = obj.id;
            var c = _this.find(obj.id);
            if (!c) {
                _this.participants.push({
                    id: obj.id,
                    conn: client,
                    name: obj.name,
                    online: true
                });
            }
            else {
                c.conn = client;
                c.name = obj.name;
                c.online = true;
            }
            client.emit('init:res');
            _this.broadcast('update', {
                participants: _this.serializeParticipants()
            });
        });
        client.on('getParticipants', function () {
            client.emit('getParticipants:res', binary_utils_1.toBinary(_this.serializeParticipants()));
        });
        client.on('message', function (json) {
            json = binary_utils_1.toJSON(json);
            var c = _this.find(json.to);
            if (c) {
                if (c.online) {
                    c.conn.emit('message', binary_utils_1.toBinary({
                        from: json.from,
                        body: json.body
                    }));
                }
                else {
                    _this.queue.push(json.to, json);
                }
            }
        });
        client.on('archive', function () {
            var a = _this.queue.popAll(clientId);
            console.log(a);
            client.emit('archive:res', binary_utils_1.toBinary(a));
        });
        client.on('disconnect', function () {
            var c = _this.find(clientId);
            if (c) {
                c.online = false;
                _this.broadcast('update', {
                    participants: _this.serializeParticipants()
                });
            }
        });
    };
    ParticipantsManager.prototype.find = function (id) {
        for (var i = 0; i < this.participants.length; i++) {
            if (this.participants[i].id === id) {
                return this.participants[i];
            }
        }
        return null;
    };
    ParticipantsManager.prototype.broadcast = function (type, body, f) {
        f = typeof (f) === 'function' ? f : function () { return true; };
        this.participants
            .filter(f)
            .forEach(function (p) {
            p.conn.emit(type, binary_utils_1.toBinary(body));
        });
    };
    ParticipantsManager.prototype.serializeParticipants = function () {
        return this.participants
            .map(function (p) {
            return {
                id: p.id,
                name: p.name,
                online: p.online
            };
        });
    };
    return ParticipantsManager;
}());
exports.ParticipantsManager = ParticipantsManager;
