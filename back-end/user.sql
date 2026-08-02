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

--user-related
select * from user_infor order by uid;  
select * from email_verification;
--opera-related&prices
select * from opera ORDER BY opera_id;
--raw
select * from prices;
--for intuitive management
select * from prices order by opera_id;
select * from lv order by id;
--ticket-related
select * from orders order by order_id;
select * from ticket order by ticket_id;




-- alter table opera add column duration int default 150

-- update opera set opera_name='aida' where opera_id=1;
-- update opera set opera_name='carmen' where opera_id=2;
-- update opera set opera_name='zauberflote' where opera_id=3;
-- insert into opera(opera_name,show_time) values('la-traviata','2009-07-16 19:30:00'),('rigoletto','2009-07-17')


-- update opera set rate=5.1 where opera_id=2;
-- update opera set rate=5.2 where opera_id=3;
-- update opera set rate=5.3 where opera_id=4;
-- update opera set rate=5.4 where opera_id=5;

-- insert into prices(price_id,opera_id,premium,std_high,std_low,budget,note) 
-- values
-- (1,1,1250,900,700,300,'aida caseI'),
-- (1,2,1200,850,650,250,'carmen caseI'),
-- (1,3,1150,800,600,200,'zauberflote caseI'),
-- (1,4,1100,750,550,150,'la-traviata caseI'),
-- (1,5,1125,775,575,175,'rigoletto caseI')
--(2,1,1225,855,655,255,'aida caseII')
-- (2,2,1215,865,675,265,'carmen caseII'),
-- (2,3,1165,815,612,215,'zauberflote caseII'),
-- (2,4,1115,765,565,165,'la-traviata caseII'),
-- (2,5,1140,790,590,190,'rigoletto caseII')


-- INSERT INTO opera (opera_id, opera_name, show_time, rate, duration) VALUES
-- (6,  'The Marriage of Figaro',   '2009-07-01 19:00:00', 9.2, 180),
-- (7,  'Don Giovanni',            '2009-07-03 19:30:00', 8.9, 165),
-- (8,  'The Barber of Seville',   '2009-07-05 18:00:00', 8.7, 160),
-- (9,  'La Boheme',               '2009-07-08 20:00:00', 9.5, 140),
-- (10, 'Tosca',                   '2009-07-10 19:30:00', 9.0, 130),
-- (11, 'Madama Butterfly',        '2009-07-12 19:00:00', 9.1, 155),
-- (12, 'Tristan und Isolde',      '2009-07-15 17:30:00', 8.8, 230),
-- (13, 'The Ring of the Nibelung','2009-07-18 16:00:00', 9.6, 300),
-- (14, 'Die Fledermaus',          '2009-07-20 19:30:00', 8.4, 145),
-- (15, 'Eugene Onegin',           '2009-07-22 19:00:00', 8.6, 170);


-- INSERT INTO prices (price_id, opera_id, premium, std_high, std_low, budget, note) VALUES
-- (1, 6, 700, 500, 300, 100, 'the-marriage-of-figaro caseI'),
-- (2, 6, 600, 505, 305, 105, 'the-marriage-of-figaro caseII'),

-- (1, 7, 710, 510, 310, 110, 'don-giovanni caseI'),
-- (2, 7, 610, 515, 315, 115, 'don-giovanni caseII'),

-- (1, 8, 720, 520, 320, 120, 'the-barber-of-seville caseI'),
-- (2, 8, 620, 525, 325, 125, 'the-barber-of-seville caseII'),

-- (1, 9, 730, 530, 330, 130, 'la-boheme caseI'),
-- (2, 9, 630, 535, 335, 135, 'la-boheme caseII'),

-- (1, 10, 740, 540, 340, 140, 'tosca caseI'),
-- (2, 10, 640, 545, 345, 145, 'tosca caseII'),

-- (1, 11, 750, 550, 350, 150, 'madama-butterfly caseI'),
-- (2, 11, 650, 555, 355, 155, 'madama-butterfly caseII'),

-- (1, 12, 760, 560, 360, 160, 'tristan-und-isolde caseI'),
-- (2, 12, 660, 565, 365, 165, 'tristan-und-isolde caseII'),

-- (1, 13, 770, 570, 370, 170, 'the-ring-of-the-nibelung caseI'),
-- (2, 13, 670, 575, 375, 175, 'the-ring-of-the-nibelung caseII'),

-- (1, 14, 780, 580, 380, 180, 'die-fledermaus caseI'),
-- (2, 14, 680, 585, 385, 185, 'die-fledermaus caseII'),

-- (1, 15, 790, 590, 390, 190, 'eugene-onegin caseI'),
-- (2, 15, 690, 595, 395, 195, 'eugene-onegin caseII');