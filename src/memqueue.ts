export class MemQueue {
    private queue = {};

    push(to: string, json: any) {
        this.queue[to] = this.queue[to] || [];
        this.queue[to].push(json);
    }

    pop(to: string) {
        return this.queue[to].pop();
    }

    popAll(to: string) {
        const ret = [].concat(this.queue[to] || []);
        this.queue[to] = [];
        return ret.reverse();
    }

    hasUnread(to: string) {
        return (this.queue[to] || []).length > 0;
    }

}