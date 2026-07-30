// import * as sort from './sort.js'



// let arr = [
//     { rate: 1 },
//     { rate: 4 },
//     { rate: 2 },
//     { rate: 7 },
//     { rate: 4 },
//     { rate: 3 }
// ];
// let result=sort.bubble_descending_rate(arr)
// console.log(...result)


// function testFunc(searchInput, data) {
//     const a = searchInput.length;
//     const b = data.length;
//     const arr = Array.from({ length: a + 1 }, () => { Array(b + 1).fill(0) });
//     for (let i = 0; i <= a; i++) {
//         arr[i][0] = i;
//     }
//     for (let j = 0; i <= b; j++) {
//         arr[0][j] = j;
//     }
//     return Arr;

// }
// const x = 'camren'
// const y = 'carmen'
// console.log(testFunc(x, y))

// function levenshtein(searchInput, data) {
//     const a = searchInput.length;
//     const b = data.length;
//     const arr = [];
//     for (let i = 0; i <= a; i++) {
//         arr[i] = [];
//     }
//     for (let i = 0; i <= a; i++) {
//         arr[i][0] = i;
//     }
//     for (let j = 0; j <= b; j++) {
//         arr[0][j] = j;
//     }

//     for (let i = 1; i <= a; i++) {
//         for (let j = 1; j <= b; j++) {
//             if (searchInput[i - 1] === data[j - 1]) {
//                 arr[i][j] = arr[i - 1][j - 1];//inherite last result in previous diagonal block if no change
//             } else {
//                 arr[i][j] = Math.min(
//                     arr[i - 1][j] + 1,    // Del
//                     arr[i][j - 1] + 1,    // Insert
//                     arr[i - 1][j - 1] + 1 // Sub
//                 );
//             }
//         }

//     }
//     const result = arr[a][b];
//     return result;
// }

// const x = 'camren';
// const y = 'carmen';
// console.log(levenshtein(x, y));


// let data=[1,4,2,3,5];
// console.log(...sort.quick(data))

const a=new Date();
console.log(a)
console.log(a.getHours())
console.log(a.getMinutes())