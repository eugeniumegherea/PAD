"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var binary_utils_1 = require("../binary-utils");
var ParticipantsManager = /** @class */ (function () {
    function ParticipantsManager() {
        this.participants = [];
    }
    ParticipantsManager.prototype.add = function (client) {
        var _this = this;
        client.on('init', function (buff) {
            var obj = binary_utils_1.toJSON(buff);
            var c = _this.find(obj.id);
            if (!c) {
                _this.participants.push({
                    id: obj.id,
                    conn: client,
                    name: obj.name
                });
            }
            else {
                c.conn = client;
                c.name = obj.name;
            }
            client.emit('init:res');
            _this.broadcast('update', {
                participants: _this.serializeParticipants()
            }, function (p) {
                return p.conn.id !== client.id;
            });
        });
        client.on('getParticipants', function () {
            client.emit('getParticipants:res', binary_utils_1.toBinary(_this.serializeParticipants()));
        });
        client.on('message', function (json) {
            json = binary_utils_1.toJSON(json);
            var c = _this.find(json.to);
            if (c) {
                c.conn.emit('message', binary_utils_1.toBinary({
                    from: json.from,
                    body: json.body
                }));
            }
        });
        client.on('disconnect', function () {
            for (var i = 0; i < _this.participants.length; i++) {
                if (_this.participants[i].conn.id === client.id) {
                    _this.participants.splice(i, 1);
                    _this.broadcast('update', {
                        participants: _this.serializeParticipants()
                    });
                    break;
                }
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
                name: p.name
            };
        });
    };
    return ParticipantsManager;
}());
exports.ParticipantsManager = ParticipantsManager;
