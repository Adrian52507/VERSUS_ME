# 🏆 VersusMe  
Plataforma web para crear, gestionar y participar en partidos deportivos entre jugadores reales.

VersusMe es una aplicación moderna desarrollada como parte del proyecto Capstone USIL. Permite a los usuarios crear partidos, unirse a encuentros, administrar su perfil deportivo y acceder a funcionalidades premium mediante un sistema de suscripciones integrado con Stripe.

---

## 🚀 Características Principales

### 🧑‍🤝‍🧑 Matchmaking Deportivo
- Crear partidos de diferentes deportes (fútbol, básquet, vóley, tenis, pádel, natación y más).  
- Filtrar por distrito, fecha, nivel y tipo de encuentro.  
- Ver partidos creados en el Dashboard principal.

### 💰 Apuestas Amistosas (opcional)
- El creador del partido puede habilitar un monto de apuesta amistosa.
- En el dashboard se muestra el partido y el monto asignado.

### 👤 Gestión de Perfil
- Editar nombre, biografía, distrito y deporte principal.
- Subida de foto de perfil y cover mediante **Cloudinary**.
- Vista pública y hover card del perfil dentro de la plataforma.
- Calificación del jugador (rating) con valor inicial **5.0**.

### 🔒 Autenticación Segura
- Registro con validación de contraseña en tiempo real.
- Verificación por correo electrónico mediante código único.
- Login con cookies HttpOnly.
- Recuperación y restablecimiento de contraseña.

### 🏅 Plan PRO (Stripe Integration)
- Pasarela de pagos 100% funcional usando **Stripe Checkout**.
- Beneficios del plan PRO:
  - Crear más de 1 partido por semana.
  - Subir fotos, videos o GIFs en el perfil.
  - Acceso anticipado a nuevas funcionalidades.
- Modo prueba habilitado para desarrollo.

### 📊 Dashboard Personalizado
- Lista de tus partidos creados y partidos disponibles.
- Estadísticas básicas del jugador.
- Vista dinámica de deportes con íconos personalizados.

### 🧠 IA (Próximamente)
- Planeado: recomendaciones de dieta, rutina y análisis deportivo.  
- Esta sección se mostrará como **"Próximamente"** en la plataforma.

---

## 🧩 Arquitectura del Proyecto

### **Frontend**
- **Next.js (React)**  
- Server Components + Client Components
- Fetch API con cookies seguras  
- Estilos en CSS modular y Tailwind (si se usa)
- Despliegue automático en **Vercel**

### **Backend**
- **Node.js + Express**
- Controladores modulares (auth, profile, matches, payments)
- Middleware JWT + Cookies HttpOnly
- Integración con **Stripe**  
- Gestión de imágenes con **Cloudinary**

### **Base de Datos**
- **TiDB Cloud** (compatible con MySQL)  
- Base distribuida, escalable y de alto rendimiento  
- Tablas principales:  
  - `users`  
  - `profiles`  
  - `matches`  
  - `match_players`  
  - `payments`  

---

## 🏗️ Estructura del Proyecto

versusme/
│── frontend/
│ ├── app/
│ ├── components/
│ ├── public/
│ └── styles/
│
│── backend/
│ ├── auth.js
│ ├── profile.js
│ ├── matches.js
│ ├── payments.js
│ ├── webhook.js
│ ├── db.js
│ └── app.js
│
└── README.md

---

## ⚙️ Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/Adrian52507/VERSUS_ME.git
```
## Instalar dependencias

### Frontend:
```bash
cd frontend
npm install
```
### Backend:
```bash
cd backend
npm install
```

## ⚙️ Creación de archivos de Variables de Entorno

Estas variables no están abiertas a todo el público, así que si desea comprobar el funcionamiento de la plataforma tendrá que solicitar dichas variables a versusme.general@gmail.com

### ./backend/.env

PORT=4000
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_DATABASE=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

ORIGIN_FRONTEND=http://localhost:3000

### ./frontend/.env.local

NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=

## Ejecutar servidores

### Frontend y Backend:
```bash
npm run dev
```