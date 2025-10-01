import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

interface Aplicacion {
    id: number;
    alumno: {
        nombre: string;
        carrera: string;
    };
}

const AplicacionesPage: React.FC = () => {
    const [aplicaciones, setAplicaciones] = useState<Aplicacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { vacanteId } = useParams<{ vacanteId: string }>();

    useEffect(() => {
        const fetchAplicaciones = async () => {
            try {
                const response = await api.get(`/vacantes/${vacanteId}/aplicaciones`);
                setAplicaciones(response.data);
            } catch (err) {
                setError('No se pudieron cargar las aplicaciones. Asegúrate de ser el propietario de la vacante.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (vacanteId) {
            fetchAplicaciones();
        }
    }, [vacanteId]);

    if (loading) return <p>Cargando aplicantes...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>Aplicantes a la Vacante</h2>
            {aplicaciones.length === 0 ? (
                <p>No hay aplicaciones para esta vacante todavía.</p>
            ) : (
                <ul>
                    {aplicaciones.map(app => (
                        <li key={app.id}>
                            <h4>{app.alumno.nombre}</h4>
                            <p>{app.alumno.carrera}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AplicacionesPage;
