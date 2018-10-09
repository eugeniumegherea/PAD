import { Stream } from 'stream';
import { open, WriteStream, createWriteStream } from 'fs';
import { join } from 'path';

export class Interceptor {
    private file: WriteStream = createWriteStream(join(__dirname, '..', 'logs.log'));
    
    write(json) {
        const str = JSON.stringify(json);
        this.file.write(str + '\n');
    }
}
