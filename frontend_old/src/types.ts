type UUID = string;

// Tipos basados en el nuevo esquema de la API v2

export interface Profile {
    id: UUID;
    role: 'egresado' | 'empresa';
    email?: string;
    full_name?: string;
    graduation_year?: number;
    carrera?: string;
    company_name?: string;
    website?: string;
}

export interface Vacante {
    id: UUID;
    company_id: UUID;
    title: string;
    description: string;
    salario?: number;
    location?: string;
    modality?: string;
    is_active: boolean;
}

export interface Aplicacion {
    id: UUID;
    applicant_id: UUID;
    vacancy_id: UUID;
    status: string;
}
