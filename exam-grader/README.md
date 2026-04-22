# Sistema de Exámenes

## Instalación

### 1. Backend
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Configuración de email (opcional)

Edita `backend/.env`:
- `EMAIL_USER`: tu email de Gmail
- `EMAIL_PASS`: contraseña de aplicación de Gmail (no tu contraseña normal)
  - Activar en: Google Account → Seguridad → Verificación en 2 pasos → Contraseñas de aplicación

## Uso

1. Ve a http://localhost:5173
2. Como **docente**: entra en /login o /register
3. Como **alumno**: ingresa el código de materia en la página principal
