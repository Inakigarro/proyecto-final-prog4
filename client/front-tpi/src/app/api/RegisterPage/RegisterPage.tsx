import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    // Validación email
    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingrese un email válido";
    }

    // Validación password
    if (!password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 8) {
      newErrors.password =
        "La contraseña debe tener al menos 8 caracteres";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    alert("Registro validado correctamente");

    // Aquí iría la llamada a la API
    console.log({
      email,
      password,
    });
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h1>Registro</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese su email"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "4px",
            }}
          />

          {errors.email && (
            <p style={{ color: "red", marginTop: "4px" }}>
              {errors.email}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "4px",
            }}
          />

          {errors.password && (
            <p style={{ color: "red", marginTop: "4px" }}>
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}

