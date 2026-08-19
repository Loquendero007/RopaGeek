import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

export default function Contact() {
  const { user, loading } = useAuth();

  return (
    <div style={{
      backgroundColor: "var(--bg-primary)",
      minHeight: "100vh",
      color: "var(--text-primary)",
      fontFamily: "'Inter', sans-serif"
    }}>

      {/* NAVBAR */}
      <Navbar user={user} activePage="contacto" />

      <div style={{
        textAlign: "center",
        marginTop: "50px"
      }}>

        <h1 style={{
          fontSize: "55px",
          marginBottom: "15px",
          color: "var(--text-primary)"
        }}>
          CONTACTO
        </h1>

        <p style={{
          color: "#888",
          fontSize: "18px"
        }}>
          Información oficial de la tienda.
        </p>

      </div>



      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        flexWrap: "wrap",
        marginTop: "80px",
        padding: "0 20px"
      }}>


        <div style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "15px",
          padding: "40px",
          width: "300px",
          textAlign: "center"
        }}>

          <h2 style={{
            marginBottom: "20px",
            color: "var(--text-primary)"
          }}>
            WhatsApp
          </h2>

          <a
            href="https://wa.me/5216531037700"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#25D366",
              fontSize: "18px",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            +5216531037700
          </a>

        </div>


        <div style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "15px",
          padding: "40px",
          width: "300px",
          textAlign: "center"
        }}>

          <h2 style={{
            marginBottom: "20px",
            color: "var(--text-primary)"
          }}>
            Correo
          </h2>

          <p style={{
            color: "#888",
            fontSize: "18px"
          }}>
            RopaGeek000@gmail.com
          </p>

        </div>


        <div style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "15px",
          padding: "40px",
          width: "300px",
          textAlign: "center"
        }}>

          <h2 style={{
            marginBottom: "20px",
            color: "var(--text-primary)"
          }}>
            Ubicación
          </h2>

          <p style={{
            color: "#888",
            fontSize: "18px"
          }}>
            Morelia, Michoacán
          </p>

        </div>

      </div>

    </div>
  );
}
