import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VacantesPage from './pages/VacantesPage';
import EmpresasPage from './pages/EmpresasPage';
import CrearVacantePage from './pages/CrearVacantePage';
import ProtectedRoute from './components/ProtectedRoute';
import EditarVacantePage from './pages/EditarVacantePage';
import ProfilePage from './pages/ProfilePage';
import AplicacionesPage from './pages/AplicacionesPage';
import MainLayout from './components/layouts/MainLayout';

const AppRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                {/* Rutas Públicas anidadas bajo el layout */}
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="vacantes" element={<VacantesPage />} />
                <Route path="empresas" element={<EmpresasPage />} />

                {/* Rutas protegidas para EMPRESAS */}
                <Route element={<ProtectedRoute allowedRoles={['empresa']} />}>
                    <Route path="crear-vacante" element={<CrearVacantePage />} />
                    <Route path="vacantes/editar/:vacanteId" element={<EditarVacantePage />} />
                    <Route path="vacantes/:vacanteId/aplicaciones" element={<AplicacionesPage />} />
                </Route>

                {/* Rutas protegidas para CUALQUIER usuario autenticado */}
                <Route element={<ProtectedRoute />}>
                    <Route path="perfil" element={<ProfilePage />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRouter;
