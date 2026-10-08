# 📚 Sistema de Biblioteca

Aplicación web para gestionar una biblioteca: catálogo de libros, registro de lectores, préstamos con reglas de negocio y un panel de estadísticas.

- **Backend:** API REST en **Laravel 13** (PHP 8.3) + **MySQL**
- **Frontend:** **React 19** + **Vite**
- **Pruebas:** 29 pruebas automáticas (PHPUnit)

---

## Contenido

1. [Funcionalidades](#funcionalidades)
2. [Decisiones técnicas](#decisiones-técnicas)
3. [Arquitectura](#arquitectura)
4. [Instalación](#instalación)
5. [Pruebas](#pruebas)
6. [Endpoints de la API](#endpoints-de-la-api)
7. [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
8. [Mejoras futuras](#mejoras-futuras)

---

## Funcionalidades

### Libros
- CRUD completo con búsqueda (título, autor o género), filtro por disponibilidad y ordenamiento por columna.
- Géneros desde un **catálogo cerrado** (evita duplicados como "Novela" / "novela" que distorsionarían las estadísticas). 
- La disponibilidad **no se edita a mano**: la actualiza automáticamente el flujo de préstamos.

### Lectores
- CRUD con validación de correo (único) y teléfono opcional.
- Muestra préstamos **activos** (`2 / 3`), vencidos e histórico de cada lector.

### Préstamos y reglas de negocio
| Regla | En la interfaz | Respuesta de la API |
|---|---|---|
| Solo se presta un libro disponible | El selector solo muestra libros disponibles | `409 Conflict` |
| Máximo **3 préstamos activos** por lector | El lector aparece deshabilitado en el selector | `409 Conflict` |
| Un lector con préstamos **vencidos** no puede pedir otro | El lector aparece deshabilitado con el motivo | `409 Conflict` |
| Plazo máximo de **30 días** | El calendario solo permite fechas entre hoy y +30 días | `422 Unprocessable` |
| Un préstamo no se devuelve dos veces | El botón "Devolver" solo aparece en préstamos activos | `409 Conflict` |
| No se eliminan libros prestados ni libros/lectores con historial | Se muestra el motivo en una notificación | `409 Conflict` |

**Defensa en profundidad:** el frontend *previene* los errores para una mejor experiencia, pero el backend *hace cumplir* las reglas siempre, porque la API puede recibir peticiones de otros clientes (Postman, scripts) o de pantallas desactualizadas (por ejemplo, dos pestañas abiertas). Estas reglas están cubiertas por pruebas automáticas.

> "Vencido" no se guarda en la base de datos: se **calcula** a partir de la fecha límite, así nunca queda desactualizado.

### Estadísticas
| Indicador | Pregunta que responde |
|---|---|
| Libros, % de disponibilidad, préstamos activos y vencidos | ¿Cómo está la biblioteca hoy? |
| % de devoluciones a tiempo | ¿Los lectores cumplen los plazos? |
| Top géneros y libros más prestados | ¿Qué le gusta a los lectores comprar? |
| Lectores más activos | ¿Quiénes usan más la biblioteca? |
| Préstamos por mes (últimos 6) | ¿El uso está creciendo? |

---

## Decisiones técnicas

| Decisión | Motivo |
|---|---|
| **Laravel + React** | Ligeros en recursos (desarrollo en un equipo de 8 GB de RAM), la demanda en estas tecnologías y Laravel trae ORM, migraciones y validación integrados. |
| **Capa de servicios** (`LoanService`, `StatisticService`) | Los controladores solo reciben la petición y responden; las reglas de negocio quedan en un lugar reutilizable y fácil de probar. |
| **Form Requests** | La validación sale del controlador. |
| **Transacción + `lockForUpdate`** al prestar | Evita que dos peticiones simultáneas presten el mismo libro. |
| **Tabla `members`** separada de `users` | `users` es para autenticación (requiere contraseña); los lectores son otra entidad. |
| **Proxy de Vite** (`/api` → Laravel) | Evita problemas de CORS en desarrollo. |
| **Cliente HTTP propio** con `fetch` | Un solo lugar para manejar errores (servidor caído, 422, 409, 404) sin librerías extra. |
| **CSS propio**, mobile-first | Sin frameworks, para demostrar el uso de HTML y CSS. En móvil las tablas se convierten en tarjetas. |
| **Accesibilidad** | Etiquetas asociadas a campos, errores con `aria-describedby`, `aria-sort` en tablas, enlace "Saltar al contenido", foco visible y alternativa en tabla para el gráfico. |

---

## Arquitectura

```
Navegador ──► React (Vite :5173) ──proxy /api──► Laravel (:8000) ──► MySQL
```

**Recorrido de una petición en el backend:**

```
Ruta (routes/api.php)
  └─► Form Request   valida el formato de los datos        → 422 si falla
       └─► Controller   recibe y responde
            └─► Service    aplica las reglas de negocio    → 409 si se viola una regla
                 └─► Model     lee y escribe en la base de datos
```

**Estructura del repositorio (monorepo):**

```
├── library-backend/           API Laravel
│   ├── app/
│   │   ├── Exceptions/        BusinessRuleException (→ 409)
│   │   ├── Http/Controllers/  Book, Member, Loan, Statistic
│   │   ├── Http/Requests/     Validaciones
│   │   ├── Models/            Book, Member, Loan
│   │   └── Services/          LoanService, StatisticService
│   ├── database/              Migraciones, factories y seeder
│   ├── lang/es/               Mensajes de validación en español
│   └── tests/                 Pruebas Feature y Unit
└── library-frontend/          React
    └── src/
        ├── api/               Cliente HTTP y funciones por recurso
        ├── components/        Formularios, tabla ordenable, notificaciones, gráficos
        ├── hooks/             useApi, useSort
        ├── pages/             Estadísticas, Libros, Lectores, Préstamos
        └── utils/             Formato de fechas y reglas de préstamo
```

**Modelo de datos:**

```
books (1)      ---------------< loans >---------------     (1) members
  id, title, author,       id, book_id, member_id,       id, name,
  genre, is_available      loan_date, due_date,          email (único), phone
                           return_date, status
```

---

## Instalación

### Requisitos
- PHP 8.3+ y Composer
- MySQL 8 (por ejemplo con [Laragon](https://laragon.org/) o XAMPP)
- Node.js 20+ y npm

### 1. Backend

```bash
cd library-backend
composer install
cp .env.example .env
php artisan key:generate
```

Crea una base de datos vacía llamada `library_system` y revisa las credenciales `DB_*` en `.env` (por defecto: usuario `root` sin contraseña). Luego:

```bash
php artisan migrate --seed     # crea las tablas y carga datos de demostración
php artisan serve              # API en http://127.0.0.1:8000
```

El seeder crea 20 libros, 10 lectores y 37 préstamos (activos, devueltos y vencidos) para ver el sistema con datos reales.

### 2. Frontend (en otra terminal)

```bash
cd library-frontend
npm install
npm run dev                    # http://localhost:5173
```

> Ambos servidores deben estar corriendo al mismo tiempo.

---

## Pruebas

```bash
cd library-backend
php artisan test
```

Las pruebas usan una base de datos **SQLite en memoria** (configurada en `phpunit.xml`) que se crea y se destruye en cada prueba, así que nunca modifican los datos de MySQL.

| Archivo | Qué cubre |
|---|---|
| `tests/Feature/BookApiTest.php` | CRUD, catálogo de géneros, disponibilidad protegida, reglas de eliminación, 404 |
| `tests/Feature/MemberApiTest.php` | Registro, correo único, contadores de préstamos, reglas de eliminación |
| `tests/Feature/LoanApiTest.php` | Todas las reglas de préstamo y devolución |
| `tests/Feature/StatisticApiTest.php` | KPIs, base vacía (sin división por cero), ranking de géneros |
| `tests/Unit/LoanTest.php` | Cálculo de préstamo vencido |

---

## Endpoints de la API

Base: `http://127.0.0.1:8000/api`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/books` | Listar libros |
| POST | `/books` | Crear libro |
| GET | `/books/{id}` | Ver libro |
| PUT | `/books/{id}` | Editar libro |
| DELETE | `/books/{id}` | Eliminar libro (409 si está prestado o tiene historial) |
| GET | `/genres` | Catálogo de géneros |
| GET | `/members` | Listar lectores con contadores de préstamos |
| POST | `/members` | Registrar lector |
| GET | `/members/{id}` | Ver lector con su historial |
| PUT | `/members/{id}` | Editar lector |
| DELETE | `/members/{id}` | Eliminar lector (409 si tiene préstamos) |
| GET | `/loans` | Listar préstamos con libro y lector |
| POST | `/loans` | Registrar préstamo |
| POST | `/loans/{id}/return` | Registrar devolución |
| GET | `/statistics` | Indicadores y rankings del dashboard |

**Ejemplo — registrar un préstamo:**

```http
POST /api/loans
Content-Type: application/json

{ "book_id": 1, "member_id": 3, "due_date": "2026-10-20" }
```

**Códigos de respuesta:** `200` OK · `201` creado · `404` no existe · `409` regla de negocio · `422` datos inválidos.

---

## Flujo de trabajo con Git

- `main`: versión estable.
- `feature/backend` y `feature/frontend`: ramas de desarrollo, integradas a `main` mediante **Pull Requests**.
- Commits con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat:`, `fix:`, `test:`, `chore:`, `docs:`.

---

## Mejoras futuras

Limitaciones identificadas que quedaron fuera del alcance de esta prueba:

| Mejora | Motivo | Enfoque propuesto |
|---|---|---|
| **Ejemplares por libro** | Una biblioteca real tiene varias copias de un mismo título | Nueva tabla `book_copies` (código, estado); los préstamos apuntarían al ejemplar |
| **Documento de identidad del lector** | Dos personas pueden llamarse igual y el correo puede cambiar | Columna `document_number` única |
| **Borrado lógico** | Hoy no se pueden eliminar libros con historial | `SoftDeletes` de Laravel para archivar sin perder estadísticas |
| **Autenticación y roles** | Actualmente la API es abierta | Laravel Sanctum + roles (administrador / bibliotecario) |
| **Paginación en el servidor** | Con miles de registros, filtrar en el navegador es lento | `paginate()` y parámetros `?page=&search=` |
| **Pruebas del frontend** | Hoy solo el backend tiene pruebas automáticas | Vitest + React Testing Library |
