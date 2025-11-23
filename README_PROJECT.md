# Credistore Backend - Gestor de Pulpería

A complete NestJS backend application with GraphQL API for managing a store (pulpería), including inventory, customers, and debts.

## Features

- **JWT Authentication** with httpOnly cookies
- **GraphQL API** with Apollo Server
- **TypeORM** with PostgreSQL
- **Modular Architecture**:
  - Auth (Login/Registration)
  - Users (Customers/Guarantors)
  - Products (Inventory management)
  - Debts (Multi-product debt tracking)

## Tech Stack

- NestJS v11+
- GraphQL with Apollo Server
- TypeORM with PostgreSQL
- JWT for authentication
- bcrypt for password hashing
- class-validator & class-transformer

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd credistore-be
```

2. Install dependencies:
```bash
yarn install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=credistore
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

5. Create the PostgreSQL database:
```bash
psql -U postgres
CREATE DATABASE credistore;
```

## Running the Application

### Development mode
```bash
yarn start:dev
```

### Production mode
```bash
yarn build
yarn start:prod
```

The application will be available at:
- API: http://localhost:3000
- GraphQL Playground: http://localhost:3000/graphql

## GraphQL API

### Authentication

#### Register a new user
```graphql
mutation {
  createUser(createUserInput: {
    firstname: "John"
    lastname: "Doe"
    email: "john@example.com"
    password: "password123"
  }) {
    id
    email
    firstname
    lastname
  }
}
```

#### Login
```graphql
mutation {
  signIn(loginUserInput: {
    email: "john@example.com"
    password: "password123"
  }) {
    access_token
    refresh_token
    session_uuid
  }
}
```

### Products

#### Create a product
```graphql
mutation {
  createProducto(createProductoInput: {
    name: "Arroz"
    price: 2.50
    stock: 100
    type: GRANOS_BASICOS
  }) {
    id
    name
    price
    stock
    type
  }
}
```

#### Get all products
```graphql
query {
  productos {
    id
    name
    price
    stock
    type
  }
}
```

### Debts

#### Create a debt with multiple products
```graphql
mutation {
  createDeuda(createDeudaInput: {
    usuarioId: 1
    fechaPagar: "2025-12-31T00:00:00Z"
    productos: [
      { productoId: 1, cantidad: 2 }
      { productoId: 2, cantidad: 3 }
    ]
  }) {
    id
    monto
    status
    fechaPagar
    usuario {
      firstname
      lastname
    }
    productos {
      cantidad
      precioUnitario
      producto {
        name
      }
    }
  }
}
```

#### Get all debts
```graphql
query {
  deudas {
    id
    monto
    status
    fechaPagar
    usuario {
      firstname
      lastname
      email
    }
    productos {
      cantidad
      precioUnitario
      producto {
        name
        price
      }
    }
  }
}
```

#### Get debts by user
```graphql
query {
  deudasByUsuario(usuarioId: 1) {
    id
    monto
    status
    fechaPagar
  }
}
```

#### Update debt status
```graphql
mutation {
  updateDeudaStatus(id: 1, status: PAGADA) {
    id
    status
  }
}
```

## Database Schema

### Entities

1. **User** - Customer/Guarantor information
2. **Producto** - Product inventory
3. **Deuda** - Debt records
4. **DeudaItem** - Individual products in a debt

### Enums

- **ProductoType**: `GRANOS_BASICOS`, `SNACKS`, `BEBIDAS`, `LACTEOS`
- **DeudaStatus**: `ACTIVA`, `PENDIENTE`, `PAGADA`, `SALDADA`

## Project Structure

```
src/
├── config/                 # Configuration module
├── common/                 # Shared resources
│   ├── decorators/        # Custom decorators (Public)
│   └── guards/            # Auth guards (GqlAuthGuard)
├── modules/
│   ├── auth/              # Authentication module
│   ├── users/             # Users module
│   ├── productos/         # Products module
│   └── deudas/            # Debts module
├── app.module.ts
├── main.ts
└── schema.gql             # Auto-generated GraphQL schema

database/
└── ormconfig.ts           # TypeORM configuration
```

## Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## Development Commands

```bash
# Format code
yarn format

# Lint code
yarn lint

# Build
yarn build
```

## Security Features

- JWT tokens stored in httpOnly cookies
- Password hashing with bcrypt
- CORS enabled with credentials support
- Input validation with class-validator
- SQL injection protection via TypeORM

## Notes

- Set `synchronize: false` in production (app.module.ts TypeORM config)
- Change JWT secrets in production
- Stock is automatically decreased when creating debts
- All GraphQL queries (except signIn and createUser) require authentication

## License

UNLICENSED
