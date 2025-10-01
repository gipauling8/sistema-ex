import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Vacante } from '../types';

const EditarVacantePage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [salario, setSalario] = useState('');
    const [location, setLocation] = useState('');
    const [modality, setModality] = useState('Presencial');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { vacanteId } = useParams<{ vacanteId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVacante = async () => {
            try {
                const response = await api.get<Vacante>(`/vacantes/${vacanteId}`);
                const { title, description, salario, location, modality } = response.data;
                setTitle(title);
                setDescription(description);
                setSalario(salario ? String(salario) : '');
                setLocation(location || '');
                setModality(modality || 'Presencial');
            } catch (err) {
                setError('No se pudo cargar la información de la vacante.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (vacanteId) {
            fetchVacante();
        }
    }, [vacanteId]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.put(`/vacantes/${vacanteId}`, {
                title,
                description,
                salario: salario ? parseFloat(salario) : null,
                location,
                modality,
            });
            navigate('/vacantes');
        } catch (err) {
            setError('Error al actualizar la vacante. Asegúrate de ser el propietario.');
            console.error(err);
        }
    };

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /></div>;
    }

    if (error && !title) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Container className="d-flex justify-content-center">
            <Card className="w-100" style={{ maxWidth: '600px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Editar Vacante</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleUpdate}>
                        <Form.Group className="mb-3">
                            <Form.Label>Título</Form.Label>
                            <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control as="textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Salario (Opcional)</Form.Label>
                                    <Form.Control type="number" value={salario} onChange={(e) => setSalario(e.target.value)} placeholder="Ej: 50000" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ubicación (Opcional)</Form.Label>
                                    <Form.Control type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Ciudad de México" />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Modalidad</Form.Label>
                            <Form.Select value={modality} onChange={(e) => setModality(e.target.value)}>
                                <option>Presencial</option>
                                <option>Remoto</option>
                                <option>Híbrido</option>
                            </Form.Select>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Actualizar Vacante
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditarVacantePage;
