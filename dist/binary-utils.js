"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toBinary(data) {
    return Buffer.from(JSON.stringify(data));
}
exports.toBinary = toBinary;
function toJSON(buffer) {
    var arr = Object.keys(buffer).map(function (key) {
        return buffer[key];
    });
    var uint8 = new Uint8Array(arr.length);
    for (var i_1 = 0; i_1 < arr.length; i_1++) {
        uint8[i_1] = arr[i_1];
    }
    var str = '';
    for (var i = 0; i < uint8.byteLength; i++) {
        str += String.fromCharCode(uint8[i]);
    }
    var json = JSON.parse(Buffer.from(str, 'base64').toString('utf8'));
    return json;
}
exports.toJSON = toJSON;
