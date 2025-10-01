from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
import services
from postgrest import APIError
from security import User, get_current_empresa_user, get_current_user, get_current_egresado_user

# --- Pydantic Models (Nuevo Esquema) ---

class Profile(BaseModel):
    id: UUID
    role: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    graduation_year: Optional[int] = None
    carrera: Optional[str] = None
    company_name: Optional[str] = None
    website: Optional[str] = None

    class Config:
        orm_mode = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    graduation_year: Optional[int] = None
    carrera: Optional[str] = None
    company_name: Optional[str] = None
    website: Optional[str] = None

class Vacante(BaseModel):
    id: UUID
    company_id: UUID
    title: str
    description: str
    salario: Optional[float] = None
    location: Optional[str] = None
    modality: Optional[str] = None
    is_active: bool

    class Config:
        orm_mode = True

class VacanteCreate(BaseModel):
    title: str
    description: str
    salario: Optional[float] = None
    location: Optional[str] = None
    modality: Optional[str] = None

class VacanteUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    salario: Optional[float] = None
    location: Optional[str] = None
    modality: Optional[str] = None
    is_active: Optional[bool] = None

class Aplicacion(BaseModel):
    id: UUID
    applicant_id: UUID
    vacancy_id: UUID
    status: str
    # Podríamos anidar el perfil del aplicante o la vacante si fuera necesario
    # applicant: Profile
    # vacancy: Vacante

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    email: str
    password: str
    role: str # 'egresado' o 'empresa'

class UserLogin(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: Optional[str] = None
    token_type: str = "bearer"
    message: Optional[str] = None

# --- FastAPI App ---

app = FastAPI(
    title="Sistema de Egresados API (Refactorizado)",
    description="API para gestionar perfiles de usuarios y vacantes con un esquema unificado.",
    version="2.0.0"
)

# --- CORS Middleware ---

origins = [

    "http://localhost:3000",

]



app.add_middleware(

    CORSMiddleware,

    allow_origins=origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)


# --- Auth & Profile Endpoints ---

@app.post("/auth/signup", response_model=AuthResponse)
def signup(user_data: UserCreate):
    try:
        response = services.sign_up(email=user_data.email, password=user_data.password, role=user_data.role)
        if response.session and response.session.access_token:
            return {"access_token": response.session.access_token}
        else:
            # This happens when email confirmation is required.
            return {"message": "User created. Please check your email for confirmation."}
    except APIError as e:
        if "User already registered" in e.message:
            raise HTTPException(status_code=409, detail="Email already in use.")
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/auth/login", response_model=AuthResponse)
def login(user_data: UserLogin):
    try:
        response = services.sign_in(email=user_data.email, password=user_data.password)
        # The response from sign_in is an AuthSessionResponse, which has a 'session' attribute
        return {"access_token": response.session.access_token}
    except Exception as e:
        # The service layer will raise an exception for invalid credentials
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/me", response_model=Profile)
def read_users_me(current_user: User = Depends(get_current_user)):
    """Obtiene el perfil del usuario autenticado."""
    profile = services.get_profile_by_id(user_id=UUID(current_user.id))
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado.")
    return profile

@app.put("/me", response_model=Profile)
def update_users_me(profile_data: ProfileUpdate, current_user: User = Depends(get_current_user)):
    """Actualiza el perfil del usuario autenticado."""
    update_data = profile_data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")
    
    updated_profile = services.update_profile(user_id=UUID(current_user.id), updates=update_data)
    if not updated_profile:
        raise HTTPException(status_code=404, detail="No se pudo actualizar el perfil.")
    return updated_profile

# --- Vacantes Endpoints ---

@app.post("/vacantes", response_model=Vacante, status_code=201)
def create_vacante(vacante: VacanteCreate, current_user: User = Depends(get_current_empresa_user)):
    try:
        # El ID de la empresa es el ID del usuario autenticado
        nueva_vacante = services.create_vacante(company_id=UUID(current_user.id), vacante_data=vacante.dict())
        return nueva_vacante
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Error de Supabase: {e.message}")

@app.get("/vacantes", response_model=List[Vacante])
def read_vacantes(query: Optional[str] = None):
    try:
        vacantes = services.get_all_vacantes(query=query)
        return vacantes
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Error de Supabase: {e.message}")

@app.get("/vacantes/{vacante_id}", response_model=Vacante)
def read_vacante(vacante_id: UUID):
    vacante = services.get_vacante_by_id(vacancy_id=vacante_id)
    if vacante is None:
        raise HTTPException(status_code=404, detail="Vacante no encontrada")
    return vacante

@app.put("/vacantes/{vacante_id}", response_model=Vacante)
def update_vacante(vacante_id: UUID, vacante: VacanteUpdate, current_user: User = Depends(get_current_empresa_user)):
    # La política de RLS ya valida que la empresa solo puede modificar sus propias vacantes
    update_data = vacante.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No se proporcionaron datos para actualizar")
    
    vacante_actualizada = services.update_vacante(vacancy_id=vacante_id, updates=update_data)
    if not vacante_actualizada:
        raise HTTPException(status_code=404, detail="Vacante no encontrada o no tienes permiso para modificarla.")
    return vacante_actualizada

# --- Aplicaciones Endpoints ---

@app.post("/vacantes/{vacante_id}/aplicar", status_code=201)
def aplicar_a_vacante(vacante_id: UUID, current_user: User = Depends(get_current_egresado_user)):
    try:
        services.aplicar_a_vacante(applicant_id=UUID(current_user.id), vacancy_id=vacante_id)
        return {"mensaje": "Aplicación exitosa"}
    except Exception as e:
        # La RLS y el UNIQUE constraint de la DB manejan la mayoría de los errores
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/vacantes/{vacante_id}/aplicaciones", response_model=List[Aplicacion])
def read_aplicaciones_de_vacante(vacante_id: UUID, current_user: User = Depends(get_current_empresa_user)):
    # La RLS asegura que solo la empresa propietaria de la vacante pueda ver las aplicaciones
    aplicaciones = services.get_aplicaciones_por_vacante(vacancy_id=vacante_id)
    return aplicaciones