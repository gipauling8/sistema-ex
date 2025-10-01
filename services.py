from database import supabase
from postgrest import APIError
from uuid import UUID
from typing import List, Optional

# --- Funciones de Autenticación ---

def sign_up(email: str, password: str, role: str):
    """Registra un nuevo usuario en Supabase Auth. 
       Un trigger en la DB se encargará de crear el perfil correspondiente.
    """
    try:
        user = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "role": role
                }
            }
        })
        return user
    except Exception as e:
        raise e

def sign_in(email: str, password: str):
    """Inicia sesión de un usuario con email y contraseña."""
    try:
        session = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return session
    except Exception as e:
        raise e

# --- Funciones de Perfil ---

def get_profile_by_id(user_id: UUID):
    """Obtiene un perfil de usuario por su ID."""
    try:
        data, count = supabase.table('profiles').select('*').eq('id', str(user_id)).single().execute()
        return data[1]
    except APIError as e:
        raise e

def get_profiles(role: Optional[str] = None) -> List[dict]:
    """Obtiene una lista de perfiles, opcionalmente filtrados por rol."""
    try:
        query_builder = supabase.table('profiles').select('*').order('created_at', desc=True)
        if role:
            query_builder = query_builder.eq('role', role)
        data, count = query_builder.execute()
        return data[1]
    except APIError as e:
        raise e

def update_profile(user_id: UUID, updates: dict):
    """Actualiza el perfil de un usuario."""
    try:
        data, count = supabase.table('profiles').update(updates).eq('id', str(user_id)).execute()
        if not data[1]:
            return None
        return data[1][0]
    except APIError as e:
        raise e

# --- Funciones CRUD para Vacantes ---

def get_all_vacantes(query: str = None):
    """Obtiene todas las vacantes, opcionalmente filtradas por un término de búsqueda."""
    try:
        query_builder = supabase.table('vacancies').select('*').eq('is_active', True).order('created_at', desc=True)
        if query:
            query_builder = query_builder.text_search('title', f"'{query}'", config='english')
        data, count = query_builder.execute()
        return data[1]
    except APIError as e:
        raise e

def get_vacante_by_id(vacancy_id: UUID):
    """Obtiene una vacante por su ID."""
    try:
        data, count = supabase.table('vacancies').select('*').eq('id', str(vacancy_id)).single().execute()
        return data[1]
    except APIError as e:
        raise e

def create_vacante(company_id: UUID, vacante_data: dict):
    """Crea una nueva vacante en la base de datos."""
    try:
        nueva_vacante = {**vacante_data, 'company_id': str(company_id)}
        data, count = supabase.table('vacancies').insert(nueva_vacante).execute()
        return data[1][0]
    except APIError as e:
        raise e

def update_vacante(vacancy_id: UUID, updates: dict):
    """Actualiza una vacante existente por su ID."""
    try:
        data, count = supabase.table('vacancies').update(updates).eq('id', str(vacancy_id)).execute()
        if not data[1]:
            return None
        return data[1][0]
    except APIError as e:
        raise e

# --- Funciones de Aplicaciones ---

def aplicar_a_vacante(applicant_id: UUID, vacancy_id: UUID):
    """Crea una nueva aplicación de un egresado a una vacante."""
    try:
        aplicacion = {'applicant_id': str(applicant_id), 'vacancy_id': str(vacancy_id)}
        data, count = supabase.table('applications').insert(aplicacion).execute()
        return data[1][0]
    except APIError as e:
        raise e

def get_aplicaciones_por_vacante(vacancy_id: UUID):
    """Obtiene todas las aplicaciones para una vacante específica."""
    try:
        # Podríamos hacer un join para traer los datos del perfil del aplicante
        data, count = supabase.table('applications').select('*').eq('vacancy_id', str(vacancy_id)).execute()
        return data[1]
    except APIError as e:
        raise e



