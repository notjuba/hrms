--
-- HR ERP Tables Migration from invoice_agent to hr_erp
-- Only includes: User, Employee, Department, LeaveRequest, Attendance, Salary, _prisma_migrations
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Drop public schema and recreate to start fresh
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Create ENUM types for HR ERP
CREATE TYPE public."AttendanceStatus" AS ENUM (
    'PRESENT',
    'ABSENT',
    'LATE',
    'HALF_DAY',
    'ON_LEAVE'
);

CREATE TYPE public."EmployeeStatus" AS ENUM (
    'ACTIVE',
    'ON_LEAVE',
    'TERMINATED'
);

CREATE TYPE public."LeaveStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TYPE public."LeaveType" AS ENUM (
    'ANNUAL',
    'SICK',
    'PERSONAL',
    'MATERNITY',
    'PATERNITY',
    'UNPAID'
);

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'HR_MANAGER',
    'EMPLOYEE'
);

SET default_tablespace = '';
SET default_table_access_method = heap;

-- _prisma_migrations table
CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);

-- User table
CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'EMPLOYEE'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;

-- Department table
CREATE TABLE public."Department" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "managerId" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

CREATE SEQUENCE public."Department_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Department_id_seq" OWNED BY public."Department".id;

-- Employee table
CREATE TABLE public."Employee" (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "departmentId" integer,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    phone text,
    "position" text NOT NULL,
    "hireDate" timestamp(3) without time zone NOT NULL,
    address text,
    status public."EmployeeStatus" DEFAULT 'ACTIVE'::public."EmployeeStatus" NOT NULL,
    avatar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

CREATE SEQUENCE public."Employee_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Employee_id_seq" OWNED BY public."Employee".id;

-- LeaveRequest table
CREATE TABLE public."LeaveRequest" (
    id integer NOT NULL,
    "employeeId" integer NOT NULL,
    "leaveType" public."LeaveType" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    reason text,
    status public."LeaveStatus" DEFAULT 'PENDING'::public."LeaveStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

CREATE SEQUENCE public."LeaveRequest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."LeaveRequest_id_seq" OWNED BY public."LeaveRequest".id;

-- Attendance table
CREATE TABLE public."Attendance" (
    id integer NOT NULL,
    "employeeId" integer NOT NULL,
    date date NOT NULL,
    "checkIn" timestamp(3) without time zone,
    "checkOut" timestamp(3) without time zone,
    status public."AttendanceStatus" DEFAULT 'PRESENT'::public."AttendanceStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

CREATE SEQUENCE public."Attendance_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Attendance_id_seq" OWNED BY public."Attendance".id;

-- Salary table
CREATE TABLE public."Salary" (
    id integer NOT NULL,
    "employeeId" integer NOT NULL,
    "baseSalary" numeric(10,2) NOT NULL,
    bonus numeric(10,2) DEFAULT 0 NOT NULL,
    deductions numeric(10,2) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);

CREATE SEQUENCE public."Salary_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Salary_id_seq" OWNED BY public."Salary".id;

-- Set default values for sequences
ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);
ALTER TABLE ONLY public."Department" ALTER COLUMN id SET DEFAULT nextval('public."Department_id_seq"'::regclass);
ALTER TABLE ONLY public."Employee" ALTER COLUMN id SET DEFAULT nextval('public."Employee_id_seq"'::regclass);
ALTER TABLE ONLY public."LeaveRequest" ALTER COLUMN id SET DEFAULT nextval('public."LeaveRequest_id_seq"'::regclass);
ALTER TABLE ONLY public."Attendance" ALTER COLUMN id SET DEFAULT nextval('public."Attendance_id_seq"'::regclass);
ALTER TABLE ONLY public."Salary" ALTER COLUMN id SET DEFAULT nextval('public."Salary_id_seq"'::regclass);

-- Add primary key constraints
ALTER TABLE ONLY public._prisma_migrations ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public."User" ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Department" ADD CONSTRAINT "Department_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Employee" ADD CONSTRAINT "Employee_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."LeaveRequest" ADD CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Attendance" ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."Salary" ADD CONSTRAINT "Salary_pkey" PRIMARY KEY (id);

-- Add unique constraints
ALTER TABLE ONLY public."User" ADD CONSTRAINT "User_email_key" UNIQUE (email);
ALTER TABLE ONLY public."Department" ADD CONSTRAINT "Department_name_key" UNIQUE (name);
ALTER TABLE ONLY public."Department" ADD CONSTRAINT "Department_managerId_key" UNIQUE ("managerId");
ALTER TABLE ONLY public."Employee" ADD CONSTRAINT "Employee_userId_key" UNIQUE ("userId");
ALTER TABLE ONLY public."Attendance" ADD CONSTRAINT "Attendance_employeeId_date_key" UNIQUE ("employeeId", date);
ALTER TABLE ONLY public."Salary" ADD CONSTRAINT "Salary_employeeId_key" UNIQUE ("employeeId");

-- Add foreign key constraints
ALTER TABLE ONLY public."Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."Department" ADD CONSTRAINT "Department_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES public."Employee"(id) ON DELETE SET NULL;
ALTER TABLE ONLY public."LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON DELETE CASCADE;
ALTER TABLE ONLY public."Salary" ADD CONSTRAINT "Salary_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES public."Employee"(id) ON DELETE CASCADE;

-- Insert the prisma migration record so Prisma knows the migration was applied
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES
('f0a8a9d5-65ed-44d8-b37d-99f2d9f7aa53', '955e6265c7e8419245c2a113928f821365f0a62d75cd6749336c367c584a611c', '2026-01-01 20:05:55.551486-05', '20260102010555_init', NULL, NULL, '2026-01-01 20:05:55.524153-05', 1);
