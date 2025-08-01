

## 🚀 Tecnologías Utilizadas

- **Frontend:** [React](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [Jakarta EE](https://jakarta.ee/) con [WildFly](https://www.wildfly.org/)
- **Base de datos:** [PostgreSQL](https://www.postgresql.org/)
- **API REST:** Servicios RESTful (JAX-RS)
- **Notificaciones:** Email Jakarta + WhatsApp API (twilio)
- **Routing:** React Router DOM
- **Autenticación:** Firebase Authentication (Google Sign-In)
- **Despliegue:** Usando VM con ip pública
- **Otros:**
  - Vite (entorno de desarrollo)
  - Framer Motion (animaciones)
  - React Hot Toast (notificaciones)
  - Date-fns (manejo de fechas)

## 🎯 Objetivos del Proyecto

- Agendar, confirmar, cancelar o modificar citas médicas.
- Gestión de especialidades, médicos y usuarios.
- Experiencia de usuario fluida y moderna.
- Persistencia de datos y trazabilidad de historial.
- Notificaciones automatizadas por correo y WhatsApp.
- Reportes administrativos descargables.
- Despliegue profesional en servidor de aplicaciones.

## 📁 Estructura del Proyecto

```
src/
│
├── frontend/           # Aplicación React
├── backend/            # Servicios Jakarta EE o Spring Boot
├── database/           # Scripts y configuraciones de PostgreSQL
├── components/         # Componentes reutilizables
├── pages/              # Vistas principales por rol
├── utils/              # Utilidades varias
├── assets/             # Recursos estáticos
```

## 🧑‍💻 Funcionalidades Principales

- **Paciente:**

  - Agendar citas por especialidad y médico
  - Editar o cancelar citas
  - Ver historial de citas anteriores con filtros por fecha/estado
  - Recibir notificaciones por correo y WhatsApp

- **Administrador:**

  - Confirmar o descartar citas pendientes
  - Gestionar usuarios, médicos y especialidades
  - Visualizar reportes de ocupación por especialidad/médico
  - Descargar reportes en PDF o Excel

## 📦 Instalación Local

1. Clona el repositorio:

   ```bash
   git clone https://github.com/elsebasdev1/integradorkr.git
   cd integradorkr
   ```

2. Configura el backend:

   - Asegúrate de tener WildFly o Spring Boot
   - Configura la conexión a PostgreSQL (ver archivo `persistence.xml` o `application.properties`)

3. Instala dependencias del frontend:

   ```bash
   cd frontend
   npm install
   ```

4. Ejecuta el sistema:

   - Backend: desplegar en WildFly o ejecutar con Spring Boot
   - Frontend:
     ```bash
     npm run dev
     ```

5. Para desplegar:

   - Frontend en Firebase Hosting:
     ```bash
     npm run build
     firebase deploy
     ```

## 🛡️ Seguridad y Validaciones

- Autenticación segura con Firebase Authentication
- Validaciones en formularios y backend
- Protección de rutas según rol (paciente o administrador)
- Confirmaciones visuales, toasts, y validación de acciones críticas

## 📘 Documentación

- [Informe Técnico del Proyecto](./Informe%20Citas%20Medicas.pdf)
- [Manual de Usuario](https://github.com/user-attachments/files/20601339/Manual.de.Usuario.Citas.Medicas.pdf)

## ✅ Buenas Prácticas Aplicadas

- Arquitectura MVC y RESTful
- Separación entre frontend y backend
- Modularidad y reutilización de componentes
- Uso de hooks y contextos en React
- Deploy y escalabilidad considerados desde el diseño

## 📌 Estado del Proyecto

✅ Proyecto finalizado y funcional.\
📈 Posibilidad de escalar a integraciones con historia clínica completa o pagos online.

## 📄 Licencia

Este proyecto se entrega bajo la licencia MIT. Puedes usarlo, modificarlo y compartirlo libremente.

---

> Desarrollado con ❤️ por Kevin Sebastián Sinchi Naula - Rafael Santiago Serrano Mora – 2025

