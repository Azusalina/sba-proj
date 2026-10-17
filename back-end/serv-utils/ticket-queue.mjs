//util



export class LinkedListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

export class LinkedList {
    constructor() {
        this.nodes = [];
        this.freeSlots = [];
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    append(value) {
        const index = this.freeSlots.length > 0
            ? this.freeSlots.pop()
            : this.nodes.length;

        this.nodes[index] = new LinkedListNode(value);

        if (this.tail === null) {
            this.head = index;
        } else {
            this.nodes[this.tail].next = index;
        }

        this.tail = index;
        this.length++;

        return this.length;
    }

    removeFirst() {
        if (this.head === null) {
            return undefined;
        }

        const index = this.head;
        const node = this.nodes[index];

        this.head = node.next;
        this.length--;

        if (this.head === null) {
            this.tail = null;
        }

        this.nodes[index] = null;
        this.freeSlots.push(index);

        return node.value;
    }

    isEmpty() {
        return this.length === 0;
    }
}



export class Queue {
    constructor() {
        this.list = new LinkedList();
    }
    enqueue(value) {
        return this.list.append(value);
    }
    dequeue() {
        return this.list.removeFirst();
    }
    isEmpty() {
        return this.list.isEmpty();
    }
    get length() {
        return this.list.length;
    }
}
