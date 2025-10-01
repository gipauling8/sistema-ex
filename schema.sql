-- Nuevo Esquema Unificado para el sistema de ex-alumnos

-- 1. Tabla de Perfiles (Unifica Alumnos y Empresas)
-- Vinculada 1-a-1 con la tabla auth.users de Supabase.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'egresado' o 'empresa'
    email TEXT,
    -- Campos para Egresado
    full_name TEXT,
    graduation_year INT,
    carrera TEXT,
    -- Campos para Empresa
    company_name TEXT,
    website TEXT,
    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Vacantes
CREATE TABLE public.vacancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    salario NUMERIC(10, 2),
    location TEXT,
    modality TEXT, -- E.g., 'Remoto', 'Híbrido', 'Presencial'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Aplicaciones
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vacancy_id UUID NOT NULL REFERENCES public.vacancies(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ENVIADA', -- E.g., 'ENVIADA', 'VISTA', 'RECHAZADA'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(applicant_id, vacancy_id) -- Un alumno solo puede aplicar una vez a la misma vacante
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acceso para 'profiles'
-- Los usuarios pueden ver todos los perfiles (se puede restringir si es necesario).
CREATE POLICY "Permitir lectura pública de perfiles" ON public.profiles
    FOR SELECT USING (true);

-- Los usuarios solo pueden actualizar su propio perfil.
CREATE POLICY "Permitir a usuarios actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 6. Políticas de Acceso para 'vacancies'
-- Cualquiera puede ver las vacantes activas.
CREATE POLICY "Permitir lectura pública de vacantes activas" ON public.vacancies
    FOR SELECT USING (is_active = true);

-- Las empresas solo pueden crear vacantes para sí mismas.
CREATE POLICY "Permitir a empresas crear vacantes" ON public.vacancies
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'empresa' AND
        company_id = auth.uid()
    );

-- Las empresas solo pueden actualizar/desactivar sus propias vacantes.
CREATE POLICY "Permitir a empresas modificar sus propias vacantes" ON public.vacancies
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'empresa' AND
        company_id = auth.uid()
    );

-- 7. Políticas de Acceso para 'applications'
-- Los egresados pueden aplicar a vacantes.
CREATE POLICY "Permitir a egresados crear aplicaciones" ON public.applications
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'egresado' AND
        applicant_id = auth.uid()
    );

-- Los egresados pueden ver sus propias aplicaciones.
CREATE POLICY "Permitir a egresados ver sus aplicaciones" ON public.applications
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'egresado' AND
        applicant_id = auth.uid()
    );

-- Las empresas pueden ver las aplicaciones a sus vacantes.
CREATE POLICY "Permitir a empresas ver las aplicaciones a sus vacantes" ON public.applications
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'empresa' AND
        vacancy_id IN (SELECT id FROM public.vacancies WHERE company_id = auth.uid())
    );

-- 8. Función para crear un perfil automáticamente al registrar un nuevo usuario.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email)
  VALUES (new.id, new.raw_user_meta_data->>'role', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger que ejecuta la función cuando se crea un usuario en auth.users.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();