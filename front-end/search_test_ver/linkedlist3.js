/*
==========================================================
                    linkedlist.js
==========================================================

Data Structure

Singly Linked List

Application

Recommended Operas

Used By

search.js

----------------------------------------------------------

Node

title
↓

next

----------------------------------------------------------

API

append(data)

prepend(data)

insertAfter(target,data)

remove(data)

find(data)

contains(data)

clear()

size()

toArray()

print()

==========================================================
*/

/* ==========================================================
                        Node
========================================================== */

class ListNode{

    constructor(data){

        this.data=data;

        this.next=null;

    }

}

/* ==========================================================
                Recommendation Linked List
========================================================== */

class RecommendationList{

    constructor(){

        this.head=null;

        this.length=0;

    }

    /* ======================================================
                        Append
    ====================================================== */

    append(data){

        const node=new ListNode(data);

        if(this.head===null){

            this.head=node;

            this.length++;

            return;

        }

        let current=this.head;

        while(current.next!==null){

            current=current.next;

        }

        current.next=node;

        this.length++;

    }

    /* ======================================================
                        Prepend
    ====================================================== */

    prepend(data){

        const node=new ListNode(data);

        node.next=this.head;

        this.head=node;

        this.length++;

    }

    /* ======================================================
                    Insert After
    ====================================================== */

    insertAfter(target,data){

        let current=this.head;

        while(current!==null){

            if(current.data===target){

                const node=new ListNode(data);

                node.next=current.next;

                current.next=node;

                this.length++;

                return true;

            }

            current=current.next;

        }

        return false;

    }

    /* ======================================================
                        Remove
    ====================================================== */

    remove(data){

        if(this.head===null){

            return false;

        }

        if(this.head.data===data){

            this.head=this.head.next;

            this.length--;

            return true;

        }

        let current=this.head;

        while(current.next!==null){

            if(current.next.data===data){

                current.next=current.next.next;

                this.length--;

                return true;

            }

            current=current.next;

        }

        return false;

    }

    /* ======================================================
                        Find
    ====================================================== */

    find(data){

        let current=this.head;

        while(current!==null){

            if(current.data===data){

                return current;

            }

            current=current.next;

        }

        return null;

    }

    /* ======================================================
                    Contains
    ====================================================== */

    contains(data){

        return this.find(data)!==null;

    }

    /* ======================================================
                        Size
    ====================================================== */

    size(){

        return this.length;

    }

    /* ======================================================
                        Empty
    ====================================================== */

    isEmpty(){

        return this.length===0;

    }

    /* ======================================================
                        Clear
    ====================================================== */

    clear(){

        this.head=null;

        this.length=0;

    }

    /* ======================================================
                        Array
    ====================================================== */

    toArray(){

        const result=[];

        let current=this.head;

        while(current!==null){

            result.push(current.data);

            current=current.next;

        }

        return result;

    }

    /* ======================================================
                        Print
    ====================================================== */

    print(){

        console.table(this.toArray());

    }

}

/*
==========================================================
                Local Storage Helper
==========================================================
*/

function saveRecommendation(list){

    if(!(list instanceof RecommendationList)){

        return;

    }

    localStorage.setItem(

        "recommendationList",

        JSON.stringify(

            list.toArray()

        )

    );

}

function loadRecommendation(){

    const list=new RecommendationList();

    const data=JSON.parse(

        localStorage.getItem(

            "recommendationList"

        ) || "[]"

    );

    data.forEach(item=>{

        list.append(item);

    });

    return list;

}

/*
==========================================================
                        End
==========================================================
*/