import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "tu_secreto_super_seguro_cambialo";

// Registro de usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    // Validar que todos los campos estén presentes
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
      return;
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
      return;
    }

    // Crear el usuario (la contraseña se encripta automáticamente con el hook)
    const user = await User.create({
      name,
      email,
      password,
    });
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture || null,
        token,
      },
    });
  } catch (error: any) {
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

// Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    // Validar campos
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
      return;
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
      return;
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture || null,
        token,
      },
    });
  } catch (error: any) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

// Obtener perfil del usuario autenticado
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener perfil",
      error: error.message,
    });
  }
};

// Subir/actualizar foto de perfil
export const uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No se proporcionó ninguna imagen",
      });
      return;
    }

    // Obtener usuario actual
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    // Si el usuario ya tiene una foto de perfil, eliminar la anterior
    if (user.profile_picture) {
      const oldPicturePath = path.join(
        __dirname,
        "../../uploads/profile-pictures",
        path.basename(user.profile_picture)
      );
      
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Guardar la ruta relativa de la nueva imagen
    const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;

    // Actualizar el usuario con la nueva foto
    await user.update({ profile_picture: imageUrl });

    res.status(200).json({
      success: true,
      message: "Foto de perfil actualizada exitosamente",
      data: {
        profile_picture: imageUrl,
      },
    });
  } catch (error: any) {
    console.error("Error al subir foto de perfil:", error);
    
    // Si hay un error y se subió un archivo, eliminarlo
    if (req.file) {
      const filePath = path.join(__dirname, "../../uploads/profile-pictures", req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: "Error al subir foto de perfil",
      error: error.message,
    });
  }
};

