/*
==========================================================
                        stack.js
==========================================================

Data Structure

Stack (LIFO)

Application

Recently Viewed Operas

Used By

search.js

----------------------------------------------------------

API

push(data)

pop()

peek()

clear()

size()

isEmpty()

toArray()

==========================================================
*/

class ViewStack{

    constructor(maxSize=20){

        this.items=[];

        this.maxSize=maxSize;

    }

    /* ======================================================
                            Push
    ====================================================== */

    push(item){

        if(

            item===undefined ||

            item===null

        ){

            return;

        }

        /*
        Remove duplicate record
        */

        if(item.id!==undefined){

            this.items=this.items.filter(

                opera=>opera.id!==item.id

            );
        }

        this.items.push(item);

        /*
        Keep newest maxSize records
        */

        while(

            this.items.length>

            this.maxSize

        ){

            this.items.shift();

        }

    }

    /* ======================================================
                            Pop
    ====================================================== */

    pop(){

        if(this.isEmpty()){

            return null;

        }

        return this.items.pop();

    }

    /* ======================================================
                            Peek
    ====================================================== */

    peek(){

        if(this.isEmpty()){

            return null;

        }

        return this.items[

            this.items.length-1

        ];

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
                            Clear
    ====================================================== */

    clear(){

        this.items=[];

    }

    /* ======================================================
                        Contains
    ====================================================== */

    contains(id){

        return this.items.some(

            item=>item.id===id

        );

    }

    /* ======================================================
                        Array
    ====================================================== */

    toArray(){

        return [...this.items];

    }

    /* ======================================================
                        Print
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

function saveViewStack(stack){

    if(!(stack instanceof ViewStack)){

        return;

    }

    localStorage.setItem(

        "recentViewed",

        JSON.stringify(

            stack.toArray()

        )

    );

}

function loadViewStack(maxSize=20){

    const stack=new ViewStack(maxSize);

    const data=JSON.parse(

        localStorage.getItem(

            "recentViewed"

        ) || "[]"

    );

    data.forEach(item=>{

        stack.push(item);

    });

    return stack;

}

/*
==========================================================
                        End
==========================================================
*/