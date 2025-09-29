export const getProfile = async (req, res) => {
  res.json({ message: "Perfil de usuario" });
};

export const updateProfile = async (req, res) => {
  res.json({ message: "Perfil actualizado" });
};

export const changePassword = async (req, res) => {
  res.json({ message: "Contraseña cambiada" });
};
