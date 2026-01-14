"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminServicosPage() {
  const router = useRouter();
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }

    carregar();
  }, []);

  async function carregar() {
    try {
      const res = await fetch("https://gerenciador-de-os.onrender.com/projects/admin/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();
      setServicos(data);
    } catch (err) {
      alert("Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="p-4">Carregando...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-black">
      <h1 className="text-2xl font-bold mb-4">Serviços</h1>

      <div className="grid gap-3">
        {servicos.map((s) => (
          <div
            key={s._id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <strong>{s.osNumero}</strong>
              <p>{s.cliente}</p>
            </div>

            <button
              onClick={() => router.push(`/admin/servicos/${s._id}`)}
              className="bg-gray-800 text-white px-3 py-1 rounded"
            >
              Ver
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
