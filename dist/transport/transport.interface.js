"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultTransport = /** @class */ (function () {
    function DefaultTransport() {
        this.conn = this.init();
    }
    DefaultTransport.prototype.init = function () { };
    DefaultTransport.prototype.onConnection = function (client) { };
    return DefaultTransport;
}());
exports.DefaultTransport = DefaultTransport;
