// Datos del usuario autenticado que se guardan en el contexto
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

// Respuesta del servidor al hacer login o refresh
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Formulario de login
export interface LoginForm {
  email: string;
  password: string;
}

// Formulario de registro
export interface RegisterForm {
  nombre: string;
  email: string;
  password: string;
}
