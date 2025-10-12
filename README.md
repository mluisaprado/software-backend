# 🧠 Software Backend

Backend desarrollado con **Node.js**, **Express**, **TypeScript** y **PostgreSQL**, diseñado para servir como API REST base para aplicaciones móviles o web (como *software-frontend*).

---

## 🚀 Tecnologías principales

- **Node.js** – entorno de ejecución JavaScript
- **Express** – framework web minimalista
- **TypeScript** – tipado estático y desarrollo seguro
- **Sequelize** – ORM para interactuar con PostgreSQL
- **PostgreSQL** – base de datos relacional
- **dotenv** – manejo de variables de entorno
- **ts-node-dev** – recarga automática en desarrollo

---

## ⚙️ Configuración del entorno

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/mluisaprado/software-backend.git
cd software-backend
2️⃣ Instalar dependencias
bash
Copiar código
npm install
3️⃣ Configurar variables de entorno
Crea un archivo .env en la raíz del proyecto con las siguientes variables:

env
Copiar código
PORT=4000

DB_NAME=santiago
DB_USER=software
DB_PASS=software1234
DB_HOST=localhost
DB_DIALECT=postgres
4️⃣ Configurar la base de datos en PostgreSQL
sql
Copiar código
CREATE USER software WITH PASSWORD 'software1234';
CREATE DATABASE santiago OWNER software;
GRANT ALL PRIVILEGES ON DATABASE santiago TO software;
▶️ Modo desarrollo
bash
Copiar código
npm run dev
El servidor iniciará en:
📍 http://localhost:4000

Deberías ver en la consola:

css
Copiar código
✅ Conectado a PostgreSQL correctamente
Servidor escuchando en puerto 4000
🧩 Estructura del proyecto
bash
Copiar código
software-backend/
├─ src/
│  ├─ config/
│  │   └─ database.ts       # Conexión a PostgreSQL
│  ├─ controllers/          # Controladores de rutas
│  ├─ models/               # Modelos Sequelize
│  ├─ routes/               # Definición de rutas
│  └─ index.ts              # Servidor principal Express
├─ .env                     # Variables de entorno
├─ package.json
├─ tsconfig.json
└─ README.md
🧠 Scripts disponibles
Comando	Descripción
npm run dev	Ejecuta el servidor en modo desarrollo
npm run build	Compila el código TypeScript en dist/
npm start	Ejecuta el código compilado (producción)
