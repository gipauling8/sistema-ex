import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { Profile } from '../types'; // Importar desde el archivo central de tipos

interface ProfileFormData {
    full_name?: string;
    graduation_year?: number | string;
    carrera?: string;
    company_name?: string;
    website?: string;
}

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get<Profile>('/me');
                setProfile(data);
                setFormData({
                    full_name: data.full_name || '',
                    carrera: data.carrera || '',
                    graduation_year: data.graduation_year || '',
                    company_name: data.company_name || '',
                    website: data.website || '',
                });
            } catch (err) {
                setError('No se pudo cargar el perfil.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const { data } = await api.put('/me', formData);
            setProfile(data);
            setSuccess('¡Perfil actualizado con éxito!');
        } catch (err) {
            setError('Error al actualizar el perfil.');
        }
    };

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /></div>;
    }

    if (error && !profile) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <Container className="d-flex justify-content-center">
            <Card className="w-100" style={{ maxWidth: '800px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Mi Perfil</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}
                    
                    {profile && (
                        <Form onSubmit={handleSubmit}>
                            <p><strong>Email:</strong> {profile.email}</p>
                            <p><strong>Rol:</strong> {profile.role}</p>
                            <hr />

                            {profile.role === 'egresado' && (
                                <>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Nombre Completo</Form.Label>
                                                <Form.Control type="text" name="full_name" value={formData.full_name || ''} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Carrera</Form.Label>
                                                <Form.Control type="text" name="carrera" value={formData.carrera || ''} onChange={handleChange} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Año de Graduación</Form.Label>
                                        <Form.Control type="number" name="graduation_year" value={formData.graduation_year || ''} onChange={handleChange} />
                                    </Form.Group>
                                </>
                            )}

                            {profile.role === 'empresa' && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre de la Empresa</Form.Label>
                                        <Form.Control type="text" name="company_name" value={formData.company_name || ''} onChange={handleChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sitio Web</Form.Label>
                                        <Form.Control type="text" name="website" value={formData.website || ''} onChange={handleChange} />
                                    </Form.Group>
                                </>
                            )}

                            <Button variant="primary" type="submit" className="w-100 mt-3">
                                Actualizar Perfil
                            </Button>
                        </Form>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProfilePage;