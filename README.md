# 🏥 Backend ISSS Citas - Node.js + Express + PostgreSQL

## 📌 Arquitectura del Proyecto

Este backend está construido utilizando una **arquitectura en capas (Layered Architecture)**.

### 🧱 Capas utilizadas

1. **Routes (Rutas)**
2. **Controllers (Controladores)**
3. **Services (Servicios)**
4. **Models (Modelos)**
5. **Database (PostgreSQL)**

---

## 🧠 ¿Qué es arquitectura en capas?

Es un patrón donde cada parte del sistema tiene una responsabilidad específica.

👉 Beneficios:

- Código organizado
- Fácil mantenimiento
- Escalable
- Reutilizable

---

## 🔄 Flujo completo del sistema

A continuación se explica paso a paso qué ocurre cuando el cliente (Postman o Android) hace una petición.

---

## 🚀 Ejemplo: Login de usuario

### 1. 📡 Cliente (Postman / Android)

Hace una petición HTTP:

```
POST /api/auth/login
```

Envía en el body:

```json
{
  "email": "usuario@test.com",
  "password": "123456"
}
```

---

### 2. 🧭 Route (auth.routes.js)

Recibe la petición y la dirige al controller:

```js
router.post("/login", authController.login);
```

---

### 3. 🎮 Controller (auth.controller.js)

Responsable de:

- Recibir request
- Validar datos básicos
- Llamar al service
- Enviar respuesta

```js
const { email, password } = req.body;
const data = await authService.login(email, password);
```

---

### 4. ⚙️ Service (auth.service.js)

Responsable de:

- Lógica de negocio
- Validaciones
- Generación de JWT

```js
const user = await usuarioModel.findByEmail(email);

const valid = await bcrypt.compare(password, user.password_hash);

const token = jwt.sign(
  { id: user.id, rol: user.rol_id },
  process.env.JWT_SECRET,
  { expiresIn: "8h" },
);
```

---

### 5. 🗄️ Model (usuario.model.js)

Responsable de:

- Ejecutar queries SQL
- Acceder a la base de datos

```js
const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
  email,
]);
```

---

### 6. 🐘 Base de Datos (PostgreSQL)

Ejecuta la consulta y devuelve los datos.

---

### 7. 🔙 Respuesta al cliente

El controller responde:

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "nombre": "Diego" },
    "token": "JWT..."
  }
}
```

---

## 🔐 Middleware (Autenticación)

Se usa para proteger rutas.

### 📌 Flujo del middleware

1. Cliente envía token en headers:

```
Authorization: Bearer TOKEN
```

2. Middleware:

```js
const token = req.headers["authorization"];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
```

3. Permite acceso a la ruta si es válido

---

## 📅 Ejemplo: Crear Cita

### Flujo:

1. Cliente envía request
2. Middleware valida token
3. Controller recibe
4. Service ejecuta lógica
5. Model inserta en DB
6. Se usa transacción (BEGIN / COMMIT / ROLLBACK)

---

## 🔄 Uso de Transacciones

Se usan para asegurar integridad de datos.

```js
const client = await pool.connect();

try {
  await client.query("BEGIN");

  await client.query("INSERT INTO citas ...");

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
} finally {
  client.release();
}
```

---

## 🧠 Buenas prácticas implementadas

- Separación de responsabilidades
- Uso de JWT para autenticación
- Uso de bcrypt para contraseñas
- Uso de transacciones en operaciones críticas
- Uso de variables de entorno (.env)

---

## 📱 Preparado para Android

Este backend está diseñado para ser consumido con Retrofit:

- Respuestas en JSON
- Uso de tokens
- Endpoints REST

---

## 🏁 Conclusión

El proyecto utiliza una **arquitectura en capas**, donde cada componente tiene una responsabilidad clara.

Esto permite:

- Escalar el sistema
- Mantener código limpio
- Facilitar integración con aplicaciones móviles

---

## 🚀 Autor

Proyecto académico - Ingeniería en Desarrollo de Software
