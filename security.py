from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from database import supabase

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Clave secreta de JWT de Supabase (obtenerla de la configuración de tu proyecto)
# Ve a Project Settings > API > JWT Settings
# Por seguridad, cárgala desde una variable de entorno
import os
JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

class User:
    def __init__(self, id: str, email: str, role: str):
        self.id = id
        self.email = email
        self.role = role

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Dependencia de FastAPI para obtener el usuario actual a partir de un token JWT.
    Valida el token y extrae la información del usuario (incluyendo el rol).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decodifica el token usando la clave secreta de Supabase
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        
        # Extrae la información del usuario del payload
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("user_metadata", {}).get("role")

        if user_id is None or email is None or role is None:
            raise credentials_exception
            
        return User(id=user_id, email=email, role=role)

    except jwt.PyJWTError:
        raise credentials_exception
    except Exception:
        raise credentials_exception

# Dependencias específicas de roles

def get_current_empresa_user(current_user: User = Depends(get_current_user)) -> User:
    """Verifica que el usuario actual tenga el rol de 'empresa'."""
    if current_user.role != "empresa":
        raise HTTPException(status_code=403, detail="No tienes permiso para realizar esta acción.")
    return current_user

def get_current_egresado_user(current_user: User = Depends(get_current_user)) -> User:
    """Verifica que el usuario actual tenga el rol de 'egresado'."""
    if current_user.role != "egresado":
        raise HTTPException(status_code=403, detail="No tienes permiso para realizar esta acción.")
    return current_user
