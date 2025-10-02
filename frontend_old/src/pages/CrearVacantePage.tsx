import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Form, Button, Container, Card, Alert, Row, Col } from 'react-bootstrap';

const CrearVacantePage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [salario, setSalario] = useState('');
    const [location, setLocation] = useState('');
    const [modality, setModality] = useState('Presencial');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/vacantes', {
                title,
                description,
                salario: salario ? parseFloat(salario) : null,
                location,
                modality,
            });
            navigate('/vacantes');
        } catch (err) {
            setError('Error al crear la vacante. Asegúrate de tener un perfil de empresa completo.');
            console.error(err);
        }
    };

    return (
        <Container className="d-flex justify-content-center">
            <Card className="w-100" style={{ maxWidth: '600px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Crear Nueva Vacante</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleCreate}>
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
                            Publicar Vacante
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default CrearVacantePage;
