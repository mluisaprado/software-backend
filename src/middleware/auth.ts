import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_super_seguro_cambialo";

interface JwtPayload {
  id: number;
  email: string;
}

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "No se proporcionó token de autenticación",
      });
      return;
    }

    // Extraer el token
    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Agregar usuario al request
    req.user = decoded;

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Token inválido",
      });
      return;
    }

    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expirado",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al verificar token",
      error: error.message,
    });
  }
};



