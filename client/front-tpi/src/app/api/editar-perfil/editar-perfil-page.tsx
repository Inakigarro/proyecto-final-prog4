import { useState } from "react";

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
      isValid = false;
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Ingrese un email válido";
      isValid = false;
    }

    setErrors(newErrors);

    return isValid;
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateForm()) return;

    console.log("Perfil actualizado:", formData);

    alert("Perfil actualizado correctamente");
  };

  return (
    <div className="container">
      <h1>Editar Perfil</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && (
            <p className="error">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="error">{errors.email}</p>
          )}
        </div>

        <button type="submit">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}

