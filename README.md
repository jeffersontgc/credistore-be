# Credistore Backend (NestJS + GraphQL)

Backend completo para gestionar una pulperia: inventario, clientes, deudas y reportes de ventas. Expone una API GraphQL protegida con JWT, basada en NestJS, TypeORM y PostgreSQL.

## Caracteristicas principales
- GraphQL con Apollo Driver y playground habilitado.
- Autenticacion JWT (estrategias local y JWT); registro publico y resto de operaciones protegidas.
- Modulos de dominio: Usuarios, Productos, Deudas (con items y estados), Reportes diarios/mensuales.
- TypeORM con migraciones y Postgres; validacion global con class-validator.
- Cookies httpOnly, CORS con credenciales, manejo de eventos con EventEmitter.

## Stack
- Node.js 18+, NestJS 11, TypeScript 5
- GraphQL + Apollo, Passport (local/JWT)
- TypeORM + PostgreSQL
- JWT + bcrypt, cookie-parser

## Requisitos previos
- Node.js v18 o superior
- PostgreSQL v14 o superior
- Yarn 1.x

## Inicio rapido
```bash
git clone https://github.com/jeffersontgc/credistore-be.git
cd credistore-be
yarn install
cp .env.example .env   # ajusta tus variables

# crear base de datos (ejemplo)
# psql -U postgres -c "CREATE DATABASE credistore;"

# aplicar migraciones (usa ormconfig y TypeORM DataSource)
yarn migration:run

# modo desarrollo
yarn start:dev
# GraphQL Playground: http://localhost:3000/graphql
```

## Variables de entorno (`.env`)
| Clave | Descripcion | Ejemplo |
| --- | --- | --- |
| PORT | Puerto HTTP | 3000 |
| NODE_ENV | Entorno | development |
| DB_HOST | Host Postgres | localhost |
| DB_PORT | Puerto Postgres | 5432 |
| DB_USERNAME | Usuario | postgres |
| DB_PASSWORD | Password | postgres |
| DB_NAME | Base de datos | credistore |
| JWT_SECRET | Secreto access token | cambia-esto |
| JWT_EXPIRES_IN | Expiracion access token | 1d |
| JWT_REFRESH_SECRET | Secreto refresh token | cambia-esto |
| JWT_REFRESH_EXPIRES_IN | Expiracion refresh token | 7d |

## Scripts utiles
- `yarn start:dev`: servidor en watch mode.
- `yarn start:prod`: corre el build de `dist/` (requiere `yarn build` previo).
- `yarn build`: transpila a `dist/`.
- `yarn test`, `yarn test:e2e`, `yarn test:cov`: pruebas unitarias/e2e/cobertura.
- `yarn lint`, `yarn format`: calidad y formato.
- `yarn migration:generate -- name`: genera migracion con TypeORM (usa `src/database/ormconfig.ts`).
- `yarn migration:run` / `yarn migration:revert`: aplicar o revertir migraciones.

## Arquitectura y modulos
- **Auth**: login (`signIn`) retorna `access_token`, `refresh_token`, `session_uuid` y setea cookies httpOnly; estrategias local/JWT; decorador `@Public()` para operaciones abiertas.
- **Users**: registro (`createUser`) y consultas (`users`, `getUser`).
- **Products**: CRUD, filtros (search, tipo, stock bajo), paginacion y ajustes de stock (aumentar/disminuir).
- **Debts**: crea deudas con items y total, estados (`active`, `pending`, `paid`, `settled`), busqueda por usuario y cambio de estado.
- **Reports**: reportes diarios/mensuales paginados; eventos emitidos desde deudas para actualizar datos.
- **Config/Database**: configuracion centralizada y datasource TypeORM (migraciones en `src/database/migrations`).

### Entidades clave
- `User`: datos basicos, email unico, password hasheado, marca `isDelinquent`.
- `Products`: nombre, precio, stock, tipo (`granos_basicos`, `snacks`, `bebidas`, `lacteos`).
- `Debts`: deuda por usuario, fecha de pago (`date_pay`), monto y estado; relacion con `DebtItem` (producto, cantidad, precio).
- `ReportSalesDaily` / `ReportSalesMonthly`: resumenes agregados de ventas.

## Seguridad y autenticacion
- Registro abierto: `createUser` (publico).
- Resto de resolvers protegidos con `GqlAuthGuard`; envia `Authorization: Bearer <access_token>` o usa las cookies httpOnly emitidas en `signIn`.
- Configura secretos JWT en produccion y ajusta expiraciones segun tu politica de sesiones.

## Ejemplos GraphQL
Auth
```graphql
mutation Register {
  createUser(createUserInput: {
    firstname: "Juan"
    lastname: "Perez"
    email: "juan@correo.com"
    password: "clave123"
  }) {
    status
    message
  }
}

mutation Login {
  signIn(loginUserInput: {
    email: "juan@correo.com"
    password: "clave123"
  }) {
    access_token
    refresh_token
    session_uuid
  }
}
```

Productos
```graphql
mutation {
  createProduct(args: {
    name: "Arroz"
    price: 2.5
    stock: 100
    type: GRANOS_BASICOS
  }) {
    uuid
    name
    price
    stock
  }
}

query {
  products(filters: { search: "arroz", page: 1, limit: 10 }) {
    total
    data { uuid name price stock type createdAt }
  }
}
```

Deudas
```graphql
mutation {
  createDebt(createDebtInput: {
    user_uuid: "user-uuid"
    dueDate: "2025-12-31T00:00:00Z"
    products: [
      { product_uuid: "prod-1", quantity: 2 }
      { product_uuid: "prod-2", quantity: 3 }
    ]
  }) {
    uuid
    amount
    status
    date_pay
    products { quantity price product { name } }
  }
}

mutation {
  updateDebtStatus(uuid: "debt-uuid", status: PAID) {
    uuid
    status
  }
}

query {
  debts(filters: { user_uuid: "user-uuid", status: ACTIVE, page: 1, limit: 10 }) {
    total
    totalAmount
    data { uuid amount status date_pay }
  }
}
```

Reportes
```graphql
query {
  monthlySalesReports(filters: { year: 2025, page: 1, limit: 12 }) {
    total
    data { month year total_sales total_items }
  }
}
```

## Estructura de carpetas (resumen)
```
src/
├─ auth/          # resolvers/servicio JWT y estrategias
├─ users/         # usuarios y registro
├─ products/      # inventario y stock
├─ debts/         # deudas y items
├─ reports/       # reportes diarios/mensuales
├─ database/      # ormconfig y migraciones
├─ common/        # decoradores/guards
├─ config/        # configuracion de entorno
└─ main.ts        # bootstrap NestJS
```

## Despliegue
- Configura variables de entorno para produccion (secrets fuertes, `NODE_ENV=production`).
- Ejecuta `yarn build` y luego `yarn start:prod` (requiere base configurada y migraciones aplicadas).

## Notas
- `synchronize` esta en `false`; usa migraciones para cambios de esquema.
- Ajusta politicas CORS/origenes en `main.ts` si expones la API publicamente.
