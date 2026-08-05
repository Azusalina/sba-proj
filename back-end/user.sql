

create table if not EXISTS user_infor (
    uid serial primary key,
    id varchar(20) unique,
    pwd varchar(255),
    create_at timestamp default now(),
    email varchar(50),
    birth date, 
    verified BOOLEAN default FALSE
);
CREATE TABLE IF NOT EXISTS wallet (
    uid INT PRIMARY KEY REFERENCES user_infor(uid) ON DELETE CASCADE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT check_positive_balance CHECK (balance >= 0)
);
CREATE TABLE IF NOT EXISTS wallet_transaction (
    tx_id varchar(40) PRIMARY KEY,
    uid INT NOT NULL REFERENCES user_infor(uid) ON DELETE CASCADE,
    order_id INT REFERENCES orders(order_id) ON DELETE SET NULL, 
    tx_type VARCHAR(10) NOT NULL, 
    amount NUMERIC(12, 2) NOT NULL,
    running_balance NUMERIC(12, 2) NOT NULL, 
    source_destination VARCHAR(50) NOT NULL, 
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT check_positive_amount CHECK (amount > 0),
    CONSTRAINT check_tx_type CHECK (tx_type IN ('CREDIT', 'DEBIT'))
);
    CREATE INDEX idx_wallet_tx_uid_date ON wallet_transaction(uid, created_at DESC);
CREATE table if not exists gift_code(
    code varchar(15)  primary key,--4+1+4+1+4=14, where 4 is 4 digit code and 1 is hyphen
    current_status BOOLEAN default FALSE,
    create_at timestamp default now(),
    claim_by varchar(30) references user_infor(id),
    claim_time timestamp,
    amount decimal(10,2)
)
CREATE TABLE if not exists email_verification (
    token TEXT PRIMARY KEY,
    userid TEXT REFERENCES user_infor(id),
    expire_time TIMESTAMP not null,
    used BOOLEAN DEFAULT FALSE
);

create table if not exists pwd_reset(
    email varchar(255) not null,
    token text primary key,
    expire_time timestamp not null,
    used boolean default FALSE
)
create table if not EXISTS opera(
    opera_id  int primary key,
    opera_name varchar(30),
    show_time timestamp  default ' 2009-06-29 19:30:00',
    rate decimal(3,1) default 5.0 check(rate<=10.0),
    duration int default 150
);
CREATE table if not exists prices(
    pid serial primary key,
    price_id int not null,
    opera_id int references opera(opera_id) on delete cascade,     
    premium int,
    std_high int,
    std_low int,
    budget int,

    note varchar(100)
);
create table if not exists lv(
    id serial primary key,
    name varchar(20),
    multiplier decimal(10,4)
);
create table if not exists orders(
    order_id serial primary key,
    uid int references user_infor(uid),
    book_time timestamp default current_timestamp,
    transac_time timestamp,
    transac_method varchar(50),
    sum_fee decimal(10,2),
    transac_status varchar(20)
);
create table if not exists ticket(
    ticket_id VARCHAR(50) PRIMARY KEY,
    opera_id INT REFERENCES opera(opera_id),
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    seat_class VARCHAR(20),
    seat_class2 VARCHAR(20),
    seat_num INT
);

--user-related
select * from user_infor order by uid;  
select * from email_verification;
select * from pwd_reset;
select * from gift_code
--opera-related&prices
select * from opera ORDER BY opera_id;
--raw
select * from prices;
--for intuitive management
select * from prices order by opera_id;
select * from lv order by id;
--ticket-related
SELECT * FROM wallet;
SELECT * from wallet_transaction order by uid;
select * from orders order by order_id;
select * from ticket order by ticket_id;

--reset all data
update wallet set balance=0 where uid=1;
delete from wallet_transaction;delete from orders;delete from ticket;delete from gift_code;
