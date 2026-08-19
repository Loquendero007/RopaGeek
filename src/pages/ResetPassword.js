import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ error }) => {
        if (!error) {
          setValidToken(true);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError("Error al actualizar la contraseña. Intenta de nuevo.");
      return;
    }

    setSuccess("Contraseña actualizada correctamente. Redirigiendo...");
    setTimeout(() => navigate("/login"), 2000);
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: "12px",
    border: "1px solid #e0e0e0", backgroundColor: "white",
    color: "black", fontSize: "15px", boxSizing: "border-box"
  };

  const btnPrimary = {
    width: "100%", padding: "16px", backgroundColor: "#00d4ff",
    color: "#000", border: "none", borderRadius: "12px",
    fontWeight: 700, cursor: "pointer", fontSize: "16px"
  };

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
      <Navbar user={null} />

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "40px" }}>
        <div style={{
          backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "20px",
          padding: "50px", width: "100%", maxWidth: "450px"
        }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#888", fontSize: "14px" }}>Verificando enlace...</p>
          ) : !validToken ? (
            <>
              <h2 style={{ textAlign: "center", marginBottom: "15px", fontSize: "28px", color: "#000000" }}>Enlace inválido</h2>
              <p style={{ textAlign: "center", color: "#888", fontSize: "14px", marginBottom: "25px" }}>
                El enlace para restablecer la contraseña no es válido o ya expiró.
              </p>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button style={btnPrimary}>Volver al inicio de sesión</button>
              </Link>
            </>
          ) : (
            <form onSubmit={handleReset}>
              <h2 style={{ textAlign: "center", marginBottom: "15px", fontSize: "28px", color: "#000000" }}>Nueva Contraseña</h2>
              <p style={{ textAlign: "center", color: "#888", fontSize: "13px", marginBottom: "25px", lineHeight: "1.6" }}>
                Ingresa tu nueva contraseña para actualizar tu cuenta.
              </p>

              <input
                type="password" placeholder="Nueva contraseña (mínimo 6 caracteres)"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                maxLength={19} required style={{ ...inputStyle, marginBottom: "14px" }}
              />
              <input
                type="password" placeholder="Confirmar contraseña"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={19} required style={{ ...inputStyle, marginBottom: "20px" }}
              />

              {error && (
                <p style={{ color: "#e74c3c", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>{error}</p>
              )}
              {success && (
                <p style={{ color: "#2ecc71", fontSize: "14px", marginBottom: "15px", textAlign: "center" }}>{success}</p>
              )}

              <button type="submit" style={btnPrimary}>Actualizar Contraseña</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
