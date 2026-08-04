SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- 创建序列和表 --

CREATE TABLE public.email_verification (
    token text NOT NULL,
    userid text,
    expire_time timestamp without time zone NOT NULL,
    used boolean DEFAULT false
);

CREATE TABLE public.gift_code (
    code character varying(15) NOT NULL,
    current_status boolean DEFAULT false,
    create_at timestamp without time zone DEFAULT now(),
    claim_by character varying(30),
    claim_time timestamp without time zone,
    amount numeric(10,2)
);

CREATE TABLE public.lv (
    id integer NOT NULL,
    name character varying(20),
    multiplier numeric(10,4)
);

CREATE SEQUENCE public.lv_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.lv_id_seq OWNED BY public.lv.id;

CREATE TABLE public.opera (
    opera_id integer NOT NULL,
    opera_name character varying(30),
    show_time timestamp without time zone DEFAULT '2009-06-29 19:30:00'::timestamp without time zone,
    rate numeric(3,1) DEFAULT 5.0,
    duration integer DEFAULT 150,
    CONSTRAINT opera_rate_check CHECK ((rate <= 10.0))
);

CREATE SEQUENCE public.opera_opera_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.opera_opera_id_seq OWNED BY public.opera.opera_id;

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    uid integer,
    book_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    transac_time timestamp without time zone,
    transac_method character varying(50),
    sum_fee numeric(10,2),
    transac_status character varying(20)
);

CREATE SEQUENCE public.orders_order_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;

CREATE TABLE public.prices (
    pid integer NOT NULL,
    price_id integer NOT NULL,
    opera_id integer,
    premium integer,
    std_high integer,
    std_low integer,
    budget integer,
    note character varying(100)
);

CREATE SEQUENCE public.prices_pid_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.prices_pid_seq OWNED BY public.prices.pid;

CREATE TABLE public.ticket (
    ticket_id character varying(50) NOT NULL,
    opera_id integer,
    order_id integer,
    seat_class character varying(20),
    seat_class2 character varying(20),
    seat_num integer
);

CREATE TABLE public.user_infor (
    uid integer NOT NULL,
    id character varying(20),
    pwd character varying(128),
    create_at timestamp without time zone DEFAULT now(),
    email character varying(50),
    birth date,
    salt character varying(32),
    verified boolean DEFAULT false
);

CREATE SEQUENCE public.user_infor_uid_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.user_infor_uid_seq OWNED BY public.user_infor.uid;

CREATE TABLE public.wallet (
    uid integer NOT NULL,
    balance numeric(12,2) DEFAULT 0.00 NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_positive_balance CHECK ((balance >= (0)::numeric))
);

CREATE TABLE public.wallet_transaction (
    tx_id character varying(40) NOT NULL,
    uid integer NOT NULL,
    order_id integer,
    tx_type character varying(10) NOT NULL,
    amount numeric(12,2) NOT NULL,
    running_balance numeric(12,2) NOT NULL,
    source_destination character varying(50) NOT NULL,
    description character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT check_positive_amount CHECK ((amount > (0)::numeric)),
    CONSTRAINT check_tx_type CHECK (((tx_type)::text = ANY ((ARRAY['CREDIT'::character varying, 'DEBIT'::character varying])::text[])))
);

ALTER TABLE ONLY public.lv ALTER COLUMN id SET DEFAULT nextval('public.lv_id_seq'::regclass);
ALTER TABLE ONLY public.opera ALTER COLUMN opera_id SET DEFAULT nextval('public.opera_opera_id_seq'::regclass);
ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);
ALTER TABLE ONLY public.prices ALTER COLUMN pid SET DEFAULT nextval('public.prices_pid_seq'::regclass);
ALTER TABLE ONLY public.user_infor ALTER COLUMN uid SET DEFAULT nextval('public.user_infor_uid_seq'::regclass);


-- 插入你的本地数据 (由 COPY 转换而来) --

INSERT INTO public.email_verification (token, userid, expire_time, used) VALUES
('77af62cba10748d498f80c50cdb75c89', 'alpha', '2026-08-03 16:01:15.307394', true);

INSERT INTO public.gift_code (code, current_status, create_at, claim_by, claim_time, amount) VALUES
('YIC8-M49N-GZDV', true, '2026-08-03 22:11:33.620148', 'alpha', '2026-08-03 22:11:40.097599', 1000.00);

INSERT INTO public.lv (id, name, multiplier) VALUES
(1, 'adult', 1.0000),
(2, 'student', 0.5000),
(3, 'wheelchair', 0.8000);

INSERT INTO public.opera (opera_id, opera_name, show_time, rate, duration) VALUES
(1, 'aida', '2009-06-29 19:30:00', 5.0, 150),
(2, 'carmen', '2009-07-14 19:30:00', 5.1, 150),
(3, 'zauberflote', '2009-07-15 19:30:00', 5.2, 150),
(4, 'la-traviata', '2009-07-16 19:30:00', 5.3, 150),
(5, 'rigoletto', '2009-07-17 00:00:00', 5.4, 150),
(6, 'The Marriage of Figaro', '2009-07-01 19:00:00', 9.2, 180),
(7, 'Don Giovanni', '2009-07-03 19:30:00', 8.9, 165),
(8, 'The Barber of Seville', '2009-07-05 18:00:00', 8.7, 160),
(9, 'La Boheme', '2009-07-08 20:00:00', 9.5, 140),
(10, 'Tosca', '2009-07-10 19:30:00', 9.0, 130),
(11, 'Madama Butterfly', '2009-07-12 19:00:00', 9.1, 155),
(12, 'Tristan und Isolde', '2009-07-15 17:30:00', 8.8, 230),
(13, 'The Ring of the Nibelung', '2009-07-18 16:00:00', 9.6, 300),
(14, 'Die Fledermaus', '2009-07-20 19:30:00', 8.4, 145),
(15, 'Eugene Onegin', '2009-07-22 19:00:00', 8.6, 170);

INSERT INTO public.orders (order_id, uid, book_time, transac_time, transac_method, sum_fee, transac_status) VALUES
(7, 1, '2026-08-03 20:26:28.89872', '2026-08-03 20:26:28.89872', 'WALLET_BALANCE', 215.00, 'COMPLETED'),
(8, 1, '2026-08-03 22:11:52.503272', '2026-08-03 22:11:52.503272', 'WALLET_BALANCE', 255.00, 'COMPLETED');

INSERT INTO public.prices (pid, price_id, opera_id, premium, std_high, std_low, budget, note) VALUES
(1, 1, 1, 1250, 900, 700, 300, 'aida caseI'),
(2, 1, 2, 1200, 850, 650, 250, 'carmen caseI'),
(3, 1, 3, 1150, 800, 600, 200, 'zauberflote caseI'),
(4, 1, 4, 1100, 750, 550, 150, 'la-traviata caseI'),
(5, 1, 5, 1125, 775, 575, 175, 'rigoletto caseI'),
(6, 2, 1, 1225, 855, 655, 255, 'aida caseII'),
(7, 2, 2, 1215, 865, 675, 265, 'carmen caseII'),
(8, 2, 3, 1165, 815, 612, 215, 'zauberflote caseII'),
(9, 2, 4, 1115, 765, 565, 165, 'la-traviata caseII'),
(10, 2, 5, 1140, 790, 590, 190, 'rigoletto caseII'),
(11, 1, 6, 700, 500, 300, 100, 'the-marriage-of-figaro caseI'),
(12, 2, 6, 600, 505, 305, 105, 'the-marriage-of-figaro caseII'),
(13, 1, 7, 710, 510, 310, 110, 'don-giovanni caseI'),
(14, 2, 7, 610, 515, 315, 115, 'don-giovanni caseII'),
(15, 1, 8, 720, 520, 320, 120, 'the-barber-of-seville caseI'),
(16, 2, 8, 620, 525, 325, 125, 'the-barber-of-seville caseII'),
(17, 1, 9, 730, 530, 330, 130, 'la-boheme caseI'),
(18, 2, 9, 630, 535, 335, 135, 'la-boheme caseII'),
(19, 1, 10, 740, 540, 340, 140, 'tosca caseI'),
(20, 2, 10, 640, 545, 345, 145, 'tosca caseII'),
(21, 1, 11, 750, 550, 350, 150, 'madama-butterfly caseI'),
(22, 2, 11, 650, 555, 355, 155, 'madama-butterfly caseII'),
(23, 1, 12, 760, 560, 360, 160, 'tristan-und-isolde caseI'),
(24, 2, 12, 660, 565, 365, 165, 'tristan-und-isolde caseII'),
(25, 1, 13, 770, 570, 370, 170, 'the-ring-of-the-nibelung caseI'),
(26, 2, 13, 670, 575, 375, 175, 'the-ring-of-the-nibelung caseII'),
(27, 1, 14, 780, 580, 380, 180, 'die-fledermaus caseI'),
(28, 2, 14, 680, 585, 385, 185, 'die-fledermaus caseII'),
(29, 1, 15, 790, 590, 390, 190, 'eugene-onegin caseI'),
(30, 2, 15, 690, 595, 395, 195, 'eugene-onegin caseII');

INSERT INTO public.ticket (ticket_id, opera_id, order_id, seat_class, seat_class2, seat_num) VALUES
('zauberflote-20260803-202628-BPOPY99YXXIV', 3, 7, 'budget', 'ADULT', 1),
('aida-20260803-221152-6NAL3Y5EXOA3', 1, 8, 'budget', 'ADULT', 1);

INSERT INTO public.user_infor (uid, id, pwd, create_at, email, birth, salt, verified) VALUES
(1, 'alpha', '08aca6f33684061c316824e0a36fce294132866ed49c99b8da95becd8fe04acd', '2026-08-02 16:01:15.307394', 'azusaring@gmail.com', NULL, '4e447e6cc3666b4ec093f45f8ecc2080', true);

INSERT INTO public.wallet (uid, balance, updated_at) VALUES
(1, 775.00, '2026-08-03 22:11:52.503272');

INSERT INTO public.wallet_transaction (tx_id, uid, order_id, tx_type, amount, running_balance, source_destination, description, created_at) VALUES
('tx-20260803-202628-A9XBQD', 1, 7, 'DEBIT', 215.00, 30.00, 'OPERA_TICKET_PURCHASE', 'Purchased ticket for zauberflote', '2026-08-03 20:26:28.89872'),
('tx-20260803-221152-PZ938B', 1, 8, 'DEBIT', 255.00, 775.00, 'OPERA_TICKET_PURCHASE', 'Purchased ticket for aida', '2026-08-03 22:11:52.503272');

-- 设置自增序列起点 --
SELECT pg_catalog.setval('public.lv_id_seq', 3, true);
SELECT pg_catalog.setval('public.opera_opera_id_seq', 5, true);
SELECT pg_catalog.setval('public.orders_order_id_seq', 8, true);
SELECT pg_catalog.setval('public.prices_pid_seq', 30, true);
SELECT pg_catalog.setval('public.user_infor_uid_seq', 1, true);

-- 创建主键、外键约束和索引 --
ALTER TABLE ONLY public.email_verification ADD CONSTRAINT email_verification_pkey PRIMARY KEY (token);
ALTER TABLE ONLY public.gift_code ADD CONSTRAINT gift_code_pkey PRIMARY KEY (code);
ALTER TABLE ONLY public.lv ADD CONSTRAINT lv_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.opera ADD CONSTRAINT opera_pkey PRIMARY KEY (opera_id);
ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);
ALTER TABLE ONLY public.prices ADD CONSTRAINT prices_pkey PRIMARY KEY (pid);
ALTER TABLE ONLY public.ticket ADD CONSTRAINT ticket_pkey PRIMARY KEY (ticket_id);
ALTER TABLE ONLY public.user_infor ADD CONSTRAINT user_infor_id_key UNIQUE (id);
ALTER TABLE ONLY public.user_infor ADD CONSTRAINT user_infor_pkey PRIMARY KEY (uid);
ALTER TABLE ONLY public.wallet ADD CONSTRAINT wallet_pkey PRIMARY KEY (uid);
ALTER TABLE ONLY public.wallet_transaction ADD CONSTRAINT wallet_transaction_pkey PRIMARY KEY (tx_id);
CREATE INDEX idx_wallet_tx_uid_date ON public.wallet_transaction USING btree (uid, created_at DESC);
ALTER TABLE ONLY public.email_verification ADD CONSTRAINT email_verification_userid_fkey FOREIGN KEY (userid) REFERENCES public.user_infor(id);
ALTER TABLE ONLY public.gift_code ADD CONSTRAINT gift_code_claim_by_fkey FOREIGN KEY (claim_by) REFERENCES public.user_infor(id);
ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_uid_fkey FOREIGN KEY (uid) REFERENCES public.user_infor(uid);
ALTER TABLE ONLY public.prices ADD CONSTRAINT prices_opera_id_fkey FOREIGN KEY (opera_id) REFERENCES public.opera(opera_id) ON DELETE CASCADE;
ALTER TABLE ONLY public.ticket ADD CONSTRAINT ticket_opera_id_fkey FOREIGN KEY (opera_id) REFERENCES public.opera(opera_id);
ALTER TABLE ONLY public.ticket ADD CONSTRAINT ticket_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;
ALTER TABLE ONLY public.wallet_transaction ADD CONSTRAINT wallet_transaction_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE SET NULL;
ALTER TABLE ONLY public.wallet_transaction ADD CONSTRAINT wallet_transaction_uid_fkey FOREIGN KEY (uid) REFERENCES public.user_infor(uid) ON DELETE CASCADE;
ALTER TABLE ONLY public.wallet ADD CONSTRAINT wallet_uid_fkey FOREIGN KEY (uid) REFERENCES public.user_infor(uid) ON DELETE CASCADE;