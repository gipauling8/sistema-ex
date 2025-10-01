import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Vacante } from '../types';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string; // User ID
    exp: number;
    app_metadata: {
        role: 'egresado' | 'empresa';
    };
}

const VacantesPage: React.FC = () => {
    const [vacantes, setVacantes] = useState<Vacante[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState<{ id: string; role: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUser({ id: decoded.sub, role: decoded.app_metadata.role });
            } catch (error) {
                console.error("Error decoding token:", error);
                localStorage.removeItem('authToken');
            }
        }
    }, []);

    const fetchVacantes = useCallback(async (query?: string) => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/vacantes', {
                params: { query: query || undefined }
            });
            setVacantes(response.data);
        } catch (err) {
            setError('No se pudieron cargar las vacantes.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVacantes();
    }, [fetchVacantes]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchVacantes(searchTerm);
    };

    const handleClear = () => {
        setSearchTerm('');
        fetchVacantes();
    };

    const handleApply = async (id: string) => {
        try {
            await api.post(`/vacantes/${id}/aplicar`);
            alert('¡Has aplicado exitosamente a esta vacante!');
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Error al aplicar. Asegúrate de haber iniciado sesión como egresado y haber creado tu perfil.';
            alert(errorMessage);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres borrar esta vacante?')) {
            try {
                await api.delete(`/vacantes/${id}`);
                fetchVacantes(searchTerm);
            } catch (err) {
                alert('Error al borrar la vacante. Asegúrate de ser el propietario.');
            }
        }
    };

    return (
        <Container>
            <h2 className="my-4">Vacantes Disponibles</h2>
            
            <Form onSubmit={handleSearch} className="mb-4">
                <Row>
                    <Col md={9}>
                        <Form.Control 
                            type="text" 
                            placeholder="Buscar por título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col md={3} className="d-flex">
                        <Button type="submit" variant="primary" className="flex-grow-1">Buscar</Button>
                        <Button onClick={handleClear} variant="secondary" className="ms-2 flex-grow-1">Limpiar</Button>
                    </Col>
                </Row>
            </Form>

            {loading && <div className="text-center"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">{error}</Alert>}
            
            {!loading && !error && (
                <Row>
                    {vacantes.length === 0 ? (
                        <Col><p>No hay vacantes que coincidan con tu búsqueda.</p></Col>
                    ) : (
                        vacantes.map(vacante => (
                            <Col md={6} lg={4} key={vacante.id} className="mb-4">
                                <Card>
                                    <Card.Body>
                                        <Card.Title>{vacante.title}</Card.Title>
                                        <Card.Text>{vacante.description}</Card.Text>
                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                            {user?.role === 'egresado' && (
                                                <Button variant="success" size="sm" onClick={() => handleApply(vacante.id)}>Aplicar</Button>
                                            )}
                                            {user?.role === 'empresa' && user.id === vacante.company_id && (
                                                <>
                                                    <Button variant="outline-secondary" size="sm" onClick={() => navigate(`/vacantes/editar/${vacante.id}`)}>Editar</Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(vacante.id)}>Borrar</Button>
                                                    <Button variant="info" size="sm" onClick={() => navigate(`/vacantes/${vacante.id}/aplicaciones`)}>Ver Aplicaciones</Button>
                                                </>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    )}
                </Row>
            )}
        </Container>
    );
};

export default VacantesPage;
