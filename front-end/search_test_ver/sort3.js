/*
==========================================================
                        sort.js
==========================================================

Purpose

Provide all sorting algorithms used by Search Module.

Supported

1. Merge Sort
2. Bubble Sort
3. Selection Sort
4. Insertion Sort

Usage

mergeSort(array,"price")

bubbleSort(array,"rating")

selectionSort(array,"title")

insertionSort(array,"date")

==========================================================
*/

/* ==========================================================
                    Merge Sort
========================================================== */

function mergeSort(array,key){

    if(array.length<=1){

        return array;

    }

    const middle=Math.floor(array.length/2);

    const left=mergeSort(

        array.slice(0,middle),

        key

    );

    const right=mergeSort(

        array.slice(middle),

        key

    );

    return merge(left,right,key);

}

function merge(left,right,key){

    const result=[];

    let i=0;

    let j=0;

    while(

        i<left.length &&

        j<right.length

    ){

        if(compare(

            left[i][key],

            right[j][key]

        )<=0){

            result.push(left[i]);

            i++;

        }

        else{

            result.push(right[j]);

            j++;

        }

    }

    while(i<left.length){

        result.push(left[i]);

        i++;

    }

    while(j<right.length){

        result.push(right[j]);

        j++;

    }

    return result;

}

/* ==========================================================
                    Bubble Sort
========================================================== */

function bubbleSort(array,key){

    const data=[...array];

    const n=data.length;

    for(

        let i=0;

        i<n-1;

        i++

    ){

        let swapped=false;

        for(

            let j=0;

            j<n-i-1;

            j++

        ){

            if(

                compare(

                    data[j][key],

                    data[j+1][key]

                )>0

            ){

                swap(

                    data,

                    j,

                    j+1

                );

                swapped=true;

            }

        }

        if(!swapped){

            break;

        }

    }

    return data;

}

/* ==========================================================
                    Selection Sort
========================================================== */

function selectionSort(array,key){

    const data=[...array];

    const n=data.length;

    for(

        let i=0;

        i<n-1;

        i++

    ){

        let min=i;

        for(

            let j=i+1;

            j<n;

            j++

        ){

            if(

                compare(

                    data[j][key],

                    data[min][key]

                )<0

            ){

                min=j;

            }

        }

        if(min!==i){

            swap(

                data,

                i,

                min

            );

        }

    }

    return data;

}

/* ==========================================================
                    Insertion Sort
========================================================== */

function insertionSort(array,key){

    const data=[...array];

    for(

        let i=1;

        i<data.length;

        i++

    ){

        const current=data[i];

        let j=i-1;

        while(

            j>=0 &&

            compare(

                data[j][key],

                current[key]

            )>0

        ){

            data[j+1]=data[j];

            j--;

        }

        data[j+1]=current;

    }

    return data;

}

/* ==========================================================
                    Compare
========================================================== */

function compare(a,b){

    /* ---------- Number ---------- */

    if(

        typeof a==="number" &&

        typeof b==="number"

    ){

        return a-b;

    }

    /* ---------- Date ---------- */

    if(

        !isNaN(Date.parse(a)) &&

        !isNaN(Date.parse(b))

    ){

        return(

            new Date(a)-

            new Date(b)

        );

    }

    /* ---------- String ---------- */

    return String(a)

        .localeCompare(

            String(b)

        );

}

/* ==========================================================
                        Swap
========================================================== */

function swap(array,i,j){

    const temp=array[i];

    array[i]=array[j];

    array[j]=temp;

}

/* ==========================================================
                    Reverse Helper
========================================================== */

function reverseSort(array){

    return [...array].reverse();

}

/* ==========================================================
                    Validate
========================================================== */

function isSortable(array,key){

    if(

        !Array.isArray(array)

    ){

        return false;

    }

    if(

        array.length===0

    ){

        return false;

    }

    return key in array[0];

}

/* ==========================================================
                    End
========================================================== */