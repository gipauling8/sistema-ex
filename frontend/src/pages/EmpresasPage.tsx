import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Profile } from '../types';

const EmpresasPage: React.FC = () => {
    const [empresas, setEmpresas] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await api.get<Profile[]>('/profiles', { params: { role: 'empresa' } });
                setEmpresas(response.data);
            } catch (err) {
                setError('No se pudieron cargar las empresas.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEmpresas();
    }, []);

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /></div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Container>
            <h2 className="my-4">Empresas Asociadas</h2>
            {empresas.length === 0 ? (
                <p>No hay empresas registradas en este momento.</p>
            ) : (
                <Row>
                    {empresas.map(empresa => (
                        <Col md={6} lg={4} key={empresa.id} className="mb-4">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{empresa.company_name || 'Nombre no disponible'}</Card.Title>
                                    <Card.Text>
                                        {empresa.website && <p>Sitio Web: <a href={empresa.website} target="_blank" rel="noopener noreferrer">{empresa.website}</a></p>}
                                        {/* Aquí podrías añadir más detalles de la empresa si los tuvieras en el perfil */}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default EmpresasPage;
