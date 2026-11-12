this file is for a quick explaination on the use of util-funcitons, subfuncitons, routes

classify with file names

## serv


### serv-utils.js

`hash` 

- combine user-input pwd with system-generate salt into a hash pwd

`random_generate_web`

- generate a signup verification web url according to user's token(which include user's identity)

`random_generate_ResetWeb`

- generate a password reset web url according to user's token included in email send to them.

`send_ver_email`
- by use mailersend api, send sign up verification email to user

`send_confirmation_email`
- by use mailersend api, send payment detail email to user.

`send_refund_email`
- by use mailersend api, send a notification email regarding the refund made by user in the web

`send_reset_email`
- send a reset email identity verfication email to user on request.


`sub_ID_time`

- convert date to string

`generate_TransacID`

- generate a near unique transac ID(include time) and return the id

`generate_ticketID`

- generate a near unique ticket ID(include time) and return the id

`validatePassword`
- validate the password input by user when they reset of sign up
including:
- non-empty
- 8 < length < 64
- \>=1 uppercase letter
- \>=1 lowercase letter
- \>=1 number
- \>=1 special letter 



### ticket-queue.mjs

### linked List

### Queue


###