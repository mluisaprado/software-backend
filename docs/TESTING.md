# Documentación de Testing

## 📋 Índice

1. [Introducción](#introducción)
2. [Configuración](#configuración)
3. [Ejecutar Tests](#ejecutar-tests)
4. [Estructura de Tests](#estructura-de-tests)
5. [Cobertura de Código](#cobertura-de-código)
6. [Guía para Escribir Tests](#guía-para-escribir-tests)
7. [Tests Existentes](#tests-existentes)
8. [Mejores Prácticas](#mejores-prácticas)

---

## Introducción

Este proyecto utiliza **Jest** como framework de testing y **ts-jest** para ejecutar tests de TypeScript. Los tests están organizados en el directorio `tests/` y cubren los controladores principales de la aplicación.

### Tecnologías Utilizadas

- **Jest**: Framework de testing para JavaScript/TypeScript
- **ts-jest**: Preset de Jest para TypeScript
- **@types/jest**: Tipos de TypeScript para Jest

---

## Configuración

### Archivos de Configuración

- **`jest.config.ts`**: Configuración principal de Jest
- **`tests/setup.ts`**: Configuración inicial que se ejecuta antes de cada test

### Configuración Actual

```typescript
// jest.config.ts
{
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
}
```

---

## Ejecutar Tests

### Comandos Disponibles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (se re-ejecutan al cambiar archivos)
npm run test:watch

# Ejecutar tests con cobertura
npm test -- --coverage

# Ejecutar un archivo de test específico
npm test -- tests/authController.test.ts

# Ejecutar tests que coincidan con un patrón
npm test -- --testNamePattern="debe retornar 401"
```

### Salida de Tests

Los tests muestran:
- ✅ Tests que pasan
- ❌ Tests que fallan
- 📊 Reporte de cobertura de código
- ⏱️ Tiempo de ejecución

---

## Estructura de Tests

### Organización de Archivos

```
tests/
├── setup.ts                    # Configuración global
├── authController.test.ts      # Tests de autenticación
├── userController.test.ts      # Tests de usuarios
├── tripController.test.ts       # Tests de viajes
├── reservationController.test.ts # Tests de reservas
└── messageController.test.ts   # Tests de mensajes
```

### Estructura de un Test

```typescript
/// <reference types="jest" />
import type { Request, Response } from "express";
import { functionToTest } from "../src/controllers/controller";

// Mock de modelos
jest.mock("../src/models/Model", () => ({
  Model: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe("Controller.functionToTest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar 200 cuando todo es válido", async () => {
    // Arrange: Preparar datos
    const req = { /* ... */ } as Request;
    const res = createMockResponse();

    // Act: Ejecutar función
    await functionToTest(req, res);

    // Assert: Verificar resultados
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
```

---

## Cobertura de Código

### Ver Cobertura

```bash
npm test -- --coverage
```

### Reporte de Cobertura

El reporte muestra:
- **Statements**: Porcentaje de líneas ejecutadas
- **Branches**: Porcentaje de ramas condicionales cubiertas
- **Functions**: Porcentaje de funciones ejecutadas
- **Lines**: Porcentaje de líneas cubiertas

### Cobertura Actual

Los tests actuales cubren:
- ✅ `authController.ts`: 100% de cobertura
- ✅ `userController.ts`: 100% de cobertura
- ⚠️ `tripController.ts`: ~60% de cobertura
- ⚠️ `reservationController.ts`: ~60% de cobertura
- ⚠️ `messageController.ts`: ~91% de cobertura

### Ver Reporte HTML

Después de ejecutar con `--coverage`, puedes abrir:
```
coverage/lcov-report/index.html
```

---

## Guía para Escribir Tests

### 1. Crear un Nuevo Archivo de Test

```typescript
// tests/newController.test.ts
/// <reference types="jest" />
import type { Request, Response } from "express";
import { newFunction } from "../src/controllers/newController";

// Mock de dependencias
jest.mock("../src/models/Model", () => ({
  Model: {
    findOne: jest.fn(),
  },
}));

describe("newController.newFunction", () => {
  // Tests aquí
});
```

### 2. Mockear Modelos

```typescript
jest.mock("../src/models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));

const mockedUser = jest.requireMock("../src/models/User").default;
```

### 3. Crear Mock de Request/Response

```typescript
function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

const req = {
  user: { id: 1, email: "test@example.com" },
  body: { /* datos */ },
  params: { id: "1" },
} as Partial<Request>;
```

### 4. Casos de Test Comunes

#### Test de Autenticación (401)
```typescript
it("debe retornar 401 si no hay usuario autenticado", async () => {
  const req = {} as Partial<Request>;
  const res = createMockResponse();

  await functionToTest(req as Request, res);

  expect(res.status).toHaveBeenCalledWith(401);
});
```

#### Test de Validación (400)
```typescript
it("debe retornar 400 si faltan campos requeridos", async () => {
  const req = {
    user: { id: 1, email: "test@example.com" },
    body: { /* campos incompletos */ },
  } as Partial<Request>;
  const res = createMockResponse();

  await functionToTest(req as Request, res);

  expect(res.status).toHaveBeenCalledWith(400);
});
```

#### Test de Éxito (200/201)
```typescript
it("debe retornar 200 cuando todo es válido", async () => {
  mockedModel.findOne.mockResolvedValueOnce({ id: 1 });

  const req = { /* datos válidos */ } as Partial<Request>;
  const res = createMockResponse();

  await functionToTest(req as Request, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
    })
  );
});
```

#### Test de Error (500)
```typescript
it("debe manejar errores internos del servidor", async () => {
  mockedModel.findOne.mockRejectedValueOnce(new Error("DB error"));

  const req = { /* datos */ } as Partial<Request>;
  const res = createMockResponse();

  await functionToTest(req as Request, res);

  expect(res.status).toHaveBeenCalledWith(500);
});
```

### 5. Múltiples Llamadas a la Misma Función

Si un controlador llama a la misma función mockeada varias veces:

```typescript
mockedModel.findAll
  .mockResolvedValueOnce([]) // Primera llamada
  .mockResolvedValueOnce([]); // Segunda llamada

// Verificar que se llamó el número correcto de veces
expect(mockedModel.findAll).toHaveBeenCalledTimes(2);
```

---

## Tests Existentes

### `authController.test.ts`

Tests para autenticación:
- ✅ Registro de usuario
- ✅ Login de usuario
- ✅ Obtener perfil
- ✅ Validación de campos
- ✅ Manejo de errores

**Cobertura**: 100%

### `userController.test.ts`

Tests para usuarios:
- ✅ Obtener usuario por ID
- ✅ Validación de ID inválido
- ✅ Usuario no encontrado
- ✅ Manejo de errores

**Cobertura**: 100%

### `tripController.test.ts`

Tests para viajes:
- ✅ Crear viaje
- ✅ Listar viajes
- ✅ Validación de campos
- ✅ Filtros de búsqueda
- ✅ Manejo de errores

**Cobertura**: ~60%

### `reservationController.test.ts`

Tests para reservas:
- ✅ Listar reservas de un viaje
- ✅ Aceptar reserva
- ✅ Rechazar reserva
- ✅ Listar próximos viajes
- ✅ Validación de permisos

**Cobertura**: ~60%

### `messageController.test.ts`

Tests para mensajes:
- ✅ Listar mensajes entre usuarios
- ✅ Enviar mensaje
- ✅ Validación de parámetros
- ✅ Manejo de errores

**Cobertura**: ~91%

---

## Mejores Prácticas

### 1. Nombres Descriptivos

```typescript
// ✅ Bueno
it("debe retornar 401 si no hay usuario autenticado", async () => {
  // ...
});

// ❌ Malo
it("test 1", async () => {
  // ...
});
```

### 2. Arrange-Act-Assert (AAA)

```typescript
it("debe crear un usuario", async () => {
  // Arrange: Preparar
  const req = { body: { name: "Test", email: "test@example.com" } };
  const res = createMockResponse();

  // Act: Ejecutar
  await createUser(req, res);

  // Assert: Verificar
  expect(res.status).toHaveBeenCalledWith(201);
});
```

### 3. Limpiar Mocks

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 4. Testear Casos Edge

- Valores nulos/undefined
- Strings vacíos
- Números negativos
- IDs inválidos
- Errores de base de datos

### 5. Mockear Dependencias Externas

Siempre mockear:
- Modelos de base de datos
- Servicios externos
- Middleware de autenticación (cuando sea necesario)

### 6. Verificar Llamadas

```typescript
// Verificar que se llamó con los parámetros correctos
expect(mockedModel.create).toHaveBeenCalledWith({
  name: "Test",
  email: "test@example.com",
});

// Verificar número de llamadas
expect(mockedModel.findOne).toHaveBeenCalledTimes(1);
```

### 7. Testear Respuestas Completas

```typescript
expect(res.json).toHaveBeenCalledWith(
  expect.objectContaining({
    success: true,
    data: expect.objectContaining({
      id: 1,
      name: "Test",
    }),
  })
);
```

---

## Ejemplos Completos

### Ejemplo 1: Test de Controlador Simple

```typescript
/// <reference types="jest" />
import type { Request, Response } from "express";
import { getUserById } from "../src/controllers/userController";
import User from "../src/models/User";

jest.mock("../src/models/User", () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
  },
}));

const mockedUser = User as jest.Mocked<typeof User>;

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("userController.getUserById", () => {
  beforeEach(() => {
    mockedUser.findByPk.mockReset();
  });

  it("debe retornar 200 y el usuario", async () => {
    const mockUser = { id: 1, name: "Test", email: "test@example.com" };
    mockedUser.findByPk.mockResolvedValueOnce(mockUser);

    const req = { params: { id: "1" } } as Partial<Request>;
    const res = createMockResponse();

    await getUserById(req as Request, res);

    expect(mockedUser.findByPk).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });
});
```

### Ejemplo 2: Test con Autenticación

```typescript
it("debe retornar 401 si no hay usuario autenticado", async () => {
  const req = {} as Partial<Request>;
  const res = createMockResponse();

  await protectedFunction(req as Request, res);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      message: "No autorizado",
    })
  );
});
```

---

## Troubleshooting

### Error: "Cannot read properties of undefined"

**Causa**: Mock no configurado correctamente o función llamada múltiples veces.

**Solución**: Verificar que todos los mocks estén configurados y que se mockeen todas las llamadas necesarias.

```typescript
// Si se llama 2 veces, mockear 2 veces
mockedFunction
  .mockResolvedValueOnce(value1)
  .mockResolvedValueOnce(value2);
```

### Error: "Type 'X' is not assignable to type 'Y'"

**Causa**: Tipos incorrectos en los mocks.

**Solución**: Usar `as Partial<Request>` o `as jest.Mocked<typeof Model>`.

### Tests Lentos

**Causa**: Tests que hacen llamadas reales a la base de datos.

**Solución**: Asegurarse de que todos los modelos estén mockeados.

---

## Recursos Adicionales

- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [ts-jest](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Contribuir

Al agregar nuevos tests:
1. Seguir la estructura existente
2. Mantener cobertura alta (>80%)
3. Incluir casos edge
4. Documentar casos especiales
5. Ejecutar `npm test` antes de hacer commit

---

**Última actualización**: Diciembre 2024

