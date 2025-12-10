/// <reference types="jest" />
import type { Request, Response } from "express";

jest.mock("../src/models/User", () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
  },
}));

jest.mock("../src/models/Trip", () => ({
  Trip: {
    associations: {},
  },
}));

jest.mock("../src/models/Calification", () => ({
  Calification: {
    associations: {},
  },
}));

import { getUserById } from "../src/controllers/userController";
import User from "../src/models/User";

type MockedUser = {
  findByPk: jest.Mock;
};

const mockedUser = User as unknown as MockedUser;

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("userController.getUserById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar 400 si el id es inválido", async () => {
    const req = {
      params: { id: "invalid" },
    } as Partial<Request>;
    const res = createMockResponse();

    await getUserById(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "ID de usuario inválido",
      })
    );
  });

  it("debe retornar 404 si el usuario no existe", async () => {
    mockedUser.findByPk.mockResolvedValueOnce(null);

    const req = {
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await getUserById(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Usuario no encontrado",
      })
    );
  });

  it("debe retornar 200 con el usuario sin password", async () => {
    const mockUser = {
      id: 1,
      name: "Test",
      email: "test@example.com",
      password: "hashed",
      toJSON: jest.fn().mockReturnValue({
        id: 1,
        name: "Test",
        email: "test@example.com",
        password: "hashed",
      }),
    };
    mockedUser.findByPk.mockResolvedValueOnce(mockUser);

    const req = {
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await getUserById(req as Request, res);

    expect(mockedUser.findByPk).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        name: "Test",
        email: "test@example.com",
      })
    );
    expect(res.json).not.toHaveBeenCalledWith(
      expect.objectContaining({
        password: expect.anything(),
      })
    );
  });

  it("debe retornar 500 si hay un error", async () => {
    mockedUser.findByPk.mockRejectedValueOnce(new Error("Database error"));

    const req = {
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await getUserById(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Error interno del servidor",
      })
    );
  });
});



