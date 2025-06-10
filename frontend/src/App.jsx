import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login"; // O la ruta adecuada según tu estructura de carpetas

import Files from "./pages/Files";
import SubirArchivoPage from "./pages/SubirArchivoPage";

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Files />} />
          <Route path="/dashboard" element={<Files />} />
          <Route path="/subir-archivo" element={<SubirArchivoPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/files" element={<Files />} />
          <Route path="/perfil/permiso/:dato" element={<Dashboard />} />
          <Route path="/perfil/:dato" element={<Dashboard />} />
          <Route path="/perfil" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
