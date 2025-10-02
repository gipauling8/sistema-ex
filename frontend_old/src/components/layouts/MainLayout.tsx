import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    exp: number;
    app_metadata: {
        role: string;
    };
}

const MainLayout: React.FC = () => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const isAuthenticated = !!localStorage.getItem('authToken');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUserRole(decoded.app_metadata.role);
            } catch (error) {
                console.error("Error decoding token:", error);
                localStorage.removeItem('authToken');
                setUserRole(null);
            }
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = '/login'; 
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/">Ex-Alumnos</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
                            <Nav.Link as={Link} to="/vacantes">Vacantes</Nav.Link>
                            <Nav.Link as={Link} to="/empresas">Empresas</Nav.Link>
                            {userRole === 'empresa' && (
                                <Nav.Link as={Link} to="/crear-vacante">Crear Vacante</Nav.Link>
                            )}
                        </Nav>
                        <Nav>
                            {isAuthenticated ? (
                                <NavDropdown title="Mi Cuenta" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to="/perfil">Mi Perfil</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>Cerrar Sesión</NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                                    <Nav.Link as={Link} to="/signup">Registrarse</Nav.Link>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mt-4">
                <Outlet />
            </Container>
        </>
    );
};

export default MainLayout;
