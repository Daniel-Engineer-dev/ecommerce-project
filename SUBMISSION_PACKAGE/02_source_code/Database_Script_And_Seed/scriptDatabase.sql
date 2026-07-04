--
-- PostgreSQL database dump
--

\restrict OUQ9RStVPIUoWEl5dYrNWjvsQMfIURgu04XRERmOdTtmfs1d7GmgAhgrMaQytsX

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

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

ALTER TABLE IF EXISTS ONLY public.vouchers DROP CONSTRAINT IF EXISTS vouchers_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vouchers DROP CONSTRAINT IF EXISTS vouchers_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.voucher_branches DROP CONSTRAINT IF EXISTS voucher_branches_voucher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.voucher_branches DROP CONSTRAINT IF EXISTS voucher_branches_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.system_logs DROP CONSTRAINT IF EXISTS system_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_voucher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.partners DROP CONSTRAINT IF EXISTS partners_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_voucher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.e_vouchers DROP CONSTRAINT IF EXISTS e_vouchers_used_at_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.e_vouchers DROP CONSTRAINT IF EXISTS e_vouchers_order_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_item_revisions DROP CONSTRAINT IF EXISTS content_item_revisions_content_id_fkey;
ALTER TABLE IF EXISTS ONLY public.content_item_revisions DROP CONSTRAINT IF EXISTS content_item_revisions_changed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.complaints DROP CONSTRAINT IF EXISTS complaints_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaints DROP CONSTRAINT IF EXISTS complaints_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaint_vouchers DROP CONSTRAINT IF EXISTS complaint_vouchers_voucher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaint_vouchers DROP CONSTRAINT IF EXISTS complaint_vouchers_complaint_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaint_responses DROP CONSTRAINT IF EXISTS complaint_responses_responder_id_fkey;
ALTER TABLE IF EXISTS ONLY public.complaint_responses DROP CONSTRAINT IF EXISTS complaint_responses_complaint_id_fkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_partner_id_fkey;
DROP TRIGGER IF EXISTS trg_validate_voucher_usage ON public.e_vouchers;
DROP TRIGGER IF EXISTS trg_validate_voucher_branch_owner ON public.voucher_branches;
DROP TRIGGER IF EXISTS trg_validate_review ON public.reviews;
DROP TRIGGER IF EXISTS trg_enforce_complaint_order_limit ON public.complaints;
DROP INDEX IF EXISTS public.orders_paid_transaction_reference_unique;
DROP INDEX IF EXISTS public.idx_users_phone_unique_not_null;
DROP INDEX IF EXISTS public.idx_users_email_unique_not_null;
DROP INDEX IF EXISTS public.idx_content_items_template;
DROP INDEX IF EXISTS public.idx_content_items_slug_unique;
DROP INDEX IF EXISTS public.idx_content_items_public;
DROP INDEX IF EXISTS public.idx_content_item_revisions_content_id;
DROP INDEX IF EXISTS public.idx_complaints_order_status;
DROP INDEX IF EXISTS public.complaints_one_active_per_order;
ALTER TABLE IF EXISTS ONLY public.vouchers DROP CONSTRAINT IF EXISTS vouchers_pkey;
ALTER TABLE IF EXISTS ONLY public.voucher_branches DROP CONSTRAINT IF EXISTS voucher_branches_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.system_logs DROP CONSTRAINT IF EXISTS system_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.reviews DROP CONSTRAINT IF EXISTS reviews_customer_voucher_unique;
ALTER TABLE IF EXISTS ONLY public.partners DROP CONSTRAINT IF EXISTS partners_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.e_vouchers DROP CONSTRAINT IF EXISTS e_vouchers_unique_code_key;
ALTER TABLE IF EXISTS ONLY public.e_vouchers DROP CONSTRAINT IF EXISTS e_vouchers_pkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_pkey;
ALTER TABLE IF EXISTS ONLY public.content_items DROP CONSTRAINT IF EXISTS content_items_pkey;
ALTER TABLE IF EXISTS ONLY public.content_items DROP CONSTRAINT IF EXISTS content_items_content_key_key;
ALTER TABLE IF EXISTS ONLY public.content_item_revisions DROP CONSTRAINT IF EXISTS content_item_revisions_pkey;
ALTER TABLE IF EXISTS ONLY public.complaints DROP CONSTRAINT IF EXISTS complaints_pkey;
ALTER TABLE IF EXISTS ONLY public.complaint_vouchers DROP CONSTRAINT IF EXISTS complaint_vouchers_pkey;
ALTER TABLE IF EXISTS ONLY public.complaint_responses DROP CONSTRAINT IF EXISTS complaint_responses_pkey;
ALTER TABLE IF EXISTS ONLY public.complaint_overflow_archive DROP CONSTRAINT IF EXISTS complaint_overflow_archive_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_category_name_key;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_pkey;
ALTER TABLE IF EXISTS public.vouchers ALTER COLUMN voucher_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.system_logs ALTER COLUMN log_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reviews ALTER COLUMN review_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN order_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN order_item_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.e_vouchers ALTER COLUMN evoucher_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_items ALTER COLUMN content_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.content_item_revisions ALTER COLUMN revision_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.complaints ALTER COLUMN complaint_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.complaint_responses ALTER COLUMN response_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN category_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.branches ALTER COLUMN branch_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.vouchers_voucher_id_seq;
DROP TABLE IF EXISTS public.vouchers;
DROP TABLE IF EXISTS public.voucher_branches;
DROP SEQUENCE IF EXISTS public.users_user_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.system_logs_log_id_seq;
DROP TABLE IF EXISTS public.system_logs;
DROP SEQUENCE IF EXISTS public.reviews_review_id_seq;
DROP TABLE IF EXISTS public.reviews;
DROP TABLE IF EXISTS public.partners;
DROP SEQUENCE IF EXISTS public.orders_order_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_order_item_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.e_vouchers_evoucher_id_seq;
DROP TABLE IF EXISTS public.e_vouchers;
DROP TABLE IF EXISTS public.customers;
DROP SEQUENCE IF EXISTS public.content_items_content_id_seq;
DROP TABLE IF EXISTS public.content_items;
DROP SEQUENCE IF EXISTS public.content_item_revisions_revision_id_seq;
DROP TABLE IF EXISTS public.content_item_revisions;
DROP SEQUENCE IF EXISTS public.complaints_complaint_id_seq;
DROP TABLE IF EXISTS public.complaints;
DROP TABLE IF EXISTS public.complaint_vouchers;
DROP SEQUENCE IF EXISTS public.complaint_responses_response_id_seq;
DROP TABLE IF EXISTS public.complaint_responses;
DROP TABLE IF EXISTS public.complaint_overflow_archive;
DROP SEQUENCE IF EXISTS public.categories_category_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.branches_branch_id_seq;
DROP TABLE IF EXISTS public.branches;
DROP FUNCTION IF EXISTS public.fn_validate_voucher_usage();
DROP FUNCTION IF EXISTS public.fn_validate_voucher_branch_owner();
DROP FUNCTION IF EXISTS public.fn_validate_review();
DROP FUNCTION IF EXISTS public.fn_log_action();
DROP FUNCTION IF EXISTS public.enforce_complaint_order_limit();
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: enforce_complaint_order_limit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enforce_complaint_order_limit() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.order_id IS NOT NULL THEN
        PERFORM pg_advisory_xact_lock(NEW.order_id);
        IF (
            SELECT COUNT(*) FROM complaints
            WHERE order_id = NEW.order_id AND customer_id = NEW.customer_id
        ) >= 2 THEN
            RAISE EXCEPTION 'This order has exceeded the allowed number of complaints.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_log_action(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_log_action() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO System_Logs (user_id, action, table_name, record_id)
    VALUES (
        (CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE NULL END), -- Cần bổ sung logic lấy user_id từ session trong thực tế
        TG_OP || ' on ' || TG_TABLE_NAME,
        TG_TABLE_NAME,
        (CASE WHEN TG_OP = 'DELETE' THEN OLD.user_id ELSE NEW.user_id END)
    );
    RETURN NULL;
END;
$$;


--
-- Name: fn_validate_review(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validate_review() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.order_id
        WHERE o.customer_id = NEW.customer_id
          AND oi.voucher_id = NEW.voucher_id
          AND o.status = 'Paid'
    ) THEN
        RAISE EXCEPTION 'Customer can only review vouchers from paid orders.';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_validate_voucher_branch_owner(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validate_voucher_branch_owner() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM vouchers v
        JOIN branches b ON b.branch_id = NEW.branch_id
        WHERE v.voucher_id = NEW.voucher_id
          AND v.partner_id = b.partner_id
    ) THEN
        RAISE EXCEPTION 'Voucher and branch must belong to the same partner.';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: fn_validate_voucher_usage(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_validate_voucher_usage() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_voucher_partner_id INT;
    v_branch_partner_id INT;
    v_order_status VARCHAR(20);
BEGIN
    IF NEW.status = 'Used' AND OLD.status <> 'Used' THEN
        SELECT v.partner_id, o.status
        INTO v_voucher_partner_id, v_order_status
        FROM order_items oi
        JOIN vouchers v ON v.voucher_id = oi.voucher_id
        JOIN orders o ON o.order_id = oi.order_id
        WHERE oi.order_item_id = NEW.order_item_id;

        SELECT partner_id INTO v_branch_partner_id
        FROM branches
        WHERE branch_id = NEW.used_at_branch_id;

        IF v_order_status <> 'Paid' THEN
            RAISE EXCEPTION 'Only vouchers from paid orders can be redeemed.';
        END IF;
        IF v_voucher_partner_id IS DISTINCT FROM v_branch_partner_id THEN
            RAISE EXCEPTION 'Branch does not belong to the partner that issued this voucher.';
        END IF;
        NEW.used_date := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    branch_id integer NOT NULL,
    partner_id integer,
    branch_name character varying(200),
    address text,
    phone character varying(20)
);


--
-- Name: branches_branch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branches_branch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branches_branch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branches_branch_id_seq OWNED BY public.branches.branch_id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    category_name character varying(100) NOT NULL
);


--
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- Name: complaint_overflow_archive; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaint_overflow_archive (
    complaint_id integer NOT NULL,
    archived_data jsonb NOT NULL,
    archived_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    archive_reason text NOT NULL
);


--
-- Name: complaint_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaint_responses (
    response_id integer NOT NULL,
    complaint_id integer,
    responder_id integer,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    action_type character varying(50)
);


--
-- Name: complaint_responses_response_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.complaint_responses_response_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: complaint_responses_response_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.complaint_responses_response_id_seq OWNED BY public.complaint_responses.response_id;


--
-- Name: complaint_vouchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaint_vouchers (
    complaint_id integer NOT NULL,
    voucher_id integer NOT NULL
);


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaints (
    complaint_id integer NOT NULL,
    customer_id integer,
    order_id integer,
    title character varying(255),
    content text NOT NULL,
    status character varying(20) DEFAULT 'Pending'::character varying,
    priority character varying(10) DEFAULT 'Normal'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    admin_note text,
    resolution_type character varying(40) DEFAULT 'none'::character varying,
    resolution_note text,
    refund_status character varying(40) DEFAULT 'none'::character varying,
    refund_amount numeric DEFAULT 0,
    voucher_id integer,
    attempt_no integer DEFAULT 1,
    reviewed_by integer,
    reviewed_at timestamp without time zone,
    resolved_at timestamp without time zone,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT complaints_priority_check CHECK (((priority)::text = ANY ((ARRAY['Low'::character varying, 'Normal'::character varying, 'High'::character varying, 'Urgent'::character varying])::text[]))),
    CONSTRAINT complaints_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Processing'::character varying, 'Resolved'::character varying, 'Rejected'::character varying])::text[])))
);


--
-- Name: complaints_complaint_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.complaints_complaint_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: complaints_complaint_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.complaints_complaint_id_seq OWNED BY public.complaints.complaint_id;


--
-- Name: content_item_revisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_item_revisions (
    revision_id integer NOT NULL,
    content_id integer,
    content_key character varying(80) NOT NULL,
    action character varying(50) NOT NULL,
    before_data jsonb,
    after_data jsonb,
    before_status character varying(30),
    after_status character varying(30),
    changed_by integer,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: content_item_revisions_revision_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_item_revisions_revision_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_item_revisions_revision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_item_revisions_revision_id_seq OWNED BY public.content_item_revisions.revision_id;


--
-- Name: content_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_items (
    content_id integer NOT NULL,
    content_key character varying(80) NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(30) DEFAULT 'policy'::character varying NOT NULL,
    body text,
    is_active boolean DEFAULT true,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    slug character varying(120),
    summary text,
    thumbnail_url text,
    status character varying(30) DEFAULT 'published'::character varying,
    published_at timestamp without time zone,
    created_by integer,
    updated_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    template character varying(50),
    data jsonb DEFAULT '{}'::jsonb,
    version integer DEFAULT 1,
    last_action character varying(50),
    published_title character varying(255),
    published_summary text,
    published_body text,
    published_template character varying(50),
    published_data jsonb,
    published_version integer
);


--
-- Name: content_items_content_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.content_items_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: content_items_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.content_items_content_id_seq OWNED BY public.content_items.content_id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    user_id integer NOT NULL,
    full_name character varying(100),
    dob date,
    address text,
    is_active boolean DEFAULT true
);


--
-- Name: e_vouchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_vouchers (
    evoucher_id integer NOT NULL,
    order_item_id integer,
    unique_code character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'Unused'::character varying,
    issued_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expiry_date timestamp without time zone,
    used_at_branch_id integer,
    used_date timestamp without time zone,
    CONSTRAINT e_vouchers_status_check CHECK (((status)::text = ANY ((ARRAY['Unused'::character varying, 'Used'::character varying, 'Expired'::character varying, 'Locked'::character varying])::text[])))
);


--
-- Name: e_vouchers_evoucher_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.e_vouchers_evoucher_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: e_vouchers_evoucher_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.e_vouchers_evoucher_id_seq OWNED BY public.e_vouchers.evoucher_id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    order_item_id integer NOT NULL,
    order_id integer,
    voucher_id integer,
    quantity integer,
    price_at_purchase numeric(12,2),
    CONSTRAINT order_items_price_nonnegative_check CHECK (((price_at_purchase IS NULL) OR (price_at_purchase >= (0)::numeric))),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: order_items_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_order_item_id_seq OWNED BY public.order_items.order_item_id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    customer_id integer,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_amount numeric(12,2),
    status character varying(20) DEFAULT 'Pending'::character varying,
    payment_method character varying(50),
    transaction_reference character varying(100),
    shipping_name character varying(100),
    shipping_phone character varying(20),
    shipping_email character varying(100),
    shipping_address text,
    is_gift boolean DEFAULT false NOT NULL,
    gift_recipient_name character varying(255),
    gift_recipient_phone character varying(50),
    gift_recipient_email character varying(255),
    gift_message text,
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Paid'::character varying, 'Cancelled'::character varying, 'Failed'::character varying, 'Expired'::character varying, 'Refunded'::character varying])::text[]))),
    CONSTRAINT orders_total_amount_nonnegative_check CHECK (((total_amount IS NULL) OR (total_amount >= (0)::numeric)))
);


--
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- Name: partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partners (
    user_id integer NOT NULL,
    company_name character varying(200),
    representative_name character varying(100),
    tax_id character varying(50),
    headquarters text,
    status character varying(20) DEFAULT 'Pending'::character varying,
    is_active boolean DEFAULT true,
    CONSTRAINT partners_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Approved'::character varying, 'Rejected'::character varying])::text[])))
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    voucher_id integer,
    customer_id integer,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_logs (
    log_id integer NOT NULL,
    user_id integer,
    action text NOT NULL,
    table_name character varying(50),
    record_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: system_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_logs_log_id_seq OWNED BY public.system_logs.log_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(100),
    phone character varying(20),
    role character varying(20),
    reset_token character varying(255),
    reset_token_expiry timestamp without time zone,
    create_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    admin_scope character varying(30),
    is_active boolean DEFAULT true,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['Customer'::character varying, 'Partner'::character varying, 'Admin'::character varying])::text[]))),
    CONSTRAINT users_admin_scope_check CHECK ((admin_scope IS NULL OR (admin_scope)::text = ANY ((ARRAY['SuperAdmin'::character varying, 'PartnerModerator'::character varying, 'VoucherModerator'::character varying, 'OrderManager'::character varying, 'ContentEditor'::character varying, 'SupportAgent'::character varying])::text[])))
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: voucher_branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.voucher_branches (
    voucher_id integer NOT NULL,
    branch_id integer NOT NULL
);


--
-- Name: vouchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vouchers (
    voucher_id integer NOT NULL,
    partner_id integer,
    category_id integer,
    title character varying(255) NOT NULL,
    description text,
    image_url text,
    discount_percent integer DEFAULT 0,
    original_price numeric(12,2) NOT NULL,
    sale_price numeric(12,2) NOT NULL,
    total_quantity integer DEFAULT 0 NOT NULL,
    quantity_stock integer DEFAULT 0 NOT NULL,
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expiry_date timestamp without time zone NOT NULL,
    terms_and_conditions text,
    cancellation_policy text,
    status character varying(20) DEFAULT 'Pending'::character varying,
    approved_at timestamp without time zone,
    rejected_reason text,
    CONSTRAINT chk_dates CHECK ((expiry_date > start_date)),
    CONSTRAINT chk_price CHECK ((sale_price < original_price)),
    CONSTRAINT chk_stock CHECK (((quantity_stock >= 0) AND (quantity_stock <= total_quantity))),
    CONSTRAINT vouchers_discount_percent_check CHECK (((discount_percent >= 0) AND (discount_percent <= 100))),
    CONSTRAINT vouchers_price_nonnegative_check CHECK (((original_price >= (0)::numeric) AND (sale_price >= (0)::numeric))),
    CONSTRAINT vouchers_status_check CHECK (((status)::text = ANY ((ARRAY['Draft'::character varying, 'Pending'::character varying, 'Approved'::character varying, 'Rejected'::character varying, 'Suspended'::character varying, 'Expired'::character varying])::text[])))
);


--
-- Name: vouchers_voucher_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vouchers_voucher_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vouchers_voucher_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vouchers_voucher_id_seq OWNED BY public.vouchers.voucher_id;


--
-- Name: branches branch_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches ALTER COLUMN branch_id SET DEFAULT nextval('public.branches_branch_id_seq'::regclass);


--
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- Name: complaint_responses response_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_responses ALTER COLUMN response_id SET DEFAULT nextval('public.complaint_responses_response_id_seq'::regclass);


--
-- Name: complaints complaint_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints ALTER COLUMN complaint_id SET DEFAULT nextval('public.complaints_complaint_id_seq'::regclass);


--
-- Name: content_item_revisions revision_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_item_revisions ALTER COLUMN revision_id SET DEFAULT nextval('public.content_item_revisions_revision_id_seq'::regclass);


--
-- Name: content_items content_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items ALTER COLUMN content_id SET DEFAULT nextval('public.content_items_content_id_seq'::regclass);


--
-- Name: e_vouchers evoucher_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_vouchers ALTER COLUMN evoucher_id SET DEFAULT nextval('public.e_vouchers_evoucher_id_seq'::regclass);


--
-- Name: order_items order_item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN order_item_id SET DEFAULT nextval('public.order_items_order_item_id_seq'::regclass);


--
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- Name: system_logs log_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN log_id SET DEFAULT nextval('public.system_logs_log_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: vouchers voucher_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers ALTER COLUMN voucher_id SET DEFAULT nextval('public.vouchers_voucher_id_seq'::regclass);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (branch_id);


--
-- Name: categories categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_category_name_key UNIQUE (category_name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- Name: complaint_overflow_archive complaint_overflow_archive_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_overflow_archive
    ADD CONSTRAINT complaint_overflow_archive_pkey PRIMARY KEY (complaint_id);


--
-- Name: complaint_responses complaint_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_responses
    ADD CONSTRAINT complaint_responses_pkey PRIMARY KEY (response_id);


--
-- Name: complaint_vouchers complaint_vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_vouchers
    ADD CONSTRAINT complaint_vouchers_pkey PRIMARY KEY (complaint_id, voucher_id);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (complaint_id);


--
-- Name: content_item_revisions content_item_revisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_item_revisions
    ADD CONSTRAINT content_item_revisions_pkey PRIMARY KEY (revision_id);


--
-- Name: content_items content_items_content_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_content_key_key UNIQUE (content_key);


--
-- Name: content_items content_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_items
    ADD CONSTRAINT content_items_pkey PRIMARY KEY (content_id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (user_id);


--
-- Name: e_vouchers e_vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_vouchers
    ADD CONSTRAINT e_vouchers_pkey PRIMARY KEY (evoucher_id);


--
-- Name: e_vouchers e_vouchers_unique_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_vouchers
    ADD CONSTRAINT e_vouchers_unique_code_key UNIQUE (unique_code);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (user_id);


--
-- Name: reviews reviews_customer_voucher_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_customer_voucher_unique UNIQUE (customer_id, voucher_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (log_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: voucher_branches voucher_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_branches
    ADD CONSTRAINT voucher_branches_pkey PRIMARY KEY (voucher_id, branch_id);


--
-- Name: vouchers vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_pkey PRIMARY KEY (voucher_id);


--
-- Name: complaints_one_active_per_order; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX complaints_one_active_per_order ON public.complaints USING btree (order_id, customer_id) WHERE (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Processing'::character varying])::text[])) AND (order_id IS NOT NULL));


--
-- Name: idx_complaints_order_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaints_order_status ON public.complaints USING btree (order_id, status);


--
-- Name: idx_content_item_revisions_content_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_item_revisions_content_id ON public.content_item_revisions USING btree (content_id, changed_at DESC);


--
-- Name: idx_content_items_public; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_items_public ON public.content_items USING btree (status, type, published_at);


--
-- Name: idx_content_items_slug_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_content_items_slug_unique ON public.content_items USING btree (slug) WHERE (slug IS NOT NULL);


--
-- Name: idx_content_items_template; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_items_template ON public.content_items USING btree (template);


--
-- Name: idx_users_email_unique_not_null; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_users_email_unique_not_null ON public.users USING btree (lower((email)::text)) WHERE (email IS NOT NULL);


--
-- Name: idx_users_phone_unique_not_null; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_users_phone_unique_not_null ON public.users USING btree (phone) WHERE (phone IS NOT NULL);


--
-- Name: orders_paid_transaction_reference_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_paid_transaction_reference_unique ON public.orders USING btree (transaction_reference) WHERE (((status)::text = 'Paid'::text) AND (transaction_reference IS NOT NULL));


--
-- Name: complaints trg_enforce_complaint_order_limit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_enforce_complaint_order_limit BEFORE INSERT ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.enforce_complaint_order_limit();


--
-- Name: reviews trg_validate_review; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_review BEFORE INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.fn_validate_review();


--
-- Name: voucher_branches trg_validate_voucher_branch_owner; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_voucher_branch_owner BEFORE INSERT OR UPDATE ON public.voucher_branches FOR EACH ROW EXECUTE FUNCTION public.fn_validate_voucher_branch_owner();


--
-- Name: e_vouchers trg_validate_voucher_usage; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_voucher_usage BEFORE UPDATE ON public.e_vouchers FOR EACH ROW EXECUTE FUNCTION public.fn_validate_voucher_usage();


--
-- Name: branches branches_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(user_id) ON DELETE CASCADE;


--
-- Name: complaint_responses complaint_responses_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_responses
    ADD CONSTRAINT complaint_responses_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(complaint_id) ON DELETE CASCADE;


--
-- Name: complaint_responses complaint_responses_responder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_responses
    ADD CONSTRAINT complaint_responses_responder_id_fkey FOREIGN KEY (responder_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: complaint_vouchers complaint_vouchers_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_vouchers
    ADD CONSTRAINT complaint_vouchers_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(complaint_id) ON DELETE CASCADE;


--
-- Name: complaint_vouchers complaint_vouchers_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_vouchers
    ADD CONSTRAINT complaint_vouchers_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(voucher_id) ON DELETE CASCADE;


--
-- Name: complaints complaints_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(user_id) ON DELETE CASCADE;


--
-- Name: complaints complaints_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE SET NULL;


--
-- Name: content_item_revisions content_item_revisions_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_item_revisions
    ADD CONSTRAINT content_item_revisions_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(user_id);


--
-- Name: content_item_revisions content_item_revisions_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_item_revisions
    ADD CONSTRAINT content_item_revisions_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.content_items(content_id) ON DELETE CASCADE;


--
-- Name: customers customers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: e_vouchers e_vouchers_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_vouchers
    ADD CONSTRAINT e_vouchers_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(order_item_id) ON DELETE CASCADE;


--
-- Name: e_vouchers e_vouchers_used_at_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_vouchers
    ADD CONSTRAINT e_vouchers_used_at_branch_id_fkey FOREIGN KEY (used_at_branch_id) REFERENCES public.branches(branch_id) ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- Name: order_items order_items_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(voucher_id) ON DELETE SET NULL;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(user_id) ON DELETE RESTRICT;


--
-- Name: partners partners_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(user_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(voucher_id) ON DELETE CASCADE;


--
-- Name: system_logs system_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: voucher_branches voucher_branches_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_branches
    ADD CONSTRAINT voucher_branches_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(branch_id) ON DELETE CASCADE;


--
-- Name: voucher_branches voucher_branches_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.voucher_branches
    ADD CONSTRAINT voucher_branches_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.vouchers(voucher_id) ON DELETE CASCADE;


--
-- Name: vouchers vouchers_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE SET NULL;


--
-- Name: vouchers vouchers_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vouchers
    ADD CONSTRAINT vouchers_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(user_id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict OUQ9RStVPIUoWEl5dYrNWjvsQMfIURgu04XRERmOdTtmfs1d7GmgAhgrMaQytsX


-- Schema above was exported from the current Supabase public schema on 2026-06-10.


-- ============================================================
-- DEALZY CONSISTENT DEMO SEED
-- Shared demo password for all seeded accounts: Demo@123
-- ============================================================

SET search_path TO public;

BEGIN;

INSERT INTO public.users (username, password, email, phone, role) VALUES
('admin_demo', '$2b$10$z1Wdw8Tf85eGCPPQOTRJv.oE2XyqQt5iFqInUEqgivaZL.oBLJrHu', 'admin.demo@dealzy.test', '0901000001', 'Admin'),
('partner_demo', '$2b$10$z1Wdw8Tf85eGCPPQOTRJv.oE2XyqQt5iFqInUEqgivaZL.oBLJrHu', 'partner.demo@dealzy.test', '0901000002', 'Partner'),
('partner_pending_demo', '$2b$10$z1Wdw8Tf85eGCPPQOTRJv.oE2XyqQt5iFqInUEqgivaZL.oBLJrHu', 'partner.pending@dealzy.test', '0901000003', 'Partner'),
('customer_demo', '$2b$10$z1Wdw8Tf85eGCPPQOTRJv.oE2XyqQt5iFqInUEqgivaZL.oBLJrHu', 'customer.demo@dealzy.test', '0901000004', 'Customer');

INSERT INTO public.partners (user_id, company_name, representative_name, tax_id, headquarters, status, is_active)
SELECT user_id, 'Dealzy Demo Wellness', 'Nguyen Demo', 'DEMO-TAX-001', 'Thu Duc City, Ho Chi Minh City', 'Approved', TRUE
FROM public.users WHERE username = 'partner_demo'
UNION ALL
SELECT user_id, 'Pending Demo Restaurant', 'Tran Demo', 'DEMO-TAX-002', 'District 1, Ho Chi Minh City', 'Pending', TRUE
FROM public.users WHERE username = 'partner_pending_demo';

INSERT INTO public.customers (user_id, full_name, dob, address, is_active)
SELECT user_id, 'Customer Demo', DATE '2000-01-15', 'Ho Chi Minh City', TRUE
FROM public.users WHERE username = 'customer_demo';

INSERT INTO public.branches (partner_id, branch_name, address, phone)
SELECT user_id, 'Dealzy Demo Wellness - Thu Duc', 'Thu Duc City, Ho Chi Minh City', '02839000001'
FROM public.users WHERE username = 'partner_demo'
UNION ALL
SELECT user_id, 'Pending Demo Restaurant - District 1', 'District 1, Ho Chi Minh City', '02839000002'
FROM public.users WHERE username = 'partner_pending_demo';

INSERT INTO public.categories (category_name) VALUES
('Dining'), ('Beauty'), ('Travel'), ('Entertainment'), ('Shopping');

INSERT INTO public.vouchers (
    partner_id, category_id, title, description, image_url, discount_percent,
    original_price, sale_price, total_quantity, quantity_stock, start_date,
    expiry_date, terms_and_conditions, cancellation_policy, status, approved_at
)
SELECT
    u.user_id, c.category_id, 'Demo Facial Care Voucher',
    'Approved voucher used for checkout, E-Voucher and complaint demonstrations.',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=900',
    40, 500000, 300000, 20, 19, CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP + INTERVAL '180 days',
    'Advance booking is required.', 'Unused vouchers can be reviewed by support.',
    'Approved', CURRENT_TIMESTAMP
FROM public.users u
JOIN public.categories c ON c.category_name = 'Beauty'
WHERE u.username = 'partner_demo'
UNION ALL
SELECT
    u.user_id, c.category_id, 'Demo Relaxation Package',
    'Approved voucher reserved by a pending order for stock consistency demonstration.',
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=900',
    30, 400000, 280000, 15, 14, CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP + INTERVAL '180 days',
    'Advance booking is required.', 'Pending orders expire according to application policy.',
    'Approved', CURRENT_TIMESTAMP
FROM public.users u
JOIN public.categories c ON c.category_name = 'Beauty'
WHERE u.username = 'partner_demo'
UNION ALL
SELECT
    u.user_id, c.category_id, 'Pending Voucher For Admin Approval',
    'Voucher used to demonstrate the administrator approval workflow.',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=900',
    20, 300000, 240000, 10, 10, CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '180 days',
    'Pending approval.', 'Pending approval.',
    'Pending', NULL
FROM public.users u
JOIN public.categories c ON c.category_name = 'Dining'
WHERE u.username = 'partner_demo';

INSERT INTO public.voucher_branches (voucher_id, branch_id)
SELECT v.voucher_id, b.branch_id
FROM public.vouchers v
JOIN public.branches b ON b.partner_id = v.partner_id;

INSERT INTO public.orders (
    customer_id, total_amount, status, payment_method, transaction_reference,
    shipping_name, shipping_phone, shipping_email, shipping_address
)
SELECT user_id, 300000, 'Paid', 'VietQR', 'DEMO-PAID-0001',
       'Customer Demo', '0901000004', 'customer.demo@dealzy.test', 'Ho Chi Minh City'
FROM public.users WHERE username = 'customer_demo'
UNION ALL
SELECT user_id, 280000, 'Pending', 'PayPal', 'DEMO-PENDING-0001',
       'Customer Demo', '0901000004', 'customer.demo@dealzy.test', 'Ho Chi Minh City'
FROM public.users WHERE username = 'customer_demo';

INSERT INTO public.order_items (order_id, voucher_id, quantity, price_at_purchase)
VALUES
(
    (SELECT order_id FROM public.orders WHERE transaction_reference = 'DEMO-PAID-0001'),
    (SELECT voucher_id FROM public.vouchers WHERE title = 'Demo Facial Care Voucher'),
    1, 300000
),
(
    (SELECT order_id FROM public.orders WHERE transaction_reference = 'DEMO-PENDING-0001'),
    (SELECT voucher_id FROM public.vouchers WHERE title = 'Demo Relaxation Package'),
    1, 280000
);

INSERT INTO public.e_vouchers (order_item_id, unique_code, status, expiry_date)
SELECT oi.order_item_id, 'DEMO-EVOUCHER-0001', 'Unused', v.expiry_date
FROM public.order_items oi
JOIN public.orders o ON o.order_id = oi.order_id
JOIN public.vouchers v ON v.voucher_id = oi.voucher_id
WHERE o.transaction_reference = 'DEMO-PAID-0001';

INSERT INTO public.reviews (voucher_id, customer_id, rating, comment)
SELECT v.voucher_id, u.user_id, 5, 'Quy trinh mua voucher ro rang va nhanh.'
FROM public.vouchers v
CROSS JOIN public.users u
WHERE v.title = 'Demo Facial Care Voucher' AND u.username = 'customer_demo';

INSERT INTO public.complaints (
    customer_id, order_id, title, content, status, priority, attempt_no, updated_at
)
SELECT
    u.user_id, o.order_id, 'Chua nhan duoc huong dan su dung voucher',
    'Toi da thanh toan thanh cong nhung can duoc huong dan cach su dung E-Voucher tai chi nhanh.',
    'Pending', 'High', 1, CURRENT_TIMESTAMP
FROM public.users u
JOIN public.orders o ON o.customer_id = u.user_id
WHERE u.username = 'customer_demo' AND o.transaction_reference = 'DEMO-PAID-0001';

INSERT INTO public.complaint_vouchers (complaint_id, voucher_id)
SELECT c.complaint_id, v.voucher_id
FROM public.complaints c
JOIN public.orders o ON o.order_id = c.order_id
JOIN public.order_items oi ON oi.order_id = o.order_id
JOIN public.vouchers v ON v.voucher_id = oi.voucher_id
WHERE o.transaction_reference = 'DEMO-PAID-0001';

INSERT INTO public.system_logs (user_id, action, table_name, record_id)
SELECT user_id, 'CREATE_CONSISTENT_DEMO_SEED', 'database', NULL
FROM public.users WHERE username = 'admin_demo';

SELECT setval(pg_get_serial_sequence('public.users', 'user_id'), COALESCE(MAX(user_id), 1), TRUE) FROM public.users;
SELECT setval(pg_get_serial_sequence('public.branches', 'branch_id'), COALESCE(MAX(branch_id), 1), TRUE) FROM public.branches;
SELECT setval(pg_get_serial_sequence('public.categories', 'category_id'), COALESCE(MAX(category_id), 1), TRUE) FROM public.categories;
SELECT setval(pg_get_serial_sequence('public.vouchers', 'voucher_id'), COALESCE(MAX(voucher_id), 1), TRUE) FROM public.vouchers;
SELECT setval(pg_get_serial_sequence('public.orders', 'order_id'), COALESCE(MAX(order_id), 1), TRUE) FROM public.orders;
SELECT setval(pg_get_serial_sequence('public.order_items', 'order_item_id'), COALESCE(MAX(order_item_id), 1), TRUE) FROM public.order_items;
SELECT setval(pg_get_serial_sequence('public.e_vouchers', 'evoucher_id'), COALESCE(MAX(evoucher_id), 1), TRUE) FROM public.e_vouchers;
SELECT setval(pg_get_serial_sequence('public.reviews', 'review_id'), COALESCE(MAX(review_id), 1), TRUE) FROM public.reviews;
SELECT setval(pg_get_serial_sequence('public.complaints', 'complaint_id'), COALESCE(MAX(complaint_id), 1), TRUE) FROM public.complaints;
SELECT setval(pg_get_serial_sequence('public.system_logs', 'log_id'), COALESCE(MAX(log_id), 1), TRUE) FROM public.system_logs;

COMMIT;

-- Expected result: every issue_count is 0.
SELECT 'stock_mismatch' AS check_name, COUNT(*)::INT AS issue_count
FROM (
    SELECT v.voucher_id
    FROM public.vouchers v
    LEFT JOIN public.order_items oi ON oi.voucher_id = v.voucher_id
    LEFT JOIN public.orders o ON o.order_id = oi.order_id
    GROUP BY v.voucher_id, v.total_quantity, v.quantity_stock
    HAVING v.quantity_stock <> v.total_quantity
        - COALESCE(SUM(oi.quantity) FILTER (WHERE o.status IN ('Pending', 'Paid')), 0)
) issue
UNION ALL
SELECT 'paid_order_evoucher_count_mismatch', COUNT(*)::INT
FROM (
    SELECT oi.order_item_id
    FROM public.order_items oi
    JOIN public.orders o ON o.order_id = oi.order_id
    LEFT JOIN public.e_vouchers ev ON ev.order_item_id = oi.order_item_id
    WHERE o.status = 'Paid'
    GROUP BY oi.order_item_id, oi.quantity
    HAVING COUNT(ev.evoucher_id) <> oi.quantity
) issue
UNION ALL
SELECT 'non_paid_order_has_evoucher', COUNT(*)::INT
FROM public.e_vouchers ev
JOIN public.order_items oi ON oi.order_item_id = ev.order_item_id
JOIN public.orders o ON o.order_id = oi.order_id
WHERE o.status <> 'Paid'
UNION ALL
SELECT 'complaint_voucher_not_in_order', COUNT(*)::INT
FROM public.complaint_vouchers cv
JOIN public.complaints c ON c.complaint_id = cv.complaint_id
WHERE NOT EXISTS (
    SELECT 1 FROM public.order_items oi
    WHERE oi.order_id = c.order_id AND oi.voucher_id = cv.voucher_id
)
UNION ALL
SELECT 'orphan_partner_profile', COUNT(*)::INT
FROM public.partners p
LEFT JOIN public.users u ON u.user_id = p.user_id
WHERE u.user_id IS NULL OR u.role <> 'Partner'
UNION ALL
SELECT 'orphan_customer_profile', COUNT(*)::INT
FROM public.customers c
LEFT JOIN public.users u ON u.user_id = c.user_id
WHERE u.user_id IS NULL OR u.role <> 'Customer';
