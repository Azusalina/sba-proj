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





// let data=[1,6,3,5,7,9,0,9,6,4,2];
// data=merge(data);
// console.log("sorted");
// console.log(...data);




// let a =Math.trunc(1000000*Math.random());
// console.log(a);