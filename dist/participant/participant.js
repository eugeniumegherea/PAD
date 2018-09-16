"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require('uuid/v4');
var SocketParticipant = /** @class */ (function () {
    function SocketParticipant(conn) {
        this.id = uuid();
        this.conn = conn;
    }
    return SocketParticipant;
}());
exports.SocketParticipant = SocketParticipant;
