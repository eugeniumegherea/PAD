"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var Interceptor = /** @class */ (function () {
    function Interceptor() {
        this.file = fs_1.createWriteStream(path_1.join(__dirname, '..', 'logs.log'));
    }
    Interceptor.prototype.write = function (json) {
        var str = JSON.stringify(json);
        this.file.write(str + '\n');
    };
    return Interceptor;
}());
exports.Interceptor = Interceptor;
