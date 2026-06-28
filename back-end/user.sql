create table if not exists user_infor(
    uid serial primary key,
    id varchar(20) unique,
    pwd varchar(30),
    create_at timestamp default now(),
    email varchar(30),
    birth date
);

create table if not exists opera(
    opera_id serial primary key,
    opera_name varchar(30)
);
create table if not exists ticket(
    opera_id INT references opera(opera_id),

    ticket_id serial primary key,
    seat_class varchar(5),
    seat_number int,

    book_time date,
    transac_time date,
    transac_method varchar(30),
    transac_fee int,
    transac_status varchar(30),

    uid int references user_infor(uid)

);

select * from user_infor order by uid; 
select * from opera order by opera_name;
select * from ticket;



update opera set premium=1300,std_high=900,std_low=700,budget=350 where opera_name='Die Zauberflöte'
