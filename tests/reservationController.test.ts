/// <reference types="jest" />
import type { Request, Response } from "express";

jest.mock("../src/models/Reservation", () => ({
  Reservation: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock("../src/models/Trip", () => ({
  Trip: {
    findByPk: jest.fn(),
    associations: { driver: {} },
  },
}));

jest.mock("../src/models/User", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("../src/models/Calification", () => ({
  Calification: {
    associations: {},
  },
}));

import {
  listReservationsForTrip,
  acceptReservation,
  rejectReservation,
  listMyUpcomingTrips,
} from "../src/controllers/reservationController";

const { Reservation } = jest.requireMock("../src/models/Reservation") as {
  Reservation: {
    findAll: jest.Mock;
    findByPk: jest.Mock;
  };
};

const { Trip } = jest.requireMock("../src/models/Trip") as {
  Trip: {
    findByPk: jest.Mock;
    associations: { driver: unknown };
  };
};

const findAllMock = Reservation.findAll;
const findByPkReservationMock = Reservation.findByPk;
const findByPkTripMock = Trip.findByPk;

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe("reservationController.listReservationsForTrip", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar 401 si no hay usuario autenticado", async () => {
    const req = {
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listReservationsForTrip(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("debe retornar 400 si el id de viaje es inválido", async () => {
    const req = {
      user: { id: 1, email: "test@example.com" },
      params: { id: "invalid" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listReservationsForTrip(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("debe retornar 404 si el viaje no existe", async () => {
    findByPkTripMock.mockResolvedValueOnce(null);

    const req = {
      user: { id: 1, email: "test@example.com" },
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listReservationsForTrip(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("debe retornar 403 si el usuario no es el conductor", async () => {
    findByPkTripMock.mockResolvedValueOnce({ user_id: 999 });

    const req = {
      user: { id: 1, email: "test@example.com" },
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listReservationsForTrip(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("debe retornar 200 con las reservas si el usuario es el conductor", async () => {
    const mockTrip = { user_id: 1 };
    findByPkTripMock.mockResolvedValueOnce(mockTrip);
    findAllMock.mockResolvedValueOnce([]);

    const req = {
      user: { id: 1, email: "test@example.com" },
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listReservationsForTrip(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: [],
      })
    );
  });
});

describe("reservationController.acceptReservation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar 401 si no hay usuario autenticado", async () => {
    const req = {
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await acceptReservation(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("debe retornar 404 si la reserva no existe", async () => {
    findByPkReservationMock.mockResolvedValueOnce(null);

    const req = {
      user: { id: 1, email: "test@example.com" },
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await acceptReservation(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("debe retornar 400 si la reserva ya fue gestionada", async () => {
    const mockReservation = {
      status: "confirmed",
      trip: { user_id: 1 },
      save: jest.fn(),
    };
    findByPkReservationMock.mockResolvedValueOnce(mockReservation);

    const req = {
      user: { id: 1, email: "test@example.com" },
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await acceptReservation(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("reservationController.rejectReservation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar 401 si no hay usuario autenticado", async () => {
    const req = {
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await rejectReservation(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("debe retornar 404 si la reserva no existe", async () => {
    findByPkReservationMock.mockResolvedValueOnce(null);

    const req = {
      user: { id: 1, email: "test@example.com" },
      params: { id: "1" },
    } as Partial<Request>;
    const res = createMockResponse();

    await rejectReservation(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("reservationController.listMyUpcomingTrips", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe retornar 401 si no hay usuario autenticado", async () => {
    const req = {} as Partial<Request>;
    const res = createMockResponse();

    await listMyUpcomingTrips(req as Request, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("debe retornar 200 con lista de viajes", async () => {
    // Mock ambas llamadas: una para pasajero y otra para conductor
    findAllMock
      .mockResolvedValueOnce([]) // Como pasajero
      .mockResolvedValueOnce([]); // Como conductor

    const req = {
      user: { id: 1, email: "test@example.com" },
    } as Partial<Request>;
    const res = createMockResponse();

    await listMyUpcomingTrips(req as Request, res);

    expect(findAllMock).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.any(Array),
      })
    );
  });
});

