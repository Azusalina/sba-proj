
### 3.0

```mermaid
flowchart LR
    A([3.1 Enter<br/>home page])-->B[3.2 Search<br/>and Browse]
    B-->C[3.3 choose <br/>a performance and seats]
    C-->D{signed in?}
    D-->NoE[3.4 signup,<br/>verify,signin]
    E--back to the seats-->C
    D--Yes-->F[3.5 Review and pay]
    F-->G([3.6 Order<br/>confirmation])
    G-->H([3.7 wallet,orders,<br/>refund,gift code])
    H-->A
    A-.dev link.->I[3.8 admin toolkit]
```
*Fig 2*   
user's journey. The arrow from 3.4 to 3.3 shows that after signing in , the user returns to the seat page with the chosen seats restored.


### 3.3

```mermaid
flowchart LR
 I([Idle])--'user clicks'-->S[Selected]
 S--'user clicks again'-->I
 I--"payment succeeds"-->B[Booked]
 B-- 'order refunded'--> I
 I--"admin blocks"-->U[unavailable]
 U--'admin unblocks'-->I
```

*Fig.3* seat states.  
note that the admin cannot block a booked seat


### 3.5

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
