import * as sort from './sort.js'



let arr = [
    { rate: 1 },
    { rate: 4 },
    { rate: 2 },
    { rate: 7 },
    { rate: 4 },
    { rate: 3 }
];
let result=sort.bubble_descending_rate(arr)
console.log(...result)