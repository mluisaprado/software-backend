/// <reference types="jest" />
import type { Request, Response } from "express";
import { register, login } from "../src/controllers/authController";
import User from "../src/models/User";
import jwt from "jsonwebtoken";

jest.mock("../src/models/User", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

type MockedUser = {
  findOne: jest.Mock;
  create: jest.Mock;
};

const mockedUser = User as unknown as MockedUser;

const mockedJwt = jwt as unknown as { sign: jest.Mock };
mockedJwt.sign = jest.fn().mockReturnValue("mock-token");

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("authController.register", () => {
  it("debe retornar 400 si faltan campos requeridos", async () => {
    const req = { body: { email: "test@example.com", password: "secret" } } as Partial<Request>;
    const res = createMockResponse();

    await register(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Todos los campos son requeridos",
      })
    );
  });

  it("debe retornar 400 si el email ya está registrado", async () => {
    mockedUser.findOne.mockResolvedValueOnce({ id: 1 });

    const req = {
      body: { name: "Test", email: "test@example.com", password: "secret" },
    } as Partial<Request>;
    const res = createMockResponse();

    await register(req as Request, res);

    expect(mockedUser.findOne).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "El email ya está registrado",
      })
    );
  });

  it("debe crear el usuario y retornar 201", async () => {
    mockedUser.findOne.mockResolvedValueOnce(null);
    mockedUser.create.mockResolvedValueOnce({
      id: 1,
      name: "Test",
      email: "test@example.com",
    });

    const req = {
      body: { name: "Test", email: "test@example.com", password: "secret" },
    } as Partial<Request>;
    const res = createMockResponse();

    await register(req as Request, res);

    expect(mockedUser.create).toHaveBeenCalledWith({
      name: "Test",
      email: "test@example.com",
      password: "secret",
    });
    expect(mockedJwt.sign).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          id: 1,
          name: "Test",
          email: "test@example.com",
          token: "mock-token",
        }),
      })
    );
  });
});

describe("authController.login", () => {
  it("debe retornar 400 si faltan credenciales", async () => {
    const req = { body: { email: "" } } as Partial<Request>;
    const res = createMockResponse();

    await login(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("debe retornar 401 si el usuario no existe", async () => {
    mockedUser.findOne.mockResolvedValueOnce(null);

    const req = {
      body: { email: "test@example.com", password: "secret" },
    } as Partial<Request>;
    const res = createMockResponse();

    await login(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Credenciales inválidas",
      })
    );
  });

  it("debe retornar 401 si la contraseña es incorrecta", async () => {
    mockedUser.findOne.mockResolvedValueOnce({
      comparePassword: jest.fn().mockResolvedValue(false),
    });

    const req = {
      body: { email: "test@example.com", password: "secret" },
    } as Partial<Request>;
    const res = createMockResponse();

    await login(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("debe retornar 200 y el token cuando las credenciales son válidas", async () => {
    mockedUser.findOne.mockResolvedValueOnce({
      id: 1,
      name: "Test",
      email: "test@example.com",
      comparePassword: jest.fn().mockResolvedValue(true),
    });

    const req = {
      body: { email: "test@example.com", password: "secret" },
    } as Partial<Request>;
    const res = createMockResponse();

    await login(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ token: "mock-token" }),
      })
    );
  });
});
