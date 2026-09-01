# ICT-SBA Project: Opera-Ticket Booking System

**Author:** Clifford, Wu Jia An  
**School:** St. Paul's College  
**Repository (Private):** https://github.com/Azusalina/sba-proj <br>
**Demonstration Video:** `demo.mp4` (Included in the repository root)

---

## Project Overview
This project is a full-stack Web-based **Opera-Ticket Booking System** developed for the Hong Kong Diploma of Secondary Education (HKDSE) ICT School-Based Assessment (SBA)[cite: 3]. The system provides a complete ticketing pipeline, incorporating dynamic seat pricing, advanced fuzzy search capabilities, dynamic algorithm-driven sorting, and an ACID-compliant transactional wallet payment gateway. It is designed to fulfill the Option C (Algorithm and Programming) requirements for both Task 1 (Design & Implementation) and Task 2 (Testing & Evaluation)[cite: 1].

---


## Project Structure(Tree, exclude dependencies):
```plaintext
.
├── back-end
│   ├── package.json
│   ├── package-lock.json
│   ├── serv-auth
│   │   └── serv-auth.js
│   ├── serv-config
│   │   └── serv-config.js
│   ├── serv.js
│   ├── serv-main
│   │   └── serv-main.js
│   ├── serv-utils
│   │   └── serv-utils.js
│   └── user.sql
├── begin.html
├── demo.mp4
├── Descriptions
│   ├── ERD_v1_0_0-1.png
│   ├── filterbox_v1_0_1.png
│   ├── guidelines.pdf
│   ├── in_syllabus_list.txt
│   ├── Log.md
│   ├── progressList.md
│   ├── requirements.md
│   └── todolist.md
├── front-end
│   ├── auth
│   │   ├── auth.css
│   │   ├── auth.html
│   │   ├── auth.js
│   │   ├── confirm.html
│   │   ├── signin_back.png
│   │   └── signup_back.png
│   ├── book
│   │   ├── book.css
│   │   ├── book.html
│   │   └── book.js
│   ├── index.html
│   ├── main
│   │   ├── location.png
│   │   ├── main.css
│   │   ├── main.js
│   │   ├── p1.png
│   │   └── search_btn.png
│   ├── OrderConfirm
│   │   ├── OrderConfirm.css
│   │   ├── OrderConfirm.html
│   │   └── OrderConfirm.js
│   ├── pay
│   │   ├── pay.css
│   │   ├── pay.html
│   │   ├── pay.js
│   │   └── pay-mediator
│   │       ├── pay-mediator.html
│   │       └── pay-mediator.js
│   ├── reset
│   │   ├── reset.css
│   │   ├── reset.html
│   │   ├── reset.js
│   │   └── resetTrue
│   │       ├── resetTrue.html
│   │       └── resetTrue.js
│   ├── search
│   │   ├── package.json
│   │   ├── placeholder.png
│   │   ├── search.css
│   │   ├── search.html
│   │   ├── search.js
│   │   └── sort.js
│   ├── settings
│   │   ├── settings.css
│   │   ├── settings.html
│   │   └── settings.js
│   └── toolkit
│       ├── toolkit.html
│       └── toolkit.js
└── README.md
```

## System Architecture & Modules
The Node.js backend server utilizes a modular architecture originating from a central `serv.js` entry point:
| File Name | Description |
| :--- | :--- |
| `serv-config.js` | Manages database connections and third-party API configurations (e.g., MailerSend). |
| `serv-utils.js` | Contains core algorithmic helper tools and modular utility functions. |
| `serv-auth.js` | Handles user authentication, password hashing/salting, and email verification routing. |
| `serv.main.js` | Manages main API endpoints, SQL transaction handling, and business logic. |
| `serv.js` | Main switch of the backend server router.|
---

## Key Features & Functions

### 1. User Authentication & Security
* **Account Verification:** Enforces real-time email verification via the MailerSend API prior to allowing order placement[cite: 2].
* **Password Security:** Utilizes cryptographic password hashing and salting in `serv-auth.js`[cite: 2].
* **Validation Rules:** Requires passwords to have a minimum of 8 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character[cite: 2].
* **Password Reset System:** Features a tokenized email redirect pipeline allowing users to securely reset forgotten passwords[cite: 2].
* **UI/UX Switch Animations:** Includes smooth frontend transition animations when swapping between the Sign-Up and Sign-In pages[cite: 2].

### 2. Catalog, Search & Navigation
* **Fuzzy Search Engine:** Calculates best-fit results using Levenshtein Distance to allow flexible typing without requiring perfect spelling[cite: 2].
* **Exact Match Prioritization:** Ranks exact substring matches higher than fuzzy matches for better relevance[cite: 2].
* **Multi-Attribute Sorting:** Sorts search results dynamically across criteria such as Name, Price, Rating, and Show Time[cite: 2].
* **Pagination & Keyboard Support:** Features fully functional "Previous" and "Next" buttons that also support Left/Right Arrow keyboard shortcuts[cite: 2].
* **Cross-Page Data Inheritance:** Uses native browser `localStorage` to seamlessly pass selected show criteria across `main.html`, `search.html`, and `book.html`[cite: 2].
* **Dynamic Rendering:** Fetches opera content directly from the SQL database via `serv.js` rather than relying on manual frontend updates[cite: 2].

### 3. Ticketing & Dynamic Pricing
* **Time-Based Price Plans:** Calculates dynamic pricing (`getPricePlan()`) based on the opera's scheduled show time (e.g., applying Plan 1 for 00:00-12:00 and Plan 2 for 12:00-23:59)[cite: 2].
* **Seat Class Customization:** Recalculates the total price (`sum_fee`) dynamically on `OrderConfirm.html` based on the user's interactive seat selection[cite: 2].
* **Dynamic UI Styling:** Changes the background color of the seat display box automatically according to the selected seat class[cite: 2].

### 4. Wallet & Transactional Payment Gateway
* **Automated Wallet Instantiation:** Creates a linked ledger account in the `wallet` table automatically upon user registration[cite: 2].
* **Gift Code Redemption:** Uses a specialized tracking table for promo code validation and immediate balance top-ups[cite: 2].
* **Transaction Ledgering:** Logs a complete audit trail in the `wallet_transaction` table for every debit/credit event[cite: 2].
* **Ticket Generation Pipeline:** Issues a unique `order_id` in the `orders` table and corresponding `ticket_id` keys in the `ticket` table upon successful checkout[cite: 2].
* **Order Refunds:** Allows users to cancel their full order via `settings.html`, which reverses the transaction and triggers an automated confirmation email[cite: 2].

---

## Algorithms & CS Concepts Applied

| Algorithm / Concept | Scope | Description |
| :--- | :--- | :--- |
| **Levenshtein Distance** | `search.html` | Calculates edit distance between user queries and opera titles for fuzzy search matching[cite: 2]. |
| **Quick Sort** | `search.html` | Ranks and sorts match weight arrays output by the Levenshtein algorithm[cite: 2]. |
| **Merge Sort** | `sort.js` | Executes divide-and-conquer sorting on opera catalog items by title[cite: 2]. |
| **Insertion Sort** | `sort.js` | Executes adaptive sorting on catalog items ordered by `show_time`[cite: 2]. |
| **PBKDF2 / Hashing** | `serv-auth.js` | Encrypts user credentials with unique salt parameters before DB persistence[cite: 2]. |
| **Pessimistic Locking** | `serv.main.js` | Employs row-level database locking (`SELECT ... FOR UPDATE`) inside SQL transactions (`BEGIN ... COMMIT / ROLLBACK`) to prevent race conditions during purchases[cite: 2]. |
| **3NF Normalization** | Database | Database architecture continuously refined to satisfy Third Normal Form (3NF) standards and eliminate redundancies[cite: 2]. |

---

## Testing & Evaluation
To satisfy Task 2 requirements, comprehensive testing was conducted throughout development[cite: 1, 2]:
* **Debugging Logs:** Extensive `console.log()` statements were integrated into `serv.js` to track terminal output and isolate backend routing errors during API integration[cite: 2].
* **Portability Testing:** Deployment attempts were executed on August 4th/5th to test environment portability, resulting in identifying limitations between local and cloud hosted databases[cite: 2].
* **Feature Expansion:** Scope was extended based on testing feedback by adding a full-order ticket refund function via the settings page on August 8th[cite: 1, 2].
* **Demonstration:** A comprehensive system test is documented in the included `demo.mp4` file, showcasing the user journey from registration to final checkout.

---

## Installation & Running Locally

### Prerequisites
* Node.js (v16+ recommended)
* PostgreSQL
* Git

### Step 1: Clone Repository & Install Dependencies
Open your terminal (Git Bash for Windows, or standard Terminal for macOS/Linux) and run:
```bash
git clone [https://github.com/Azusalina/sba-proj.git](https://github.com/Azusalina/sba-proj.git)
cd sba-proj
npm install
```

### Step 2: Database Setup
Open PostgreSQL (via pgAdmin or psql) and create a database named sba_opera.
Import the provided schema backup file (database_dump.sql included in the root folder):
```Bash
psql -U postgres -d sba_opera < database_dump.sql
```
Update the database credentials in serv-config.js if necessary.

### Step 3: Launch the Backend Server
Install Visual Studio Code and live server extention;

click go live button at right bottom corner;

Run the entry-point script to start the server:
```Bash
cd sba-proj/back-end
node serv.js
```
The Express server will initialize and run on port `3000`.
### Step 4: Open Application
Navigate to your web browser and access:
http://127.0.0.1:5500
<br>

### Test Accounts (For Evaluation)
Due to limitations with the MailerSend API sending verification emails to unregistered external addresses, please use the following pre-verified test accounts to review the system:  
* Primary Test Account: User ID: alpha | Email/ID: azusaring@gmail.com | Password: Aa714714!
* Developer toolkit Pwd:aaaa
