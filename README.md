#Creamos 2 ramas en la cual se puede observar mas commits.

# 🏥 Sistema de Citas Médicas - FINAL

Este es un sistema web completo de **gestión de citas médicas** que ha sido ampliado con una arquitectura robusta de backend, integración con base de datos y funcionalidades avanzadas. Está diseñado para ofrecer una experiencia fluida tanto a pacientes como a administradores, facilitando la gestión de citas, historial médico y comunicaciones automatizadas.

## 📸 Capturas
<img width="2112" height="948" alt="Screenshot 2025-07-31 155913" src="https://github.com/user-attachments/assets/2dd23d86-a33b-4dbb-a4b0-3d6fce84c79d" />
<img width="1583" height="1029" alt="Screenshot 2025-07-31 155957" src="https://github.com/user-attachments/assets/b0f56ad2-d3ea-4389-bf32-ae2fbbd190bf" />
<img width="1546" height="527" alt="Screenshot 2025-07-31 160058" src="https://github.com/user-attachments/assets/63cfef7b-1265-4ab2-93c3-ebbe11668fa8" />
<img width="1768" height="725" alt="Screenshot 2025-07-31 160158" src="https://github.com/user-attachments/assets/2f4c4573-ea4d-4929-a033-a52135fc7121" />
<img width="1510" height="748" alt="Screenshot 2025-07-31 160228" src="https://github.com/user-attachments/assets/8ac803e6-1e53-4c98-9ad7-afa09d7fbe5d" />
<img width="1518" height="766" alt="Screenshot 2025-07-31 160324" src="https://github.com/user-attachments/assets/d1140d87-6ffd-43a1-9be8-b1580db81521" />
<img width="1931" height="961" alt="Screenshot 2025-07-31 160357" src="https://github.com/user-attachments/assets/29741fe9-94e5-44f7-b073-68ee9602290b" />
<img width="1675" height="908" alt="Screenshot 2025-07-31 160440" src="https://github.com/user-attachments/assets/0402afbe-c041-4e27-9f8d-a59f9482e4c7" />



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
   git clone https://github.com/elsebasdev1/clinic-app.git
   cd clinic-app
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

