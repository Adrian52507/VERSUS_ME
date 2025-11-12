# 🏆 VersusMe

**VersusMe** es una plataforma web que conecta jugadores para organizar partidos y competencias deportivas en tiempo real.  
Permite crear partidos, unirse a eventos cercanos, administrar perfiles de usuario y mantener un historial de actividades, todo en una interfaz moderna y dinámica.

---

## 🚀 Descripción General

El proyecto fue desarrollado bajo un enfoque **DevOps** con despliegue automatizado en la nube mediante **Vercel**.  
La arquitectura sigue el modelo **cliente-servidor**, donde el frontend (Next.js) se comunica con un backend (Node.js + Express) y una base de datos distribuida **TiDB Cloud**.  
Las imágenes de perfil y portada se almacenan en **Cloudinary**, garantizando un sistema escalable y seguro.

---

## 🧩 Arquitectura del Sistema

```
👨‍💻 Usuario → Navegador Web
        │
        ▼
🎨 Frontend → Next.js (React)
        │
        ▼
⚙️ Backend / API → Node.js + Express
        │
        ▼
🗄️ Base de datos → TiDB Cloud (MySQL compatible)
        │
        ▼
☁️ Hospedaje → Vercel (Frontend y Backend)
        │
        ▼
🖼️ Almacenamiento de imágenes → Cloudinary
```

---

## 🧠 Características Principales

- **Registro e inicio de sesión seguro** con JWT y cookies HTTP-only.  
- **Dashboard personalizado** que muestra métricas e historial del usuario.  
- **Gestión de perfil:** edición de datos, cambio de foto de perfil y portada.  
- **Subida de imágenes a Cloudinary** con vista previa en tiempo real.  
- **Autenticación persistente** entre sesiones.  
- **Despliegue automatizado CI/CD** con Vercel.

---

## 🛠️ Tecnologías Utilizadas

| Área | Tecnología |
|------|-------------|
| Frontend | Next.js, React, TypeScript, CSS Modules |
| Backend | Node.js, Express, JWT, Multer |
| Base de datos | TiDB Cloud (MySQL compatible) |
| Almacenamiento | Cloudinary |
| Correo | Nodemailer (Gmail API) |
| Despliegue | Vercel (CI/CD desde GitHub) |
| Entorno | dotenv, cookie-parser, cors |

---

## ⚙️ Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Adrian52507/VERSUS_ME.git
cd VERSUS_ME
```

### 2. Configurar variables de entorno

En las carpetas `/frontend` y `/backend`, crear archivos `.env` con tus credenciales:

#### Backend `.env`
```bash
PORT=4000
MYSQL_URL="mysql://3zkqRsXNygGn9ZQ.root:1eAHQ5oABOSqEsB3@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/versusme_db"
ORIGIN_FRONTEND="http://localhost:3000"
JWT_SECRET="profe_kenny_apruebenos_porfavor"
EMAIL_USER="versusme.general@gmail.com"
EMAIL_PASS="dfiqrvrrmmyvyepv"
CLOUDINARY_CLOUD_NAME=dq5ay5bhv
CLOUDINARY_API_KEY=256284254615627
CLOUDINARY_API_SECRET=y4IJ356XdfcjXdYQZrRS5Z4wyog
```

#### Frontend `.env.local`
```bash
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

---

### 3. Instalar dependencias

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 4. Ejecutar en modo desarrollo

```bash
# En una terminal
cd backend
npm run dev

# En otra terminal
cd frontend
npm run dev
```

Luego abre 👉 **http://localhost:3000**

---

## ☁️ Despliegue en la Nube

El proyecto está actualmente desplegado en **Vercel**, integrando CI/CD directo desde GitHub:

- 🌐 **Frontend:** [https://versusme-frontend.vercel.app](https://versusme-frontend.vercel.app)  
- ⚙️ **Backend:** [https://versusme-backend.vercel.app](https://versusme-backend.vercel.app)

Cada *push* a la rama `main` ejecuta automáticamente la compilación y despliegue.

---

## 🧪 Pruebas y Validación

Se realizaron **10 pruebas funcionales** sobre las principales funcionalidades del sistema (registro, login, edición de perfil, carga de imágenes, logout, etc.) validando:
- Respuestas correctas del backend (`Status 200`, mensajes JSON).  
- Persistencia de datos en la base TiDB Cloud.  
- Correcta visualización de la interfaz tras cada acción.  

📸 Capturas de validación disponibles en el informe académico.

---

## 📁 Estructura del Proyecto

```
VERSUS_ME/
├── backend/
│   ├── src/
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── server.js
│   │   └── db.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── perfil/
│   │   ├── login/
│   │   └── crear_partido/
│   ├── components/
│   │   └── Topbar.tsx
│   ├── styles/
│   └── next.config.ts
│
└── README.md
```

---

## 🔐 Seguridad y Buenas Prácticas

- Tokens JWT cifrados con `JWT_SECRET`.  
- Cookies **HTTP-only** y **SameSite=Lax**.  
- Validación de entradas en backend y frontend.  
- Manejo seguro de credenciales en variables de entorno.  

---

⭐ Si este proyecto te parece interesante, ¡no olvides darle una **Star** en GitHub!
