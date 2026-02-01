"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function TecnicoPage() {
  const router = useRouter();

  const [servicos, setServicos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<
    "aguardando_tecnico" | "em_andamento" | "concluido" | ""
  >("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "tecnico") {
      router.push("/login");
      return;
    }

    carregarServicos();
  }, []);

  async function carregarServicos() {
    try {
      const data = await apiFetch("/projects/tecnico/my");
      setServicos(data);
    } catch (err: any) {
      alert("Erro ao carregar serviços: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function abrirChamado(id: string) {
    try {
      await apiFetch(`/projects/tecnico/abrir/${id}`, {
        method: "PUT",
      });

      alert("Chamado iniciado!");
      carregarServicos();
    } catch (err: any) {
      alert("Erro ao abrir chamado: " + err.message);
    }
  }

  function logout() {
    const ok = confirm("Deseja realmente sair?");
    if (!ok) return;

    localStorage.clear();
    router.push("/login");
  }

  const listaFiltrada = servicos.filter((s) => {
    if (!filtro) return true;
    return s.status === filtro;
  });

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 text-black">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-4 md:p-6">
        {/* TOPO */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold">
            Painel do Técnico
          </h1>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Sair
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { label: "Todos", value: "" },
            { label: "Aguardando", value: "aguardando_tecnico" },
            { label: "Em andamento", value: "em_andamento" },
            { label: "Concluídos", value: "concluido" },
          ].map((f) => (
            <button
              key={f.label}
              onClick={() => setFiltro(f.value as any)}
              className={`px-4 py-2 rounded ${
                filtro === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LISTA */}
        {listaFiltrada.length === 0 && (
          <p className="text-gray-600">
            Nenhum serviço encontrado.
          </p>
        )}

        <div className="space-y-4">
          {listaFiltrada.map((s) => (
            <div
              key={s._id}
              className="border rounded-lg p-4 flex flex-col gap-2"
            >
              {/* CABEÇALHO */}
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="font-bold text-lg">
                  {s.osNumero}
                </span>

                <span
                  className={`text-sm px-3 py-1 rounded-full
                    ${
                      s.status === "aguardando_tecnico"
                        ? "bg-orange-100 text-orange-700"
                        : s.status === "em_andamento"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                >
                  {s.status === "aguardando_tecnico" && "Aguardando"}
                  {s.status === "em_andamento" && "Em andamento"}
                  {s.status === "concluido" && "Concluído"}
                </span>
              </div>

              {/* DADOS DO CLIENTE */}
              <div className="text-sm space-y-1">
                <div>
                  <b>Cliente:</b> {s.cliente}
                </div>

                {/* REGRA ESPECIAL DASA */}
                {s.cliente === "DASA" ? (
                  <>
                    {s.unidade && (
                      <div>
                        <b>Unidade:</b> {s.unidade}
                      </div>
                    )}
                    {s.marca && (
                      <div>
                        <b>Marca:</b> {s.marca}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {(s.subcliente || s.Subcliente || s.subgrupo) && (
                      <div>
                        <b>Subcliente:</b>{" "}
                        {s.subcliente || s.Subcliente || s.subgrupo}
                      </div>
                    )}
                  </>
                )}

                {s.endereco && (
                  <div>
                    <b>Endereço:</b> {s.endereco}
                  </div>
                )}

                {s.telefone && (
                  <div>
                    <b>Telefone:</b> {s.telefone}
                  </div>
                )}
              </div>

              {/* AÇÕES */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {s.status === "aguardando_tecnico" && (
                  <button
                    onClick={() => abrirChamado(s._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full md:w-auto"
                  >
                    Abrir chamado
                  </button>
                )}

                {s.status !== "aguardando_tecnico" && (
                  <button
                    onClick={() =>
                      router.push(`/tecnico/servicos/${s._id}`)
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full md:w-auto"
                  >
                    Ver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
