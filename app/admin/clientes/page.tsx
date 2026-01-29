"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const data = await apiFetch("/clientes");
      setClientes(data);
    } catch (err: any) {
      alert("Erro ao carregar clientes: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function excluirCliente(id: string) {
    const ok = confirm("Tem certeza que deseja excluir este cliente?");
    if (!ok) return;

    try {
      await apiFetch(`/clientes/${id}`, { method: "DELETE" });
      alert("Cliente excluído");
      carregarClientes();
    } catch {
      alert("Erro ao excluir cliente");
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">

        {/* TOPO */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Clientes</h1>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/admin")}
              className="px-3 py-1.5 text-sm rounded bg-gray-300 hover:bg-gray-400"
            >
              Voltar
            </button>

            <button
              onClick={() => router.push("/admin/clientes/novo")}
              className="px-3 py-1.5 text-sm rounded bg-green-600 hover:bg-green-700 text-white"
            >
              + Novo Cliente
            </button>
          </div>
        </div>

        {/* LISTA */}
        {clientes.length === 0 && (
          <p className="text-gray-600">Nenhum cliente cadastrado.</p>
        )}

        <div className="space-y-3">
          {clientes.map((c) => {
            const isDasa = c.cliente?.toLowerCase() === "dasa";

            return (
              <div
                key={c._id}
                className="border rounded p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-black">{c.cliente}</p>

                  {isDasa ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Unidade: {c.unidade || "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Marca: {c.marca || "-"}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Subcliente: {c.subcliente || "-"}
                    </p>
                  )}

                  <p className="text-sm text-gray-600">
                    Telefone: {c.telefone || "-"}
                  </p>

                  <p className="text-sm text-gray-600">
                    Email: {c.email || "-"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/admin/clientes/${c._id}/editar`)
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => excluirCliente(c._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
