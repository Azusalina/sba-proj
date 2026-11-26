



### **This is an explicit list for all the figures used in the essay of ict sba project, 2027 DSE**
#### Author: Clifford, Wu Jia An

##### 1.1

```mermaid
flowchart LR
    subgraph BR["Browser(front-end)"]
        direction TB
        P1[Visitor pages:<br/>home, search, book, pay,<br/>order confirmation, settings]
        P2[Sign-in pages:<br/>auth, reset]
        P3[Admin pages:<br/>toolkit, seats-admin]
        LS[(localStorage:<br/>user name, chosen seats,<br/>order being shown)]
    end
    subgraph SV["Server (Node.js and Express)"]
        direction TB
        R1[serv-auth:<br/>sign up, verify, sign in, reset]
        R2[serv-main:<br/>operas, seat map, payment,<br/>refund, wallet, admin]
        R3[serv-utils:<br/>password hash, ids,<br/>ticket queue, emails]
        Q[queries.js:<br/>SQL statements]
    end
    DB[(PostgreSQL database)]
    MS[MailerSend<br/>email service]
    BR -- "fetch, JSON" --> SV
    R1 --> Q
    R2 --> Q
    Q --> DB
    R1 --> R3
    R2 --> R3
    R3 -- "verification, reset,<br/>order emails" --> MS
```

*Fig.1* system Architecture
Data stored in the database are fetched by back-end *Express* server but not directly by the front-end client-side browser.
- All queries were stored in `queries.js`;
- All emails were send by calling *Mailersend* api;
Note that an `exec` function in `child_process` is used in `serv.js` so when the server starts, the front-end page will show up in the user's default browser


##### 3.0

```mermaid
flowchart LR
    A([3.1 Enter<br/>home page])-->B[3.2 Search<br/>and Browse]
    B-->C[3.3 choose <br/>a performance and seats]
    C-->D{signed in?}
    D-->|No|E[3.4 signup,<br/>verify,signin]
    E--back to the seats-->C
    D--Yes-->F[3.5 Review and pay]
    F-->G([3.6 Order<br/>confirmation])
    G-->H([3.7 wallet,orders,<br/>refund,gift code])
    H-->A
    A-.dev link.->I[3.8 admin toolkit]
```
*Fig 2*   
user's journey. The arrow from 3.4 to 3.3 shows that after signing in , the user returns to the seat page with the chosen seats restored.


##### 3.3

```mermaid
flowchart LR
 I([Idle])--'user clicks'-->S[Selected]
 S--'user clicks again'-->I
 S--"payment succeeds"-->B[Booked]
 B-- 'order refunded'--> I
 I--"admin blocks"-->U[unavailable]
 U--'admin unblocks'-->I
```

*Fig.3* seat states.  
note that the admin cannot block a booked seat


##### 3.4

```mermaid
flowchart LR
    A([Press Confirm]) --> B{Signed in?}
    B -- Yes --> Z([Review and pay])
    B -- No --> C[Message, then<br/>sign-in page]
    C --> D{Has an account?}
    D -- No --> E[Sign up:<br/>check password rules]
    E --> F[Save account with<br/>salted hash, send email]
    F --> G[user opens the<br/>link in the email]
    G --> H[Account verified,<br/>wallet created]
    H --> I
    D -- Yes --> I[Sign in]
    I --> J{Verified and<br/>password correct?}
    J -- No --> K[/Show message/] --> I
    J -- Yes --> L[Remember user<br/>in localStorage]
    L --> M([Back to the seat page,<br/>seats restored])
```

*Fig 4. Authentication path.*




##### 3.5

```mermaid
flowchart LR
    A([Continue pressed]) --> B{Input valid?<br/>1-8 different seats,<br/>known ticket types}
    B -- No --> X1[/Reject 400/]
    B -- Yes --> C[Begin<br/>transaction]
    C --> D[Lock the chosen<br/>seat rows]
    D --> E{Seat already<br/>booked?}
    E -- Yes --> X2[/Roll back,<br/>409 seat_taken/]
    E -- No --> F{Seat made<br/>unavailable?}
    F -- Yes --> X3[/Roll back,<br/>409 seat_blocked/]
    F -- No --> G{Wheelchair ticket on<br/>ordinary seat?}
    G -- Yes --> X4[/Roll back, 400/]
    G -- No --> H[Calculate prices on<br/>the server: zone price<br/>x multiplier, total]
    H --> I{Balance at least<br/>the total?}
    I -- No --> X5[/Roll back,<br/>insufficientBalance/]
    I -- Yes --> J[Save order, reduce wallet,<br/>save wallet record]
    J --> K[Queue the seats;<br/>save one ticket<br/>per queued seat]
    K --> L[Commit]
    L --> M([Order number<br/>and tickets])
```
*Fig.5* Payment Flowchart  
every rejected branch ends before any money is taken.


```mermaid
graph LR
    A[response to the processing page] --> B[success]
    A --> C[conflict 409<br/>a seat was just taken]
    A --> D[insufficient wallet balance]
    A --> E[any other errors]

    B --> B1[store order number, total<br/>and tickets in localStorage]
    B1 --> B2[proceed to confirmation page 3.6]

    C --> C1[back to booking page<br/>without charge]

    D --> D1[cancelled order]
    D1 --> D2[back to home page]

    E --> E1[back to home page]
```
*Fig.6* response to the processing page



##### 3.7

```mermaid
flowchart LR
    A([Refund pressed]) --> B[Begin<br/>transaction]
    B --> C[Find the user's order<br/>and lock it]
    C --> D{Order found?}
    D -- No --> X1[/Roll back,<br/>not_found/]
    D -- Yes --> E{Status is<br/>COMPLETED?}
    E -- No --> X2[/Roll back,<br/>not_refundable/]
    E -- Yes --> F[Add the amount<br/>back to the wallet]
    F --> G[Mark order REFUNDED,<br/>set voided_at on tickets]
    G --> H[Save the<br/>refund record]
    H --> I[Commit]
    I --> J[Send refund email;<br/>failure does not undo the refund]
    J --> K([Show new balance])
```

*Fig 7*. Refund flowchart. After the refund the seats are idle again (Fig.3).




---
