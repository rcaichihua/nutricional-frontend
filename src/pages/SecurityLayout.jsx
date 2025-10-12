import { NavLink, Outlet } from "react-router-dom";

export default function SecurityLayout() {
  const tab = (to, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-medium ${
          isActive ? "bg-yellow-400 text-gray-900" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <section className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        {tab("usuarios", "Usuarios")}
        {tab("cambiar-password", "Cambiar contraseña")}
      </div>
      <Outlet />
    </section>
  );
}
