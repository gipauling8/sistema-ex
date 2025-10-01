-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alumnos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre text,
  carrera text,
  CONSTRAINT alumnos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  applicant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  vacancy_id uuid DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT '''ENVIADA'''::text,
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.profiles(id),
  CONSTRAINT applications_vacancy_id_fkey FOREIGN KEY (vacancy_id) REFERENCES public.vacancies(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  role text NOT NULL,
  email text,
  full_name text,
  graduation_year text,
  company_name text,
  website text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.vacancies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  location text,
  modality text NOT NULL,
  is_active uuid NOT NULL,
  CONSTRAINT vacancies_pkey PRIMARY KEY (id),
  CONSTRAINT vacancies_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.profiles(id),
  CONSTRAINT vacancies_is_active_fkey FOREIGN KEY (is_active) REFERENCES public.profiles(id)
);