/// <reference types="jest" />
import type { Request, Response } from "express";
import {
  listMessagesForTripAndUser,
  sendMessage,
} from "../src/controllers/messageController";

jest.mock("../src/models/Message", () => ({
  Message: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("../src/models/Trip", () => ({
  Trip: {
    findByPk: jest.fn(),
  },
}));

jest.mock("../src/models/User", () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
  },
}));

const { Message } = jest.requireMock("../src/models/Message") as {
  Message: {
    findAll: jest.Mock;
    create: jest.Mock;
  };
};

const { Trip } = jest.requireMock("../src/models/Trip") as {
  Trip: {
    findByPk: jest.Mock;
  };
};

const mockedUser = jest.requireMock("../src/models/User").default as {
  findByPk: jest.Mock;
};

const findAllMock = Message.findAll;
const createMock = Message.create;
const findByPkTripMock = Trip.findByPk;
const findByPkUserMock = mockedUser.findByPk;

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("messageController.listMessagesForTripAndUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar 401 si no hay usuario autenticado", async () => {
    const req = {
      params: { tripId: "1", otherUserId: "2" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listMessagesForTripAndUser(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("debe retornar 400 si los parámetros son inválidos", async () => {
    const req = {
      user: { id: 1, email: "test@example.com" },
      params: { tripId: "invalid", otherUserId: "2" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listMessagesForTripAndUser(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("debe retornar 404 si el viaje no existe", async () => {
    findByPkTripMock.mockResolvedValueOnce(null);

    const req = {
      user: { id: 1, email: "test@example.com" },
      params: { tripId: "1", otherUserId: "2" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listMessagesForTripAndUser(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("debe retornar 200 con los mensajes", async () => {
    findByPkTripMock.mockResolvedValueOnce({ id: 1 });
    findAllMock.mockResolvedValueOnce([]);

    const req = {
      user: { id: 1, email: "test@example.com" },
      params: { tripId: "1", otherUserId: "2" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listMessagesForTripAndUser(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: [],
      })
    );
  });
});

describe("messageController.sendMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar 401 si no hay usuario autenticado", async () => {
    const req = {
      body: { tripId: 1, receiverId: 2, content: "Hello" },
    } as Partial<Request>;
    const res = createMockResponse();

    await sendMessage(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("debe retornar 400 si faltan campos requeridos", async () => {
    const req = {
      user: { id: 1, email: "test@example.com" },
      body: { tripId: 1 },
    } as Partial<Request>;
    const res = createMockResponse();

    await sendMessage(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("debe retornar 404 si el viaje no existe", async () => {
    findByPkTripMock.mockResolvedValueOnce(null);

    const req = {
      user: { id: 1, email: "test@example.com" },
      body: { tripId: 1, receiverId: 2, content: "Hello" },
    } as Partial<Request>;
    const res = createMockResponse();

    await sendMessage(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("debe retornar 404 si el receptor no existe", async () => {
    findByPkTripMock.mockResolvedValueOnce({ id: 1 });
    findByPkUserMock.mockResolvedValueOnce(null);

    const req = {
      user: { id: 1, email: "test@example.com" },
      body: { tripId: 1, receiverId: 2, content: "Hello" },
    } as Partial<Request>;
    const res = createMockResponse();

    await sendMessage(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("debe crear el mensaje y retornar 201", async () => {
    findByPkTripMock.mockResolvedValueOnce({ id: 1 });
    findByPkUserMock.mockResolvedValueOnce({ id: 2 });
    createMock.mockResolvedValueOnce({ id: 1, content: "Hello" });

    const req = {
      user: { id: 1, email: "test@example.com" },
      body: { tripId: 1, receiverId: 2, content: "Hello" },
    } as Partial<Request>;
    const res = createMockResponse();

    await sendMessage(req as Request, res);

    expect(createMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Mensaje enviado",
      })
    );
  });
});

