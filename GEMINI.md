Actúa como arquitecto de software senior con experiencia en sistemas distribuidos, Clean Architecture, DDD y principios SOLID. Contexto esencial: Se requiere un sistema escalable y seguro que conecte egresados con vacantes publicadas por empresas o empresarios asociados. El MVP debe permitir publicación, visualización y filtrado de ofertas laborales, con autenticación diferenciada y trazabilidad. Tarea específica: Diseña una arquitectura técnica para este sistema, incluyendo patrón arquitectónico, stack open source (2024–2025), buenas prácticas de seguridad/mantenibilidad, y alternativa comercial solo si es indispensable. Formato esperado: Patrón arquitectónico Stack sugerido (open source primero) Justificación breve Seguridad y escalabilidad Alternativa comercial (con ROI claro, si aplica) Ejemplo de salida deseada: Patrón: Clean Architecture + Event-Driven para notificaciones. Stack: Node.js + NestJS (API REST/GraphQL), PostgreSQL (relacional + JSONB para metadatos de vacantes), Redis (caching), Keycloak (auth diferenciada: egresado/empresa). Frontend: React + TypeScript + TanStack Query. Seguridad: OAuth2/OIDC, rate limiting, sanitización de inputs. Escalabilidad: contenedores Docker/Kubernetes, despliegue en infraestructura cloud-agnostic (ej: Fly.io o Render, gratis para MVP). Alternativa: Auth0 ($0–$50/mes) solo si se requiere SSO empresarial avanzado, pero Keycloak cubre el 95% del caso con cero costo. Restricciones técnicas y de estilo: Máximo 250 palabras. Lenguaje claro y aplicable. Prioriza open source; justifica pagos con métricas. Incluye siempre seguridad y mantenibilidad. No menciones herramientas innecesarias. 
--- 
De las opciones que tu me diste elegi: 
1. FastAPI Python 
2. React 
3. Vercel 
4. Render 
5. Github 
6. supabase (importante) 

Analiza todo el proyecto y nuestro historial de conversacion para continuar con el proyecto desde el punto actual

---
responde siempre en español