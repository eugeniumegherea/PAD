"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var io = require('socket.io')();
var transport_interface_1 = require("./transport.interface");
var participant_manager_1 = require("../participant/participant-manager");
var SocketTransport = /** @class */ (function (_super) {
    __extends(SocketTransport, _super);
    function SocketTransport() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.participants = new participant_manager_1.ParticipantsManager();
        return _this;
    }
    SocketTransport.prototype.init = function () {
        var _this = this;
        io.on('connection', function (client) { return _this.onConnection(client); });
        console.log('app listening on 3000');
        io.listen(3000);
    };
    SocketTransport.prototype.onConnection = function (client) {
        this.participants.add(client);
    };
    SocketTransport.prototype.findSocket = function (id) {
        return this.participants.find(id);
    };
    return SocketTransport;
}(transport_interface_1.DefaultTransport));
exports.SocketTransport = SocketTransport;
