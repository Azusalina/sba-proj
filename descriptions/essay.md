# presentation essay 

### *author:Clifford,Wu Jia An*

## *date: 19th,October,2026, Monday*

## 0.Intro
this sba-project is a **full-stack opera ticket booking system**:
- user sign up/in,
- use redeem code to increase their left balance of their account
- search for operas they want to book
- buy and receive a notification email
- allow to refund


back-end is `Javascript` *(specifically node.js)* come together with a sql database

front-end is vanilla `html` ,`css` and `js` 


algo flowcharts are visualized by using `mermaid`.


---


## 1.main flow of the project

```mermaid
flowchart TD
    A['index'] -->|type query| B['search' - fuzzy search&filters]
    A --> C['auth' - sign in / up]
    C --> D[email ver.link /auth/token]
    D -->|verified| A
    C --> R['reset' - forgot password]
    R --> RT['resetTrue' - new password]
    B -->|pick opera + showtime| E['book' - seat class + quantities]
    E --> F['pay' - review]
    F --> G['pay-mediator' - payment transaction]
    G -->|insufficientBalance| A
    G -->|success| H['OrderConfirm' - tickets + email]
    A --> I['settings' - profile, wallet, orders]
    I -->|redeem code| I
    I -->|refund order| A
```

---

## 2.backend engine architcture& core structure

### 2.1 modular architecture

overall project folder structure reference(tool dev lcoally)

![](./Graph_Assets/sba-proj-stuct.png)


#### 2.1.1 frontend:

- for front-end, each page have its own dedicated `.js` file

- with search page specially append an extra series of `.js` files containing and in order to address data structures and sort algorihtms

#### 2.1.2 backend:

backend files were deconstructed into diffrent modules according to their features, namely:

|module | feature | algo |
| :---  | :---    | :--- |
|  `serv.config.js` |    config files, like api keys and sql pool connection | env var config |
| `serv-utils.js` | sub functions(util.func) | salted hash,fetch pricePlan, mail templates |
| `serv-auth.js`  | auth-related works | signin/up, send verification/reset email |
| `serv-main.js` | main workflow price/payment/refund/giftcode | payment,perssimistic lock, ledger double-entry |
| `serv.js` | mounts all routes | start the server |

```mermaid
flowchart TD
    B[browser page] -->|HTTP fetch JSON| S[Express entry]
    S --> AU["/auth/* /reset/*"]
    S --> MN["/updateOperaData /operaName /PaymentOrder /refundOrder /redeem ..."]
    AU --> UT[hash, tokens, mail]
    MN --> UT
    AU --> DB[(Postgre pool)]
    MN --> DB
    UT --> DB
```


### 2.2 database

ref table below:

 ![ERD](./Graph_Assets/ERD_Finalized_Version.jpg)



### 2.3 data structures

data structures below  are implemented in search, booking and ticket-generation modules. 
| Structure | Concrete form | Where |
| :---      | :---          | :--- |
| 2-D array | Levenshtein DP matrix |  `levenshtein()` |
| Array / list | opera list `Final`, sort | frontend operaList display |
| Hash map | `operaMap` grouping rows by `opera_id` |  `/updateOperaData` |
| Object / record | `details` object passed between pages | `pay.js` |
| JSON serialisation | `localStorage.setItem('details', JSON.stringify(details))` | `book.js` |
| Stack | explicit array-backed stack storing quicksort ranges | `front-end/search/sort.js` |
| Queue | FIFO ticket generation during payment | `back-end/serv-utils/ticket-queue.mjs` |
| Linked list | array-backed nodes connected by integer indices, used by Queue | `back-end/serv-utils/ticket-queue.mjs` |
| Relational tables | Postgre tables  | `user.sql` |

`localStorage`  is used to transport values or variables such as content in search bar between different pages.
 - write with `setItem` 
 - read with `getItem`
 - remove with `removeItem` (`main.js` logout).

key list:
 - `search_content`
 - `selected`
 - `selected_price_id` 
 - `selected_time` 
 - `details` 
 - `user` 
 - `isLoggedIn` 
 - `orderId` 
 - `tickets`. 

---

 ### 3 auth part

 #### 3.1 salted hash encryption

it should be pointed out that passwords are not stored hardcodely in the database;
hash encrypted result(`serv-utils.js:13-15` , `crypto.scrypt` ) 

is mixed with generated salt(`crypto.randomBytes(16)`) 

to form a salted hash password, therfore two users with the same password produce different digests (defeating rainbow-table attacks). On login, the stored salt is fetched and the same digest is recomputed and compared.

```mermaid
flowchart LR
    subgraph L[sign up]
        direction TD
        a1["signup, input submitted"] --> s1{"username repetitive?"}
        s1 -->|T| s2{"password pass validation?"}
        s1 -->|F| er1["rejected"]
        s2 -->|T| a2["password is converted to fix hash string"]
        s2 -->|F| er1
        a2 --> a3["unique random salt is generated"]
        a3 --> a4["hash and salt combined together"]
        a4 -->s3{vericated?}
        s3--yes--> a5["both salt and salted hash is stored in the database"]
        s3--no--> er3["wait for verification"]

    end

    subgraph K[sign in]
        direction TD
        b1["signin"] --> k0{"user exists / salt found?"}
        k0 -->|no| e1["account does not exist"]
        k0 -->|yes| b2["hash generated from pwd input"]
        b2 --> b3["combine with salt fetched from db"]
        b3 --> k2{"matches stored salted hash?"}
        k2 -->|true| b4["success login"]
        k2 -->|false| e2["incorrect password"]
    end
    L ~~~ K
```
 ### 3.2 password validation

refer to the five rules[wiki](https://en.wikipedia.org/wiki/Password_policy)

```mermaid
flowchart TD
    A[Start] --> B{pwd empty?}
    B -- yes --> E1[return invalid - cannot be empty]
    B -- no --> C1{contains A-Z?}
    C1 -- no --> R1[append err 1]
    C1 -- yes --> C2
    R1 --> C2{contains a-z?}
    C2 -- no --> R2[append err 2]
    C2 -- yes --> C3
    R2 --> C3{contains special char?}
    C3 -- no --> R3[append err 3]
    C3 -- yes --> C4
    R3 --> C4{contains digit?}
    C4 -- no --> R4[append err 4]
    C4 -- yes --> C5
    R4 --> C5{length >= 8?}
    C5 -- no --> R5[append err 5]
    C5 -- yes --> OK
    R5 --> OK[no errors?]
    OK -- yes --> Y[valid - submit signup]
    OK -- no --> N[invalid - show all errors]
```

### 3.3 verification email and password reset

both shares:
*  a **cryptographically random single-use token with an expiry timestamp**,
 *  stored in its own table and checked with a guarded transaction:

| Property | Email verification | Password reset |
| :--- | :--- | :--- |
| Token source | `crypto.randomUUID()` minus hyphens (128-bit) | same |
| Table | `email_verification` | `pwd_reset` |
| Expiry | `NOW() + INTERVAL '1 day'` | `NOW() + INTERVAL '15 minutes'` |
| Single-use | `used BOOLEAN DEFAULT FALSE` | same |
| Race protection | check `used = FALSE` | `SELECT … FOR UPDATE` + `used = FALSE` |
| Side effect | `verified = TRUE`, wallet row created (`ON CONFLICT DO NOTHING`) | new salt + new digest stored |


```mermaid
    flowchart TD
        A[POST /reset - user enters email] --> B{email exists in user_infor?}
        B -- no --> Z[return account not found]
        B -- yes --> C[token = randomUUID, INSERT pwd_reset, expire 15 min]
        C --> D[email link /reset/token]
        D --> E[GET /reset/token - redirect to resetTrue.html?token=...]
        E --> F[POST /reset/updatepwd]
        F --> G[BEGIN]
        G --> H["SELECT email FROM pwd_reset WHERE token matches, expire_time valid, used = FALSE, FOR UPDATE"]
        H --> I{row found?}
        I -- no --> J[ROLLBACK - invalid or expired token]
        I -- yes --> K[newSalt = 16 random bytes, newDigest = HASH newPwd, newSalt]
        K --> L[UPDATE user_infor SET pwd, salt]
        L --> M[mark token used = TRUE]
        M --> N[COMMIT - password updated]
```

---

## 4 search and sorting algorithms


### 4.1 Fuzzy search: Levenshtein edit distance (dynamic programming)

**Requirement**: users should be able to find an opera even with typos *(e.g.“carnen” must find “Carmen”).*

`search.js:61-89` is the classic **Levenshtein distance** computed by **dynamic programming** over an `(m+1) × (n+1)` integer matrix.
The allowed edits are insertion, deletion and substitution, each costing 1.

```mermaid
flowchart TD
    A[Input: query a, candidate b] --> B[create matrix D, m+1 rows n+1 cols]
    B --> C["D[i][0] = i ; D[0][j] = j"]
    C --> D{i from 1 to m}
    D --> E{j from 1 to n}
    E --> F{"a[i-1] = b[j-1] ?"}
    F -- yes --> G["D[i][j] = D[i-1][j-1]"]
    F -- no --> H["D[i][j] = 1 + min D[i-1][j], D[i][j-1], D[i-1][j-1]"]
    G --> I{more j?}
    H --> I
    I -- yes --> E
    I -- no --> J{more i?}
    J -- yes --> D
    J -- no --> K["return D[m][n]"]
```

Complexity: **O(m·n) time and O(m·n) space**

**Worked example** — query `carnen` against candidate `carmen` (one substitution ⇒ distance 1):

| D | ∅ | c | a | r | m | e | n |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **∅** | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
| **c** | 1 | 0 | 1 | 2 | 3 | 4 | 5 |
| **a** | 2 | 1 | 0 | 1 | 2 | 3 | 4 |
| **r** | 3 | 2 | 1 | 0 | 1 | 2 | 3 |
| **n** | 4 | 3 | 2 | 1 | 1 | 2 | 2 |
| **e** | 5 | 4 | 3 | 2 | 2 | 1 | 2 |
| **n** | 6 | 5 | 4 | 3 | 3 | 2 | ***1*** |

Both the query and the candidate opera name are trimmed and converted
to lowercase before the edit distance is calculated. Spaces are retained;
the fuzzy comparison does not use the hyphenated opera slug.


- well, despite from search the target with a typo we also wish user can find the one they want by keywords or slices inside the word,

- for exmaple, users should be able to find la-traviata by the keyword `la-`

- therefore:


### 4.2 Keyword detection and relevance ranking (exact-match-first)

`AccordingToSearchBar()` assigns a score of −2 to an exact name match and −1 to partial name matches. Other candidates receive their Levenshtein distance as the score. Quicksort then orders the results by ascending score,
with the original catalogue position used to break ties.

`OperaSearchIndex` maintains a separate array sorted by normalised opera
name. `findExact()` applies binary search to this array, while
`findPartial()` uses linear search to collect names containing the query.

The binary-search phase takes **O(log n)** comparisons. Collecting partial
matches scans the catalogue in **O(n)** item visits, excluding the cost of
string comparisons. The complete search also performs fuzzy scoring
and relevance sorting, so its overall complexity is not **O(log n)**.

This search ranks the full catalogue rather than removing non-matching entries.

```mermaid
flowchart TD
    A[Submit query] --> B[Trim and lowercase query]
    B --> C{Query empty?}
    C -- Yes --> D[Return catalogue copy in original order]
    C -- No --> E[Binary search for an exact name match]
    E --> F[Linear search for partial name matches]
    F --> G[Score each opera]
    G --> H[Exact result: -2; partial match: -1; otherwise edit distance]
    H --> I[Quicksort by score, then original position]
    I --> J[Reset to page 1 and render]
    D --> J
```

---

- we implemented several sorting algorithms included in the  `ict curriculum` via search page(`search.html`):

- for easier management and building, these sort sub-functions are stored in a dedicated utility file `sort.js`.

- thus:

### 4.3 sort algos (`front-end/search/sort.js`)

| Filter radio | Algorithm wired | Function | Order |
| :--- | :--- | :--- | :--- |
| name | merge sort (case-insensitive) | `merge_name()` | A→Z |
| time | insertion sort (adaptive) | `insertion_time()` | earliest→latest |
| price | bubble sort (early-exit) | `bubble_ascending_price()` | cheapest→dearest |
| rate | bubble sort (early-exit) | `bubble_ascending_rate()` | highest rating first |
| duration | selection sort | `selectionDuration()` | shortest→longest |



#### 4.3.1 Bubble

- Adjacent elements are compared and swapped, bubbling the largest element to the end of each pass. 
- exist `swapped` flag=> best case into **O(n)** (early exit on sorted input);
- worst/average remain ***O(n²)***. It is **stable** and in-place (***O(1)*** extra space).
- `bubble_ascending_rate()` uses the mirrored predicate, so despite its name it sorts **descending** — highest rating first, which is the desired UX.

```mermaid
flowchart TD
    A[Start] --> B[i = 0]
    B --> C{i < n-1 ?}
    C -- no --> Z[return A]
    C -- yes --> D[swapped = false]
    D --> E[j = 0]
    E --> F{j < n-i-1 ?}
    F -- no --> G{swapped = false ?}
    G -- yes --> Z
    G -- no --> H[i = i + 1]
    H --> C
    F -- yes --> I{"A[j].key > A[j+1].key ?"}
    I -- yes --> J["swap A[j], A[j+1] ; swapped = true"]
    I -- no --> K[j = j + 1]
    J --> K
    K --> F
```



#### 4.3.2 Selection

Each pass finds the minimum of the unsorted suffix and swaps it into place.
- Always **O(n²)** comparisons,
- **O(n)** swaps, **unstable**, in-place. 

The duration option calls `selectionDuration()`. Each pass locates the
shortest remaining opera and swaps it into the next output position.

```mermaid
flowchart TD
    A[Start] --> B[i = 0]
    B --> C{i < n ?}
    C -- no --> Z[return A]
    C -- yes --> D["minIdx = i"]
    D --> E["j = i + 1"]
    E --> F{j < n ?}
    F -- no --> G["swap A[i], A[minIdx]"]
    G --> H["i = i + 1"]
    H --> C
    F -- yes --> I{"A[j] < A[minIdx] ?"}
    I -- yes --> J["minIdx = j"]
    I -- no --> K["j = j + 1"]
    J --> K
    K --> F
```

#### 4.3.3 Insertion

- Insertion sort builds a sorted prefix by shifting later showtimes to the
right and inserting each item into its correct position. 
- The current `insertion_time()` implementation converts the selected timestamps into
numeric time values using `Date.getTime()`.
- The algorithm is stable. Its best-case time complexity is **O(n)**, 
- while its average and worst-case time complexity is **O(n²)**.

```mermaid
flowchart TD
    A[Start] --> B[i = 1]
    B --> C{i < n ?}
    C -- no --> Z[return A]
    C -- yes --> D["key = A[i] ; j = i - 1"]
    D --> E{"j >= 0 and A[j].key > key.key ?"}
    E -- yes --> F["A[j+1] = A[j] ; j = j - 1"]
    F --> E
    E -- no --> G["A[j+1] = key"]
    G --> H["i = i + 1"]
    H --> C
```

#### 4.3.4 Merge

The project uses recursive merge sort for name sorting.
- `merge_name()` :
    - divides the array into two halves 
    - recursively sorts each half 
    - and combines them using `mergeHalves()`.

if two names compare equally, the merge operation takes the item from the
left half first, preserving stability. The merged items are copied back
into the input array, so existing callers can continue using the same array.

The time complexity is **O(n log n)**, with **O(n)** auxiliary space and an **O(log n)** recursion depth.

```mermaid
flowchart TD
    A["merge_name(data)"] --> B{Length <= 1?}
    B -- Yes --> Z[Return data]
    B -- No --> C[Split into left and right halves]
    C --> D[Recursively sort left half]
    D --> E[Recursively sort right half]
    E --> F[Combine using mergeHalves]
    F --> G[Copy merged items into data]
    G --> Z
```

#### 4.3.5 Quick

we uses `quickSortInPlace()` for relevance ranking and for building the sorted search index.

- selects a median-of-three pivot and partitions each range into values </=/> than the pivot. 
- An explicit array-backed Stack stores the remaining ranges 
- so this implementation does not use recursive quicksort calls.
- Its average time complexity is **O(n log n)**
- while its worst-case time complexity is **O(n²)** 


```mermaid
flowchart TD
    A[Start] --> B[Push initial range onto Stack]
    B --> C{Stack empty?}
    C -- Yes --> Z[Return array]
    C -- No --> D[Pop a range]
    D --> E{Fewer than two items?}
    E -- Yes --> C
    E -- No --> F[Choose median-of-three pivot]
    F --> G[Partition into smaller, equal and greater regions]
    G --> H[Push non-trivial outer ranges, larger first]
    H --> C
```


### 4.4 Pagination (windowed rendering)

`renderPage()` (`search.js:184-203`) implements fixed-size pagination — a classic array-windowing construct with boundary clamping:

```mermaid
flowchart TD
    A["renderPage list"] --> B["totalPages = max 1, ceil len list / 3"]
    B --> C["currentPage = clamp currentPage, 1, totalPages"]
    C --> D["window = list slice (currentPage-1)*3 to currentPage*3 - 1"]
    D --> E[clear container and render window items]
    E --> F{currentPage = 1?}
    F -- yes --> G[disable Prev button]
    F -- no --> H[enable Prev button]
    G --> I{currentPage >= totalPages?}
    H --> I
    I -- yes --> J[disable Next button]
    I -- no --> K[enable Next button]
    J --> L[done]
    K --> L
```

The left and right arrow keys trigger the same handlers by calling sub-functions(`search.js:248-256`), so the page is navigable by keyboard.

---


## 5 workflow: Dynamic Pricing and Ticket Arithmetic

### 5.1 User-selected showtime and price plan

- The search page displays the available showtimes and their associated
- price plans. 
- Selecting a showtime updates the current selection.
- Clicking the opera title 
- then stores the selected price ID and time in localStorage before opening the booking page.


The current payment endpoint does not persist the selected price ID or
showtime. Preserving this association in the completed order remains
an implementation improvement.

