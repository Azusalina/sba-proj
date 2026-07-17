/*
==========================================================
                        queue.js
==========================================================

Data Structure

Queue (FIFO)

Application

Recent Searches

Maximum Size

10

Used By

search.js

----------------------------------------------------------

API

enqueue(data)

dequeue()

peek()

clear()

size()

isEmpty()

toArray()

==========================================================
*/

class SearchQueue{

    constructor(maxSize=10){

        this.items=[];

        this.maxSize=maxSize;

    }

    /* ======================================================
                        Enqueue
    ====================================================== */

    enqueue(item){

        if(

            item===undefined ||

            item===null

        ){

            return;

        }

        item=String(item).trim();

        if(item===""){

            return;

        }

        /* ---------- Remove Duplicate ---------- */

        const index=this.items.indexOf(item);

        if(index!==-1){

            this.items.splice(index,1);

        }

        /* ---------- Push ---------- */

        this.items.push(item);

        /* ---------- Limit ---------- */

        while(

            this.items.length>

            this.maxSize

        ){

            this.dequeue();

        }

    }

    /* ======================================================
                        Dequeue
    ====================================================== */

    dequeue(){

        if(this.isEmpty()){

            return null;

        }

        return this.items.shift();

    }

    /* ======================================================
                        Peek
    ====================================================== */

    peek(){

        if(this.isEmpty()){

            return null;

        }

        return this.items[0];

    }

    /* ======================================================
                        Rear
    ====================================================== */

    rear(){

        if(this.isEmpty()){

            return null;

        }

        return this.items[

            this.items.length-1

        ];

    }

    /* ======================================================
                        Clear
    ====================================================== */

    clear(){

        this.items=[];

    }

    /* ======================================================
                        Size
    ====================================================== */

    size(){

        return this.items.length;

    }

    /* ======================================================
                        Empty
    ====================================================== */

    isEmpty(){

        return this.items.length===0;

    }

    /* ======================================================
                        Contains
    ====================================================== */

    contains(item){

        return this.items.includes(item);

    }

    /* ======================================================
                        Array
    ====================================================== */

    toArray(){

        return [...this.items];

    }

    /* ======================================================
                    Print (Debug)
    ====================================================== */

    print(){

        console.table(this.items);

    }

}

/*
==========================================================
                    Local Storage Helper
==========================================================
*/

function saveQueue(queue){

    if(!(queue instanceof SearchQueue)){

        return;

    }

    localStorage.setItem(

        "recentSearch",

        JSON.stringify(

            queue.toArray()

        )

    );

}

function loadQueue(maxSize=10){

    const queue=new SearchQueue(maxSize);

    const data=

    JSON.parse(

        localStorage.getItem(

            "recentSearch"

        ) || "[]"

    );

    data.forEach(item=>{

        queue.enqueue(item);

    });

    return queue;

}

/*
==========================================================
                        End
==========================================================
*/