//util file


export function bubble_ascending_price(data = []) {
    for (let i = 0; i < data.length - 1; i++) {
        let swapped = false;
        for (let j = 0; j < data.length - i - 1; j++) {
            const leftPrice=Number(data[j].plans[0].budget);
            const rightPrice=Number(data[j+1].plans[0].budget);
            if (leftPrice>rightPrice){
                [data[j], data[j + 1]] = [data[j + 1], data[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return data;
};
export function bubble_ascending_rate(data = []) {
    for (let i = 0; i < data.length - 1; i++) {
        let status = false;
        for (let j = 0; j < data.length - i - 1; j++) {
            if (data[j].rate < data[j + 1].rate) {
                [data[j], data[j + 1]] = [data[j + 1], data[j]];
                status = true;
            }
        }
        if (!status) break;
    }
    return data;
};
export function insertion_time(data = []) {
    const n = data.length;
    for (let i = 1; i < n; i++) {
        let key = data[i];
        let j = i - 1;
       while(j>=0&& new Date(data[j].plans[0].time).getTime()>new Date(key.plans[0].time).getTime()){    
      data[j + 1] = data[j];
            j -= 1;
        }
        data[j + 1] = key;
    }
    return data;
};
export function merge_name(data = []) {
    if (data.length <= 1) {
        return data;
    }

    const middle = Math.floor(data.length / 2);

    const left = merge_name(data.slice(0, middle));
    const right = merge_name(data.slice(middle));

    const merged = mergeHalves(
        left,
        right,
        (a, b) =>
            String(a.name ?? a.id).localeCompare(
                String(b.name ?? b.id),
                undefined,
                { sensitivity: 'base' }
            )
    );

    for (let i = 0; i < merged.length; i++) {
        data[i] = merged[i];
    }

    return data;
}
export function quick_v2_InPlace(data, start, end) {
    if (start >= end) return;

    const midIdx = Math.floor((start + end) / 2);
    const vfirst = Number(data[start].dataset.data);
    const vmid = Number(data[midIdx].dataset.data);
    const vlast = Number(data[end].dataset.data);

    const vpivot = vfirst + vmid + vlast - Math.max(vfirst, vmid, vlast) - Math.min(vfirst, vmid, vlast);

    let pivotIdx = start;
    if (vpivot === vmid) pivotIdx = midIdx;
    else if (vpivot === vlast) pivotIdx = end;

    [data[start], data[pivotIdx]] = [data[pivotIdx], data[start]];

    const pNum = Number(data[start].dataset.data);
    let i = start + 1;
    let j = end;
    while (i <= j) {
        while (i <= end && Number(data[i].dataset.data) < pNum) {
            i++;
        }
        while (j > start && Number(data[j].dataset.data) >= pNum) {
            j--;
        }
        if (i < j) {
            [data[i], data[j]] = [data[j], data[i]];
        }
    }
    [data[start], data[j]] = [data[j], data[start]];
    quick_v2_InPlace(data, start, j - 1);
    quick_v2_InPlace(data, j + 1, end);
}
//newly add!
export function selectionDuration(data = []) {
    for (let i = 0; i < data.length - 1; i++) {
        let shortest = i;

        for (let j = i + 1; j < data.length; j++) {
            if (Number(data[j].duration) <
                Number(data[shortest].duration)) {
                shortest = j;
            }
        }

        if (shortest !== i) {
            [data[i], data[shortest]] =
                [data[shortest], data[i]];
        }
    }

    return data;
}
function mergeHalves(left, right, compare) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
        if (compare(left[i], right[j]) <= 0) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }

    return result.concat(left.slice(i), right.slice(j));
}
export function compareValues(a, b) {
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b, undefined, { sensitivity: 'base' });
    }

    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
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

// let data = [1, 6, 3, 5, 7, 9, 0, 9, 6, 4, 2];
// data = quick(data);
// console.log("sorted");
// console.log(...data);




// let a =Math.trunc(1000000*Math.random());
// console.log(a);
