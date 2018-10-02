"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var binary_utils_1 = require("../binary-utils");
var uuid = function () {
    return Math.floor(Math.random() * 100000000) + '';
};
var Room = /** @class */ (function () {
    function Room(name, participants) {
        var _this = this;
        this.name = '';
        this.participants = [];
        this.participants = participants;
        this.name = name;
        this.id = uuid();
        this.participants.forEach(function (participant) {
            participant.conn.emit('inviteRoom', binary_utils_1.toBinary({
                name: _this.name,
                id: _this.id,
                participants: _this.participants.map(function (p) { return p.id; })
            }));
        });
    }
    Room.prototype.send = function (json) {
        this.participants.forEach(function (participant) {
            participant.conn.emit('roommessage', json);
        });
    };
    return Room;
}());
exports.Room = Room;
var RoomsManager = /** @class */ (function () {
    function RoomsManager() {
        this.rooms = {};
    }
    RoomsManager.prototype.create = function (name, participants) {
        var room = new Room(name, participants);
        this.rooms[room.id] = room;
        return room;
    };
    RoomsManager.prototype.getRoomsByParticipant = function (id) {
        var _this = this;
        return Object.keys(this.rooms)
            .map(function (key) { return _this.rooms[key]; })
            .filter(function (room) {
            var hasParticipant = false;
            for (var i = 0; i < room.participants.length; i++) {
                if (room.participants[i].id === id) {
                    hasParticipant = true;
                    break;
                }
            }
            return hasParticipant;
        });
    };
    RoomsManager.prototype.getRoomById = function (id) {
        return this.rooms[id];
    };
    return RoomsManager;
}());
exports.RoomsManager = RoomsManager;
