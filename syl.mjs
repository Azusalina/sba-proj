function compareValues(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b, undefined, { sensitivity: 'base' });
    }

    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

function normalize(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim().toLocaleLowerCase();
}

// Linked list node
export class LinkedListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

export class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    append(value) {
        const node = new LinkedListNode(value);

        if (this.tail === null) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail.next = node;
            this.tail = node;
        }

        this.length++;
        return this.length;
    }

    removeFirst() {
        if (this.head === null) {
            return undefined;
        }

        const node = this.head;
        const value = node.value;

        this.head = node.next;
        node.next = null;
        this.length--;

        if (this.head === null) {
            this.tail = null;
        }

        return value;
    }

    isEmpty() {
        return this.length === 0;
    }
}

export class Stack {
    constructor() {
        this.items = [];
        this.top = -1;
    }

    push(value) {
        this.top++;
        this.items[this.top] = value;
        return this.top + 1;
    }

    pop() {
        if (this.top < 0) {
            return undefined;
        }

        const value = this.items[this.top];
        this.items[this.top] = undefined;
        this.top--;
        return value;
    }

    peek() {
        if (this.top < 0) {
            return undefined;
        }

        return this.items[this.top];
    }

    isEmpty() {
        return this.top < 0;
    }

    get length() {
        return this.top + 1;
    }
}

export class Queue {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    enqueue(value) {
        const node = new LinkedListNode(value);

        if (this.tail === null) {
            this.head = node;
            this.tail = node;
        } else {
            this.tail.next = node;
            this.tail = node;
        }

        this.length++;
        return this.length;
    }

    dequeue() {
        if (this.head === null) {
            return undefined;
        }

        const node = this.head;
        const value = node.value;

        this.head = node.next;
        node.next = null;
        this.length--;

        if (this.head === null) {
            this.tail = null;
        }

        return value;
    }

    isEmpty() {
        return this.length === 0;
    }

    get length() {
        return this.length;
    }
}

export function linearSearch(items, predicate, startIndex) {
    if (startIndex === undefined) {
        startIndex = 0;
    }

    let i = startIndex;

    if (i < 0) {
        i = 0;
    }

    const n = items.length;

    while (i < n) {
        if (predicate(items[i], i)) {
            return i;
        }

        i++;
    }

    return -1;
}

export function binarySearch(items, target, keyOf, compare) {
    if (keyOf === undefined) {
        keyOf = function (item) {
            return item;
        };
    }

    if (compare === undefined) {
        compare = compareValues;
    }

    let left = 0;
    let right = items.length - 1;

    while (left <= right) {
        const middle = left + ((right - left) >> 1);
        const order = compare(keyOf(items[middle]), target);

        if (order === 0) {
            return middle;
        }

        if (order < 0) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }

    return -1;
}

export class OperaSearchIndex {
    constructor(operas, keyOf) {
        if (operas === undefined) {
            operas = [];
        }

        if (keyOf === undefined) {
            keyOf = function (opera) {
                return opera.id;
            };
        }

        this.keyOf = keyOf;
        this.items = [];
        this.sorted = [];
        this.replace(operas);
    }

    replace(operas) {
        this.items.length = 0;
        this.sorted.length = 0;

        let i = 0;
        const n = operas.length;

        while (i < n) {
            this.items[i] = operas[i];
            this.sorted[i] = operas[i];
            i++;
        }

        const compareForSort = (a, b) => {
            return compareValues(
                normalize(this.keyOf(a)),
                normalize(this.keyOf(b))
            );
        };

        quickSortInPlace(this.sorted, compareForSort, 0, this.sorted.length - 1);

        return this;
    }

    findExact(query) {
        const target = normalize(query);

        if (target === '') {
            return null;
        }

        const self = this;

        const index = binarySearch(
            this.sorted,
            target,
            function (opera) {
                return normalize(self.keyOf(opera));
            }
        );

        if (index === -1) {
            return null;
        }

        return this.sorted[index];
    }

    findPartial(query) {
        const target = normalize(query);

        if (target === '') {
            return [];
        }

        const matches = [];
        let startIndex = 0;
        const self = this;

        while (startIndex < this.items.length) {
            const index = linearSearch(
                this.items,
                function (opera) {
                    return normalize(self.keyOf(opera)).includes(target);
                },
                startIndex
            );

            if (index === -1) {
                break;
            }

            matches[matches.length] = this.items[index];
            startIndex = index + 1;
        }

        return matches;
    }
}

function medianOfThreeIndex(items, first, middle, last, compare) {
    const a = items[first];
    const b = items[middle];
    const c = items[last];

    if (compare(a, b) <= 0) {
        if (compare(b, c) <= 0) {
            return middle;
        }

        if (compare(a, c) <= 0) {
            return last;
        }

        return first;
    }

    if (compare(a, c) <= 0) {
        return first;
    }

    if (compare(b, c) <= 0) {
        return last;
    }

    return middle;
}

export function quickSortInPlace(items, compare, start, end) {
    if (compare === undefined) {
        compare = compareValues;
    }

    if (start === undefined) {
        start = 0;
    }

    if (end === undefined) {
        end = items.length - 1;
    }

    if (start >= end) {
        return items;
    }

    const stack = new Stack();
    stack.push([start, end]);

    while (!stack.isEmpty()) {
        const range = stack.pop();
        const low = range[0];
        const high = range[1];

        if (low >= high) {
            continue;
        }

        const middle = low + ((high - low) >> 1);
        const pivotIndex = medianOfThreeIndex(
            items,
            low,
            middle,
            high,
            compare
        );

        const pivot = items[pivotIndex];

        let less = low;
        let current = low;
        let greater = high;

        while (current <= greater) {
            const order = compare(items[current], pivot);

            if (order < 0) {
                const tmp = items[less];
                items[less] = items[current];
                items[current] = tmp;

                less++;
                current++;
            } else if (order > 0) {
                const tmp = items[current];
                items[current] = items[greater];
                items[greater] = tmp;

                greater--;
            } else {
                current++;
            }
        }

        const leftSize = less - low;
        const rightSize = high - greater;

        if (leftSize > rightSize) {
            if (leftSize > 1) {
                stack.push([low, less - 1]);
            }

            if (rightSize > 1) {
                stack.push([greater + 1, high]);
            }
        } else {
            if (rightSize > 1) {
                stack.push([greater + 1, high]);
            }

            if (leftSize > 1) {
                stack.push([low, less - 1]);
            }
        }
    }

    return items;
}
