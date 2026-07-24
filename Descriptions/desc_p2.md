### Activity Log

* **13th May 2026**
  * Distributed the initial questions.
* **16th May 2026**
  * Added the Sign-In page.
* **17th May 2026**
  * Added Sign-Up page.
  * Connected Node.js authentication with the backend SQL Server.
* **18th May 2026**
  * Combined Auth pages into `auth.html`.
  * Added switch animations.
  * *Note: Original working version is in the 'works' folder.*
* **27th June 2026**
  * Redesigned UI for `book.html`.
  * Introduced the price calculation function.
  * Added `opera` table to SQL DB (Primary Key: `opera_name`) to store seat prices.
  * Implemented backend SQL price routing based on frontend requests.
* **28th June 2026**
  * Completed `sum(price)` calculation (Front-to-Back communication) in `book.html`.
  * Advanced UI/UX design for `main.html` and `search.html`.
* **29th June 2026**
  * Added `localStorage` to pass search inputs from `main.html` to `search.html`.
  * Deployed Filterbox v1.0.1.
  ![Filterbox v1.0.1](filterbox_v1_0_1.png)
* **30th June 2026**
  * Started development on the payment page (`pay.html`).
  * Managed SQL DBMS data recording via JS fetch/receive.
* **1st July 2026 (Wed)**
  * Redesigned DBMS tables to fix **3NF violations**.
  * Optimized data storage distribution.
  * *Upcoming:* ER diagram and deep analysis of the DBMS tables will be conducted before Sunday, July 5th.
* **2st July 2026**
  * draw the v1.0.0 ER diagram addresing the sql table:
  ![alt text](ERD_v1_0_0-1.png)'


* **22nd July 2026**
  * Add hash and salt algorithm to the backend `serv.js` to encrypt passwords.
  * Add password validation checks on sign-up including:
    * Must include at least 1 uppercase letter
    * Must include at least 1 lowercase letter
    * Must include at least 1 special character
    * Must include at least 1 number
    * Length must be 8 or more characters
  * Start working on reset password page (improve ux as user may forget their password and are urgent to  reset them)



* **23rd july 2026**
  * user who sign up now will receive a verification email to verify if they are signing up an account
    * **with special thanks to the service provided by `https://app.mailersend.com`
* **24th July 2026**
  * fixed problem of the link included inside the email for redirection purposes:
    * port of the link should be `3000`(express module port) instead of `5500`(live server port)
  * **added vast amount of `console.log()` in serv.js in order to record log in the terminal**
    * *receive verfiction email now is completely functional*
    * test account:
      * id: `a`
      * email: `azusaring@gmail.com`
      * pwd: `Aa714714!`

