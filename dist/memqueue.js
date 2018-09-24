"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MemQueue = /** @class */ (function () {
    function MemQueue() {
        this.queue = {};
    }
    MemQueue.prototype.push = function (to, json) {
        this.queue[to] = this.queue[to] || [];
        this.queue[to].push(json);
    };
    MemQueue.prototype.pop = function (to) {
        return this.queue[to].pop();
    };
    MemQueue.prototype.popAll = function (to) {
        var ret = [].concat(this.queue[to] || []);
        this.queue[to] = [];
        return ret.reverse();
    };
    MemQueue.prototype.hasUnread = function (to) {
        return (this.queue[to] || []).length > 0;
    };
    return MemQueue;
}());
exports.MemQueue = MemQueue;
