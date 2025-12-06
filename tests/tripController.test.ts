/// <reference types="jest" />
import type { Request, Response } from "express";
import { createTrip, listTrips } from "../src/controllers/tripController";

jest.mock("../src/models/Reservation", () => ({
  Reservation: {
    findOne: jest.fn(),
  },
}));

jest.mock("../src/models/Trip", () => {
  const tripModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    associations: { driver: {} },
  };
  return { Trip: tripModel };
});

const { Trip } = jest.requireMock("../src/models/Trip") as {
  Trip: {
    create: jest.Mock;
    findAll: jest.Mock;
    associations: { driver: unknown };
  };
};

const createMock = Trip.create;
const findAllMock = Trip.findAll;

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("tripController.createTrip", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("debe devolver 401 si no hay usuario autenticado", async () => {
    const req = {
      body: {},
    } as Partial<Request> & { user?: { id: number } };

    const res = createMockResponse();

    await createTrip(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("debe validar campos obligatorios", async () => {
    const req = {
      user: { id: 1, email: "test@example.com" },
      body: {
        origin: "",
      },
    } as Partial<Request> & { user: { id: number; email: string } };

    const res = createMockResponse();

    await createTrip(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("debe crear el viaje cuando los datos son válidos", async () => {
    createMock.mockResolvedValueOnce({ id: 1 });

    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();

    const req = {
      user: { id: 1, email: "test@example.com" },
      body: {
        origin: "Lima",
        destination: "Cusco",
        departure_time: futureDate,
        price_per_seat: 40,
        total_seats: 4,
        available_seats: 4,
      },
    } as Partial<Request> & { user: { id: number; email: string } };

    const res = createMockResponse();

    await createTrip(req as Request, res);

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 1,
        origin: "Lima",
        destination: "Cusco",
        price_per_seat: 40,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("tripController.listTrips", () => {
  beforeEach(() => {
    findAllMock.mockReset();
  });

  it("debe devolver 400 si la fecha es inválida", async () => {
    const req = {
      query: { date: "fecha" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listTrips(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "date debe ser una fecha válida (YYYY-MM-DD)",
      })
    );
  });

  it("debe listar viajes con filtros", async () => {
    const trips = [
      { id: 1, origin: "Lima", destination: "Cusco" },
    ];
    findAllMock.mockResolvedValueOnce(trips);

    const req = {
      query: { origin: "li", destination: "cu" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listTrips(req as Request, res);

    expect(findAllMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "published" }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: trips })
    );
  });

  it("debe listar viajes sin filtros", async () => {
    findAllMock.mockResolvedValueOnce([]);

    const req = {
      query: {},
    } as Partial<Request>;
    const res = createMockResponse();

    await listTrips(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("debe retornar 500 si hay un error", async () => {
    findAllMock.mockRejectedValueOnce(new Error("Database error"));

    const req = {
      query: {},
    } as Partial<Request>;
    const res = createMockResponse();

    await listTrips(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("tripController.createTrip - casos adicionales", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("debe retornar 400 si total_seats es menor o igual a 0", async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();

    const req = {
      user: { id: 1, email: "test@example.com" },
      body: {
        origin: "Lima",
        destination: "Cusco",
        departure_time: futureDate,
        price_per_seat: 40,
        total_seats: 0,
      },
    } as Partial<Request> & { user: { id: number; email: string } };
    const res = createMockResponse();

    await createTrip(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("debe retornar 400 si available_seats es mayor que total_seats", async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();

    const req = {
      user: { id: 1, email: "test@example.com" },
      body: {
        origin: "Lima",
        destination: "Cusco",
        departure_time: futureDate,
        price_per_seat: 40,
        total_seats: 4,
        available_seats: 5,
      },
    } as Partial<Request> & { user: { id: number; email: string } };
    const res = createMockResponse();

    await createTrip(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("debe retornar 500 si hay un error al crear", async () => {
    createMock.mockRejectedValueOnce(new Error("Database error"));

    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();

    const req = {
      user: { id: 1, email: "test@example.com" },
      body: {
        origin: "Lima",
        destination: "Cusco",
        departure_time: futureDate,
        price_per_seat: 40,
        total_seats: 4,
      },
    } as Partial<Request> & { user: { id: number; email: string } };
    const res = createMockResponse();

    await createTrip(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
