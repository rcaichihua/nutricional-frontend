import { useState } from "react";
import ChangePassword from "./ChangePassword";

// Placeholder de administración de usuarios (puedes reemplazarlo luego)
function UsersAdmin() {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">Administración de usuarios</h2>
      <p>Próximamente: crear/editar usuarios, roles y asignar sucursales.</p>
    </div>
  );
}

export default function SecurityPanel() {
  const [subTab, setSubTab] = useState("users"); // "users" | "password"

  const btn = (id, label) => (
    <button
      onClick={() => setSubTab(id)}
      className={`px-3 py-2 rounded-lg text-sm font-medium ${
        subTab === id
          ? "bg-yellow-400 text-gray-900"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        {btn("users", "Usuarios")}
        {btn("password", "Cambiar contraseña")}
      </div>

      {subTab === "users" && <UsersAdmin />}
      {subTab === "password" && <ChangePassword />}
    </section>
  );
}
