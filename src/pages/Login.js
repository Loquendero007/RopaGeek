import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

export default function Login() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError("Correo o contraseña incorrectos");
      return;
    }

    if (!data.user) {
      setLoginError("Error al iniciar sesión");
      return;
    }

    const { data: userData } = await supabase
      .from("usuarios")
      .select("rol, nombre")
      .eq("id", data.user.id)
      .single();

    setUser({
      email: data.user.email,
      name: userData?.nombre || data.user.email,
      role: userData?.rol || "user"
    });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail) {
      setForgotError("Ingresa tu correo electrónico");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: window.location.origin + "/reset-password",
    });

    if (error) {
      setForgotError("Error al enviar el correo. Verifica tu dirección.");
      return;
    }

    setForgotSuccess("Revisa tu correo para restablecer tu contraseña.");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setRegError("Todos los campos son obligatorios");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError("Las contraseñas no coinciden");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
    });

    if (error) {
      console.error(error);
      return;
    }

    const { count } = await supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true });

    const rol = count === 0 ? "owner" : "user";

    const { error: insertError } = await supabase
      .from("usuarios")
      .insert([
        {
          id: data.user.id,
          nombre: regName,
          email: regEmail,
          rol: rol,
        },
      ]);

    if (insertError) {
      console.error(insertError);
    }

    setRegSuccess("Cuenta creada correctamente. Revisa tu correo para confirmar tu cuenta.");
    setRegName("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirm("");
    setTimeout(() => setTab("login"), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    backgroundColor: "white",
    color: "black",
    fontSize: "15px",
    boxSizing: "border-box"
  };

  const btnPrimary = {
    width: "100%",
    padding: "16px",
    backgroundColor: "#00d4ff",
    color: "#000",
    border: "none",
    borderRadius: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "16px"
  };

  if (user) {
    return (
      <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
        <Navbar user={user} activePage="" />

        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          minHeight: "75vh", padding: "40px"
        }}>
          <div style={{
            backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "20px",
            padding: "50px", width: "100%", maxWidth: "450px", textAlign: "center"
          }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              backgroundColor: "#e0e0e0", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 25px", fontSize: "36px"
            }}>
              👤
            </div>
            <h2 style={{ marginBottom: "8px", color: "#000000" }}>Hola, {user.name}</h2>
            <p style={{ color: "#666666", marginBottom: "10px", fontSize: "14px" }}>{user.email}</p>
            {user.role === "owner" && (
              <span style={{
                backgroundColor: "white", border: "1px solid #8e44ad", borderRadius: "8px",
                padding: "5px 14px", fontSize: "13px", color: "#8e44ad", display: "inline-block", marginBottom: "25px", fontWeight: 700
              }}>
                Owner
              </span>
            )}
            {user.role === "admin" && (
              <span style={{
                backgroundColor: "white", border: "1px solid #2980b9", borderRadius: "8px",
                padding: "5px 14px", fontSize: "13px", color: "#2980b9", display: "inline-block", marginBottom: "25px", fontWeight: 700
              }}>
                Administrador
              </span>
            )}
            {user.role === "user" && (
              <span style={{
                backgroundColor: "white", border: "1px solid #ddd", borderRadius: "8px",
                padding: "5px 14px", fontSize: "13px", color: "#555555", display: "inline-block", marginBottom: "25px", fontWeight: 700
              }}>
                Usuario
              </span>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
              <Link to="/" style={{ textDecoration: "none" }}>
                <button style={btnPrimary}>Volver al Inicio</button>
              </Link>
              <button onClick={handleLogout} style={{
                width: "100%", padding: "16px", backgroundColor: "transparent", color: "#ff4757",
                border: "2px solid #ff4757", borderRadius: "12px", fontWeight: 700,
                cursor: "pointer", fontSize: "16px"
              }}>Cerrar Sesión</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
      <Navbar user={null} activePage="" />

        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          minHeight: "80vh", padding: "40px"
        }}>
          <div style={{
            backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "20px",
            padding: "50px", width: "100%", maxWidth: "450px"
          }}>

          <div style={{ display: "flex", marginBottom: "35px", backgroundColor: "#e0e0e0", borderRadius: "12px", padding: "4px" }}>
            <button
              onClick={() => { setTab("login"); setLoginError(""); }}
              style={{
                flex: 1, padding: "12px", borderRadius: "10px", border: "none", fontWeight: 700,
                cursor: "pointer", fontSize: "15px",
                backgroundColor: tab === "login" ? "white" : "transparent",
                color: tab === "login" ? "black" : "#888",
                boxShadow: tab === "login" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setTab("register"); setRegError(""); setRegSuccess(""); }}
              style={{
                flex: 1, padding: "12px", borderRadius: "10px", border: "none", fontWeight: 700,
                cursor: "pointer", fontSize: "15px",
                backgroundColor: tab === "register" ? "white" : "transparent",
                color: tab === "register" ? "black" : "#888",
                boxShadow: tab === "register" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
              }}
            >
              Crear Cuenta
            </button>
          </div>

          {tab === "login" && (
            <form onSubmit={handleLogin}>
              <h2 style={{ textAlign: "center", marginBottom: "25px", fontSize: "28px", color: "#000000" }}>Bienvenido</h2>

              <input
                type="email" placeholder="Correo electrónico"
                value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                required style={{ ...inputStyle, marginBottom: "14px" }}
              />
              <input
                type="password" placeholder="Contraseña"
                value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                required style={{ ...inputStyle, marginBottom: "20px" }}
              />

              {loginError && (
                <p style={{ color: "#e74c3c", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>
                  {loginError}
                </p>
              )}

              <button type="submit" style={{ ...btnPrimary, marginBottom: "18px" }}>Entrar</button>

              <p style={{ textAlign: "center", color: "#888", fontSize: "14px", marginBottom: "10px" }}>
                <span onClick={() => { setTab("forgot"); setForgotError(""); setForgotSuccess(""); setForgotEmail(loginEmail); }}
                  style={{ color: "#000000", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}>
                  ¿Olvidaste tu contraseña?
                </span>
              </p>

              <p style={{ textAlign: "center", color: "#888", fontSize: "14px" }}>
                ¿No tienes cuenta?{" "}
                <span onClick={() => { setTab("register"); setLoginError(""); }}
                  style={{ color: "#000000", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}>
                  Regístrate aquí
                </span>
              </p>
            </form>
          )}

          {tab === "register" && (
            <form onSubmit={handleRegister}>
              <h2 style={{ textAlign: "center", marginBottom: "15px", fontSize: "28px", color: "#000000" }}>Crear Cuenta</h2>
              <p style={{ textAlign: "center", color: "#888", fontSize: "13px", marginBottom: "25px", lineHeight: "1.6" }}>No es necesario una cuenta para poder ver nuestros maravillosos productos, pero nos gustaría saber tu opinión.</p>

              <input
                type="text" placeholder="Nombre de usuario"
                value={regName} onChange={(e) => setRegName(e.target.value)}
                maxLength={30}
                required style={{ ...inputStyle, marginBottom: "14px" }}
              />
              <input
                type="email" placeholder="Correo electrónico"
                value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                maxLength={40}
                required style={{ ...inputStyle, marginBottom: "14px" }}
              />
              <input
                type="password" placeholder="Contraseña (mínimo 6 caracteres)"
                value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                maxLength={19}
                required style={{ ...inputStyle, marginBottom: "14px" }}
              />
              <input
                type="password" placeholder="Confirmar contraseña"
                value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                maxLength={19}
                required style={{ ...inputStyle, marginBottom: "20px" }}
              />

              {regError && (
                <p style={{ color: "#e74c3c", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>
                  {regError}
                </p>
              )}
              {regSuccess && (
                <p style={{ color: "#2ecc71", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>
                  {regSuccess}
                </p>
              )}

              <button type="submit" style={{ ...btnPrimary, marginBottom: "18px" }}>Crear Cuenta</button>

              <p style={{ textAlign: "center", color: "#888", fontSize: "14px" }}>
                ¿Ya tienes cuenta?{" "}
                <span onClick={() => { setTab("login"); setRegError(""); setRegSuccess(""); }}
                  style={{ color: "#000000", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}>
                  Inicia sesión
                </span>
              </p>
            </form>
          )}

          {tab === "forgot" && (
            <form onSubmit={handleForgotPassword}>
              <h2 style={{ textAlign: "center", marginBottom: "15px", fontSize: "28px", color: "#000000" }}>Recuperar Contraseña</h2>
              <p style={{ textAlign: "center", color: "#888", fontSize: "13px", marginBottom: "25px", lineHeight: "1.6" }}>
                Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
              </p>

              <input
                type="email" placeholder="Correo electrónico"
                value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                required style={{ ...inputStyle, marginBottom: "20px" }}
              />

              {forgotError && (
                <p style={{ color: "#e74c3c", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>
                  {forgotError}
                </p>
              )}
              {forgotSuccess && (
                <p style={{ color: "#2ecc71", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>
                  {forgotSuccess}
                </p>
              )}

              <button type="submit" style={{ ...btnPrimary, marginBottom: "18px" }}>Enviar Correo</button>

              <p style={{ textAlign: "center", color: "#888", fontSize: "14px" }}>
                <span onClick={() => { setTab("login"); setForgotError(""); setForgotSuccess(""); }}
                  style={{ color: "#000000", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}>
                  Volver al inicio de sesión
                </span>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
