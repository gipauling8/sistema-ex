import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const HomePage: React.FC = () => {
    return (
        <div className="bg-light p-5 rounded-lg m-3 text-center">
            <Container>
                <h1 className="display-4">Bienvenido al Portal de Egresados</h1>
                <p className="lead">
                    Conectando el talento de nuestros ex-alumnos con las mejores oportunidades laborales.
                </p>
                <hr className="my-4" />
                <p>
                    Explora las vacantes publicadas por nuestra red de empresas asociadas.
                </p>
                <LinkContainer to="/vacantes">
                    <Button variant="primary" size="lg">
                        Ver Vacantes
                    </Button>
                </LinkContainer>
            </Container>
        </div>
    );
};

export default HomePage;
