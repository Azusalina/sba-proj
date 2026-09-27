# Validation Check List

Applies to both `auth` and `pwd reset` pages.

| Check          | Status | Details                                                                 |
|----------------|--------|-------------------------------------------------------------------------|
| Field presence | T      | `auth.html` *required* attribute                                        |
| Field length   | T      | `auth.html` *minlength* && *maxlength* attributes                       |
| Type           | T      | `auth.html` *type="email"* \|\| *type="password"* attributes            |
| Range          | T      | `auth.html` *minlength* && *maxlength* attributes                       |
| Fixed value    | F      | No existing true/false value input                                      |
| Format         | T      | *uppercase / lowercase / special* && email format check via *type="email"* attribute |
| Digit check    | T      | e.g. `auth.html` `/\d/` check                                           |

---

# Algorithms && Structures (In Syllabus)

| Topic                    | Status |
|--------------------------|--------|
| 1D array                 | T      |
| 2D array                 | T      |
| String                   | T      |
| Record / structured data | T      |
| **Stack**                | T      |
| **Queue**                | T      |
| **Linked list**          | T      |
| Linear search            | T      |
| Binary search            | T      |
| Bubble sort              | T      |
| Selection sort           | T      |
| Insertion sort           | T      |
| Merge sort               | T      |
| Quick sort               | T      |
| *Recursion*              | F      |
