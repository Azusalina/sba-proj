-- create table if not exists user_infor(
--     uid serial primary key,
--     id varchar(20) unique,
--     pwd varchar(30),
--     create_at timestamp default now(),
--     email varchar(30),
--     birth date
-- );
-- create table if not exists opera(
--     opera_id serial primary key,
--     opera_name varchar(30)
-- );
-- create table if not exists ticket(
--     opera_id INT references opera(opera_id),
--     ticket_id serial primary key,
--     seat_class varchar(5),
--     seat_number int,
--     book_time date,
--     transac_time date,
--     transac_method varchar(30),
--     transac_fee int,
--     transac_status varchar(30),
--     uid int references user_infor(uid)
-- );




create table if not EXISTS user_infor (
    uid serial primary key,
    id varchar(20) unique,
    pwd varchar(255),
    create_at timestamp default now(),
    email varchar(50),
    birth date, 
    verified BOOLEAN default FALSE
);
CREATE TABLE if not exists email_verification (
    token TEXT PRIMARY KEY,
    userid TEXT REFERENCES user_infor(id),
    expire_time TIMESTAMP not null,
    used BOOLEAN DEFAULT FALSE
);

create table if not EXISTS opera(
    opera_id serial primary key,
    opera_name varchar(30),
    show_time timestamp  default ' 2009-06-29 19:30:00',
    rate decimal(3,1) default 5.0 check(rate<=10.0),
    duration int default 150
);

CREATE table if not exists prices(
    price_id serial primary key,
    opera_id int references opera(opera_id) on delete cascade,     
    premium int,
    std_high int,
    std_low int,
    budget int,

    note varchar(100)
);
create table if not exists orders(
    order_id serial primary key,
    uid int references user_infor(uid),
    book_time timestamp default current_timestamp,
    transac_time timestamp,
    transac_method varchar(50),
    sum_fee int,
    transac_status varchar(20)
);
create table if not exists ticket(
    ticket_id serial primary key,
    opera_id int references opera(opera_id),
    order_id int references orders(order_id) on delete cascade,
    seat_class varchar(20),
    seat_class2 varchar(20),
    seat_num int
);
create table if not exists lv(
    id serial primary key,
    name varchar(20),
    multiplier decimal(10,4)
);

select * from user_infor order by uid;  
select * from email_verification;
select * from opera ORDER BY opera_id;
select * from prices order by price_id;
select * from orders order by order_id;
select * from ticket order by ticket_id;
select * from lv order by id;


delete from email_verification where userid='a';
delete from user_infor where id='a';

alter table opera add column duration int default 150

update opera set opera_name='aida' where opera_id=1;
update opera set opera_name='carmen' where opera_id=2;
update opera set opera_name='zauberflote' where opera_id=3;
insert into opera(opera_name,show_time) values('la-traviata','2009-07-16 19:30:00'),('rigoletto','2009-07-17')


select * from opera order by show_time