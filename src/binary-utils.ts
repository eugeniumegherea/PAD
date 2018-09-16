export function toBinary (data: any) {
    return Buffer.from(JSON.stringify(data));
}
export function toJSON(buffer: any) {
    const arr = Object.keys(buffer).map((key) => {
       return buffer[key]; 
    });
    const uint8 = new Uint8Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        uint8[i] = arr[i];
    }

    let str = '';
    for (var i = 0; i < uint8.byteLength; i++) {
        str += String.fromCharCode(uint8[i])
    }
    const json = JSON.parse(Buffer.from(str, 'base64').toString('utf8'));
    
    return json;
}