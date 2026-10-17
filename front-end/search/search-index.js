//util

import { compareValues, quickSortInPlace } from './sort.js';

function normalize(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim().toLocaleLowerCase();
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