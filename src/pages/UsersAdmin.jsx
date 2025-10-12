// src/pages/UsersAdmin.jsx
import { useEffect, useState } from "react";
import { useUsuarios } from "../hooks/useUsuarios";
import { listSucursalesLite } from "../api/users"; // o desde src/api/sucursales si lo separaste
import { Plus, Trash2, Save, X } from "lucide-react";

const ROLES = ["ADMIN", "NUTRI", "OPERADOR"];

export default function UsersAdmin() {
  // del hook: listado + estados + CRUD
  const { usuarios, loading, error, create, update, remove } = useUsuarios(true);

  // sucursales para asignar (si necesitas TODAS, crea un api/sucursales.listAll y cárgalas aquí)
  const [sucursales, setSucursales] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    username: "",
    password: "",
    roles: [],
    sucursalIds: [],
    defaultSucursalId: null,
    activo: true,
  });

  // carga sucursales desde el auth guardado (las del usuario logueado)
  useEffect(() => {
   listSucursalesLite()
     .then(setSucursales)
     .catch(() => setSucursales([]));
 }, []);

  // abrir modal nuevo
  const openNew = () => {
    setEditing(null);
    setForm({
      username: "",
      password: "",
      roles: [],
      sucursalIds: [],
      defaultSucursalId: null,
      activo: true,
    });
    setShowModal(true);
  };

  // abrir modal editar
  const openEdit = (u) => {
    setEditing(u);
    const ids = (u.sucursales || []).map((s) => s.id);
    const def = (u.sucursales || []).find((s) => s.esDefault)?.id ?? null;
    setForm({
      username: u.username,
      password: "",
      roles: u.roles ?? [],
      sucursalIds: ids,
      defaultSucursalId: def,
      activo: u.activo ?? true,
    });
    setShowModal(true);
  };

  const toggleRole = (r) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(r) ? f.roles.filter((x) => x !== r) : [...f.roles, r],
    }));
  };

  const toggleSucursal = (id) => {
    setForm((f) => {
      const exists = f.sucursalIds.includes(id);
      const sucursalIds = exists ? f.sucursalIds.filter((x) => x !== id) : [...f.sucursalIds, id];
      const defaultSucursalId = sucursalIds.includes(f.defaultSucursalId) ? f.defaultSucursalId : null;
      return { ...f, sucursalIds, defaultSucursalId };
    });
  };

  const save = async () => {
    if (!form.username.trim()) return alert("Usuario requerido");
    if (!editing && !form.password.trim()) return alert("Password requerido para crear");
    if (form.defaultSucursalId && !form.sucursalIds.includes(form.defaultSucursalId)) {
      return alert("La sucursal predeterminada debe estar seleccionada en la lista.");
    }

    const payload = {
      username: form.username.trim(),
      roles: form.roles,
      sucursalIds: form.sucursalIds,
      defaultSucursalId: form.defaultSucursalId,
    };

    try {
      if (editing) {
        await update(editing.id, { ...payload, activo: form.activo });
      } else {
        await create({ ...payload, password: form.password.trim() });
      }
      setShowModal(false);
    } catch (ex) {
      const msg = ex instanceof Error ? ex.message : String(ex);
      console.error(ex);
      alert(msg || "Ocurrió un error");
    }
  };

  return (
    <section className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Administración de usuarios</h1>
        <button
          onClick={openNew}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo usuario
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* tabla responsiva */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Usuario</th>
              <th className="text-left p-3">Roles</th>
              <th className="text-left p-3">Sucursales</th>
              <th className="text-left p-3">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.username}</td>
                <td className="p-3">{(u.roles || []).join(", ")}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {(u.sucursales || []).map((s) => (
                      <span
                        key={s.id}
                        className={`px-2 py-0.5 rounded-full text-xs border ${
                          s.esDefault ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-300"
                        }`}
                      >
                        {s.nombre}
                        {s.esDefault ? " ★" : ""}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">{u.activo ? "Activo" : "Inactivo"}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <button className="px-2 py-1 text-blue-700" onClick={() => openEdit(u)}>
                      Editar
                    </button>
                    <button
                      className="px-2 py-1 text-red-600 flex items-center gap-1"
                      onClick={() => {
                        if (confirm("¿Eliminar usuario?")) remove(u.id);
                      }}
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Sin usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold">{editing ? "Editar usuario" : "Nuevo usuario"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1">
                <X />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm mb-1">Usuario</label>
                <input
                  className="w-full border rounded p-2"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                />
              </div>

              {!editing && (
                <div>
                  <label className="block text-sm mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full border rounded p-2"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-1">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <label key={r} className="inline-flex items-center gap-1 border rounded px-2 py-1">
                      <input
                        type="checkbox"
                        checked={form.roles.includes(r)}
                        onChange={() => toggleRole(r)}
                      />
                      {r}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Sucursales</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sucursales.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 border rounded px-2 py-1">
                      <input
                        type="checkbox"
                        checked={form.sucursalIds.includes(s.id)}
                        onChange={() => toggleSucursal(s.id)}
                      />
                      <span className="flex-1">{s.nombre}</span>
                      <input
                        type="radio"
                        name="defaultSucursal"
                        title="Predeterminada"
                        disabled={!form.sucursalIds.includes(s.id)}
                        checked={form.defaultSucursalId === s.id}
                        onChange={() => setForm((f) => ({ ...f, defaultSucursalId: s.id }))}
                      />
                      <span className="text-xs">★</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Marca ★ para elegir la sucursal predeterminada.
                </p>
              </div>

              {editing && (
                <label className="inline-flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={form.activo}
                    onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                  />
                  Activo
                </label>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button className="px-3 py-2 rounded border" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-2"
                onClick={save}
              >
                <Save size={16} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
