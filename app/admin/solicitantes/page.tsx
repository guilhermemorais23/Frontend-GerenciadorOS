"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/lib/api";

type Solicitante = {
  _id: string;
  nome?: string;
  email?: string;
  telefone?: string;
  cargo?: string;
  cliente?: string;
  subcliente?: string;
  unidade?: string;
  marca?: string;
};

type ClienteItem = {
  _id: string;
  cliente?: string;
  subcliente?: string;
  marca?: string;
  unidade?: string;
};

type FormState = {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  cliente: string;
  subcliente: string;
  unidade: string;
  marca: string;
};

const emptyForm: FormState = {
  nome: "",
  email: "",
  telefone: "",
  cargo: "",
  cliente: "",
  subcliente: "",
  unidade: "",
  marca: "",
};

function normalizeText(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isQaItem(value: string) {
  const normalized = normalizeText(value);
  return /(^|\s)q\.?\s*a(\s|$)/i.test(normalized);
}

export default function AdminSolicitantesPage() {
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);
  const [clientesDb, setClientesDb] = useState<ClienteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const isDasa = form.cliente.trim().toLowerCase() === "dasa";

  const clientesOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of clientesDb) {
      if (c.cliente && !isQaItem(c.cliente)) set.add(c.cliente);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [clientesDb]);

  const subclientesOptions = useMemo(() => {
    if (!form.cliente || isDasa) return [];
    const set = new Set<string>();
    for (const c of clientesDb) {
      if (c.cliente !== form.cliente) continue;
      if (c.subcliente && !isQaItem(c.subcliente)) set.add(c.subcliente);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [clientesDb, form.cliente, isDasa]);

  const unidadesOptions = useMemo(() => {
    if (!isDasa) return [];
    const set = new Set<string>();
    for (const c of clientesDb) {
      if (c.cliente === form.cliente && c.unidade) set.add(c.unidade);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [clientesDb, form.cliente, isDasa]);

  const marcasOptions = useMemo(() => {
    if (!isDasa) return [];
    const set = new Set<string>();
    for (const c of clientesDb) {
      if (c.cliente !== form.cliente) continue;
      if (form.unidade && c.unidade !== form.unidade) continue;
      if (c.marca) set.add(c.marca);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [clientesDb, form.cliente, form.unidade, isDasa]);

  const solicitantesFiltrados = useMemo(() => {
    const termo = normalizeText(busca);
    if (!termo) return solicitantes;

    return solicitantes.filter((s) => {
      const texto = normalizeText(
        `${s.nome || ""} ${s.email || ""} ${s.telefone || ""} ${s.cargo || ""} ${s.cliente || ""} ${s.subcliente || ""} ${s.unidade || ""} ${s.marca || ""}`
      );
      return texto.includes(termo);
    });
  }, [solicitantes, busca]);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const [solicitantesData, clientesData] = await Promise.all([
        apiFetch("/admin/solicitantes/vinculados?limit=1000"),
        apiFetch("/clientes"),
      ]);
      setSolicitantes(Array.isArray(solicitantesData) ? (solicitantesData as Solicitante[]) : []);
      setClientesDb(Array.isArray(clientesData) ? (clientesData as ClienteItem[]) : []);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao carregar solicitantes");
    } finally {
      setLoading(false);
    }
  }

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editarSolicitante(solicitante: Solicitante) {
    setEditingId(solicitante._id);
    setForm({
      nome: solicitante.nome || "",
      email: solicitante.email || "",
      telefone: solicitante.telefone || "",
      cargo: solicitante.cargo || "",
      cliente: solicitante.cliente || "",
      subcliente: solicitante.subcliente || "",
      unidade: solicitante.unidade || "",
      marca: solicitante.marca || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar() {
    if (!form.nome.trim()) {
      alert("Nome do solicitante e obrigatorio");
      return;
    }
    if (!form.cliente.trim()) {
      alert("Informe a empresa vinculada");
      return;
    }
    if (isDasa && (!form.unidade.trim() || !form.marca.trim())) {
      alert("Para DASA, unidade e marca sao obrigatorias");
      return;
    }

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim(),
      telefone: form.telefone.trim(),
      cargo: form.cargo.trim(),
      cliente: form.cliente.trim(),
      subcliente: isDasa ? "" : form.subcliente.trim(),
      unidade: isDasa ? form.unidade.trim() : "",
      marca: isDasa ? form.marca.trim() : "",
    };

    setSalvando(true);
    try {
      const salvo = (await apiFetch(
        editingId ? `/admin/solicitantes/vinculados/${editingId}` : "/admin/solicitantes/vinculados",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      )) as Solicitante;

      setSolicitantes((prev) => {
        if (editingId) {
          return prev.map((item) => (item._id === editingId ? salvo : item));
        }
        return [salvo, ...prev];
      });
      resetForm();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao salvar solicitante");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirSolicitante(solicitante: Solicitante) {
    const ok = confirm(`Excluir solicitante ${solicitante.nome || ""}? Essa acao nao pode ser desfeita.`);
    if (!ok) return;

    try {
      await apiFetch(`/admin/solicitantes/vinculados/${solicitante._id}`, { method: "DELETE" });
      setSolicitantes((prev) => prev.filter((item) => item._id !== solicitante._id));
      if (editingId === solicitante._id) resetForm();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao excluir solicitante");
    }
  }

  function handleClienteChange(value: string) {
    setForm((prev) => ({
      ...prev,
      cliente: value,
      subcliente: "",
      unidade: "",
      marca: "",
    }));
  }

  if (loading) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-4">Carregando...</p>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {editingId ? "Editar solicitante" : "Novo solicitante"}
            </h2>
            <p className="text-sm text-slate-500">Cadastre contatos vinculados a uma empresa para uso nas OS.</p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancelar edicao
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Nome
            <input
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Nome do solicitante"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Cargo
            <input
              value={form.cargo}
              onChange={(e) => setField("cargo", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Cargo ou setor"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="email@empresa.com"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Telefone
            <input
              value={form.telefone}
              onChange={(e) => setField("telefone", e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Telefone"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Empresa
            <input
              list="clientes-options"
              value={form.cliente}
              onChange={(e) => handleClienteChange(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="Selecione ou digite a empresa"
            />
            <datalist id="clientes-options">
              {clientesOptions.map((cliente) => (
                <option key={cliente} value={cliente} />
              ))}
            </datalist>
          </label>

          {!isDasa && (
            <label className="block text-sm font-semibold text-slate-700">
              Subcliente
              <input
                list="subclientes-options"
                value={form.subcliente}
                onChange={(e) => setField("subcliente", e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Subcliente"
              />
              <datalist id="subclientes-options">
                {subclientesOptions.map((subcliente) => (
                  <option key={subcliente} value={subcliente} />
                ))}
              </datalist>
            </label>
          )}

          {isDasa && (
            <>
              <label className="block text-sm font-semibold text-slate-700">
                Unidade
                <input
                  list="unidades-options"
                  value={form.unidade}
                  onChange={(e) => setField("unidade", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Unidade"
                />
                <datalist id="unidades-options">
                  {unidadesOptions.map((unidade) => (
                    <option key={unidade} value={unidade} />
                  ))}
                </datalist>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Marca
                <input
                  list="marcas-options"
                  value={form.marca}
                  onChange={(e) => setField("marca", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="Marca"
                />
                <datalist id="marcas-options">
                  {marcasOptions.map((marca) => (
                    <option key={marca} value={marca} />
                  ))}
                </datalist>
              </label>
            </>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {salvando ? "Salvando..." : editingId ? "Salvar alteracoes" : "Criar solicitante"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Solicitantes cadastrados</h2>
            <p className="text-sm text-slate-500">{solicitantesFiltrados.length} contato(s) encontrado(s)</p>
          </div>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-80"
            placeholder="Buscar por nome, email, telefone ou empresa"
          />
        </div>

        {solicitantesFiltrados.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Nenhum solicitante encontrado.
          </p>
        )}

        <div className="space-y-3">
          {solicitantesFiltrados.map((solicitante) => {
            const vinculoDasa = solicitante.cliente?.toLowerCase() === "dasa";
            const vinculo = vinculoDasa
              ? `${solicitante.cliente || "-"} / ${solicitante.unidade || "-"} / ${solicitante.marca || "-"}`
              : `${solicitante.cliente || "-"} / ${solicitante.subcliente || "-"}`;

            return (
              <article
                key={solicitante._id}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-extrabold text-slate-900">{solicitante.nome || "-"}</p>
                    <p className="text-sm text-slate-600">{solicitante.cargo || "Sem cargo informado"}</p>
                    <p className="mt-2 text-sm text-slate-700">{vinculo}</p>
                    <p className="text-xs text-slate-500">
                      {solicitante.email || "Sem email"} - {solicitante.telefone || "Sem telefone"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => editarSolicitante(solicitante)}
                      className="rounded-xl bg-blue-700 px-3 py-2 text-sm font-bold text-white hover:bg-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => excluirSolicitante(solicitante)}
                      className="rounded-xl bg-rose-700 px-3 py-2 text-sm font-bold text-white hover:bg-rose-800"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
