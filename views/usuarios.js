const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const saltRounds = 10;

// Middleware de verificación de token (movido aquí para proteger todas las rutas de usuarios)
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    jwt.verify(bearerToken, process.env.JWT_SECRET || 'dev_secret', (err, authData) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
      }
      req.user = authData;
      next();
    });
  } else {
    res.status(401).json({ error: 'Token de autenticación no provisto' });
  }
};

module.exports = (pool, bcrypt) => {
  // Obtener todos los usuarios
  router.get('/', verifyToken, async (req, res) => {
    const sql = 'SELECT * FROM usuarios_new WHERE activo = TRUE';
    try {
      const [results] = await pool.query(sql);
      res.json(results);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  });

  // Obtener todos los usuarios con datos extendidos (para profesores, etc.)
  router.get('/full', verifyToken, async (req, res) => {
    const sql = `
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.tipo_usuario,
        u.fecha_creacion,
        u.activo,
        u.nivel_educativo,
        p.especialidad,
        p.titulo,
        p.fecha_contratacion,
        p.colegio_id
      FROM usuarios_new u
      LEFT JOIN profesores p ON u.id = p.usuario_id
      WHERE u.activo = TRUE
      ORDER BY u.nombre, u.apellido;
    `;
    const [results] = await pool.query(sql);
    res.json(results);
  });

  // Crear nuevo usuario
  router.post('/', verifyToken, async (req, res) => {
    const { nombre, apellido, email, password, tipo_usuario, nivel_educativo, especialidad, titulo, fecha_contratacion, colegio_id } = req.body;

    if (!nombre || !apellido || !email || !password || !tipo_usuario) {
      return res.status(400).json({ error: "Faltan campos obligatorios para el usuario." });
    }

    if (tipo_usuario === 'profesor' && (!especialidad || !colegio_id)) {
      return res.status(400).json({ error: "Para un profesor, la especialidad y el colegio son obligatorios." });
    }

    try {
      // Verificar si el email ya existe
      const [existingUser] = await pool.query('SELECT id FROM usuarios_new WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return res.status(409).json({ error: 'El email ya está en uso.' });
      }

      // Hashear la contraseña
      const hash = await bcrypt.hash(password, saltRounds);

      // Iniciar transacción
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Insertar en usuarios_new
        // CORREGIDO: Se usan las variables desestructuradas y se asegura que los campos opcionales sean null si no existen.
        const sqlUsuario = 'INSERT INTO usuarios_new (nombre, apellido, email, password, tipo_usuario, nivel_educativo, dni) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const values = [nombre, apellido, email, hash, tipo_usuario, nivel_educativo || null, req.body.dni || null];
        const [result] = await connection.query(sqlUsuario, values);
        const usuarioId = result.insertId;

        // Si es alumno, profesor o DAI, crear registro en tabla correspondiente
        if (tipo_usuario === 'alumno' || tipo_usuario === 'dai') {
          if (!colegio_id) {
            // Si es alumno, el colegio_id es obligatorio.
            throw new Error('El colegio es obligatorio para crear un alumno.');
          }
          // CORREGIDO: Se inserta el usuario y el colegio_id.
          await connection.query('INSERT INTO alumnos (usuario_id, colegio_id) VALUES (?, ?)', [usuarioId, colegio_id]);
          console.log(`Registro de alumno creado para el usuario ID: ${usuarioId}`);

        } else if (tipo_usuario === 'profesor') {
          const sqlProfesor = 'INSERT INTO profesores (usuario_id, especialidad, titulo, fecha_contratacion, colegio_id) VALUES (?, ?, ?, ?, ?)';
          await connection.query(sqlProfesor, [usuarioId, especialidad, titulo, fecha_contratacion, colegio_id]);
          console.log(`Registro de profesor creado para el usuario ID: ${usuarioId}`);

        }

        // Confirmar transacción
        await connection.commit();
        connection.release();

        res.status(201).json({ id: usuarioId, message: 'Usuario creado exitosamente' });

      } catch (error) {
        // Revertir transacción en caso de error
        await connection.rollback();
        connection.release();
        console.error('Error en la transacción de creación de usuario:', error);
        res.status(500).json({ error: 'Error al crear el registro detallado del usuario.' });
      }

    } catch (error) {
      console.error('Error al crear usuario:', error);
      // Manejar error de email duplicado (ER_DUP_ENTRY)
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El email ya está registrado.' });
      }
      res.status(500).json({ error: 'Error en el servidor al crear el usuario.' });
    }
  });

  // Actualizar usuario
  router.put('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, email, tipo_usuario, especialidad, titulo, fecha_contratacion, colegio_id } = req.body;

    if (!nombre || !apellido || !email || !tipo_usuario) {
      return res.status(400).json({ error: "Faltan campos obligatorios para el usuario." });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Verificar si el email ya existe en otro usuario
      const [existingUser] = await connection.query('SELECT id FROM usuarios_new WHERE email = ? AND id != ?', [email, id]);
      if (existingUser.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(409).json({ error: 'El email ya está en uso por otro usuario.' });
      }

      // Actualizar tabla usuarios_new
      const sqlUsuario = 'UPDATE usuarios_new SET nombre = ?, apellido = ?, email = ?, tipo_usuario = ? WHERE id = ?';
      await connection.query(sqlUsuario, [nombre, apellido, email, tipo_usuario, id]);

      // Si es un profesor, actualizar su tabla específica
      if (tipo_usuario === 'profesor') {
        const sqlProfesor = 'UPDATE profesores SET especialidad = ?, titulo = ?, fecha_contratacion = ?, colegio_id = ? WHERE usuario_id = ?';
        await connection.query(sqlProfesor, [especialidad, titulo, fecha_contratacion, colegio_id, id]);
      }
      // Aquí podrías añadir lógica para actualizar alumnos, DAI, etc.

      await connection.commit();
      connection.release();

      res.json({ message: 'Usuario actualizado exitosamente' });

    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error en la transacción de actualización de usuario:', error);
      res.status(500).json({ error: 'Error al actualizar el usuario.' });
    }
  });

  // Eliminar usuario (marcar como inactivo)
  router.delete('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const sql = 'UPDATE usuarios_new SET activo = FALSE WHERE id = ?';
    try {
      await pool.query(sql, [id]);
      res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  });

  return router;
};