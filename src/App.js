import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import { CartProvider } from "./CartContext";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Ropa from "./pages/Ropa";
import Profile from "./pages/Profile";
import NuevaPrenda from "./pages/NuevaPrenda";
import Lista from "./pages/Lista";
import Usuarios from "./pages/Usuarios";
import Cart from "./pages/Cart";
import ResetPassword from "./pages/ResetPassword";
import Pedidos from "./pages/Pedidos";

function App() {

  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/ropa"
            element={<Ropa />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/nueva-prenda"
            element={<NuevaPrenda />}
          />

          <Route
            path="/lista"
            element={<Lista />}
          />

          <Route
            path="/usuarios"
            element={<Usuarios />}
          />

          <Route
            path="/carrito"
            element={<Cart />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/pedidos"
            element={<Pedidos />}
          />

        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
