//util file




export function selection(data = []) {
    const n = data.length;
    for (let i = 0; i < n; i++) {
        let min_idx = i;
        for (let j = i + 1; j < n; j++) {
            if (data[j] < data[min_idx]) {
                min_idx = j;
            }
        }
        [data[i], data[min_idx]] = [data[min_idx], data[i]];
    }
    return data;
}

export function bubble_ascending_price(data = []) {
    for (let i = 0; i < data.length - 1; i++) {
        let status = false;
        for (let j = 0; j < data.length - i - 1; j++) {
            if (data[j].price > data[j + 1].price) {
                [data[j], data[j + 1]] = [data[j + 1], data[j]];
                status = true;
            }
        }
        if (!status) break;
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

export function insertion(data = []) {
    const n = data.length;
    for (let i = 1; i < n; i++) {
        let key = data[i];
        let j = i - 1;
        while (j >= 0 && data[j] > key) {
            data[j + 1] = data[j];
            j -= 1;
        }
        data[j + 1] = key;
    }
    return data;
};
export function insertion_time(data = []) {
    const n = data.length;
    for (let i = 1; i < n; i++) {
        let key = data[i];
        let j = i - 1;
        while (j >= 0 && data[j].time > key.time) {
            data[j + 1] = data[j];
            j -= 1;
        }
        data[j + 1] = key;
    }
    return data;
};

export function merge(data = []) {
    let width = 1;
    const n = data.length;
    while (width < n) {
        for (let i = 0; i < n; i += 2 * width) {
            let start = i;
            let mid = Math.min(i + width, n);
            let end = Math.min(i + 2 * width, n);
            let left = data.slice(start, mid);
            let right = data.slice(mid, end);
            let p1 = 0;
            let p2 = 0;
            let k = start;
            while (p1 < left.length && p2 < right.length) {
                if (left[p1] <= right[p2]) {
                    data[k] = left[p1];
                    k += 1;
                    p1 += 1;

                } else {
                    data[k] = right[p2];
                    k += 1;
                    p2 += 1;
                }
            }


            while (p1 < left.length) {
                data[k] = left[p1];
                k += 1;
                p1 += 1;
            }
            while (p2 < right.length) {
                data[k] = right[p2];
                k += 1;
                p2 += 1;
            }
        }
        width *= 2;
    }
    return data;
};
export function merge_name(data = []) {
    let width = 1;
    const n = data.length;
    while (width < n) {
        for (let i = 0; i < n; i += 2 * width) {
            let start = i;
            let mid = Math.min(i + width, n);
            let end = Math.min(i + 2 * width, n);
            let left = data.slice(start, mid);
            let right = data.slice(mid, end);
            let p1 = 0;
            let p2 = 0;
            let k = start;
            while (p1 < left.length && p2 < right.length) {
                if (left[p1].id.localeCompare(right[p2].id, undefined, { sensitivity: 'base' }) <= 0) {
                    data[k] = left[p1];
                    k += 1;
                    p1 += 1;
                } else {
                    data[k] = right[p2];
                    k += 1;
                    p2 += 1;
                }
            }

            while (p1 < left.length) {
                data[k] = left[p1];
                k += 1;
                p1 += 1;
            }
            while (p2 < right.length) {
                data[k] = right[p2];
                k += 1;
                p2 += 1;
            }
        }
        width *= 2;
    }
    return data;
};


export function quick(data = []) {
    if (data.length <= 1) return data;
    const len = data.length;
    const first = data[0];
    const mid = data[Math.floor((len - 1) / 2)];
    const last = data[len - 1];
    const pivot = median(first, mid, last);
    const pivotIdx = data.indexOf(pivot);
    data.splice(pivotIdx, 1);
    let left = [];
    let right = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i] <= pivot) {
            left.push(data[i]);
        } else {
            right.push(data[i]);
        }
    }
    return [...quick(left), pivot, ...quick(right)];
}

export function quick_v1(data = []) {
    if (data.length <= 1) return data;
    const len = data.length;
    const first = data[0];
    const mid = data[Math.floor((len - 1) / 2)];
    const last = data[len - 1];
    const vfirst = Number(first.dataset.data);
    const vmid = Number(mid.dataset.data);
    const vlast = Number(last.dataset.data);
    const vpivot = vfirst + vmid + vlast - Math.max(vfirst, vmid, vlast) - Math.min(vfirst, vmid, vlast);
    let pivotIdx = 0;
    if (vpivot === vmid) {
        pivotIdx = Math.floor((len-1)/2);
    } else if (vpivot === vlast) {
        pivotIdx = len-1
    }
    const pivot = data[pivotIdx];
    data.splice(pivotIdx, 1);
    const left = [];
    const right = [];
    for (let i = 0; i < data.length; i++) {
        if (Number(data[i].dataset.data) > Number(pivot.dataset.data)) {
            left.push(data[i]);
        } else {
            right.push(data[i]);
        }
    }
    return [...quick_v1(left), pivot, ...quick_v1(right)]
}

export function quick_v2(data = []) {
    quick_v2_InPlace(data, 0, data.length - 1);
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






// let data = [1, 6, 3, 5, 7, 9, 0, 9, 6, 4, 2];
// data = quick(data);
// console.log("sorted");
// console.log(...data);




// let a =Math.trunc(1000000*Math.random());
// console.log(a);