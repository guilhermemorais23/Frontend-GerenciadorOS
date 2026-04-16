"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { apiFetch } from "@/app/lib/api";

export default function NovaSolicitacaoPage() {
  const router = useRouter();
  const [solicitanteNome, setSolicitanteNome] = useState("");
  const [detalhamento, setDetalhamento] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [cliente, setCliente] = useState("");
  const [subcliente, setSubcliente] = useState("");
  const [marca, setMarca] = useState("");
  const [unidade, setUnidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "terceiro" && role !== "cliente") {
      router.replace("/login");
      return;
    }

    setSolicitanteNome(localStorage.getItem("nome") || "");
    setCliente(localStorage.getItem("cliente_vinculado") || "");
    setSubcliente(localStorage.getItem("subcliente_vinculado") || "");
    setMarca(localStorage.getItem("marca_vinculada") || "");
    setUnidade(localStorage.getItem("unidade_vinculada") || "");
    setEndereco(localStorage.getItem("endereco_vinculado") || "");
    setTelefone(localStorage.getItem("telefone") || "");
    setEmail(localStorage.getItem("email") || "");
    void carregarDadosVinculados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function carregarDadosVinculados() {
    try {
      const data = (await apiFetch("/clientes/vinculado/me")) as {
        solicitante_nome?: string;
        cliente?: string;
        subcliente?: string;
        marca?: string;
        unidade?: string;
        endereco?: string;
        telefone?: string;
        email?: string;
      };

      if (data.solicitante_nome) {
        setSolicitanteNome(data.solicitante_nome);
        localStorage.setItem("nome", data.solicitante_nome);
      }
      if (data.cliente) {
        setCliente(data.cliente);
        localStorage.setItem("cliente_vinculado", data.cliente);
      }
      if (data.subcliente) {
        setSubcliente(data.subcliente);
        localStorage.setItem("subcliente_vinculado", data.subcliente);
      }
      if (data.marca) {
        setMarca(data.marca);
        localStorage.setItem("marca_vinculada", data.marca);
      }
      if (data.unidade) {
        setUnidade(data.unidade);
        localStorage.setItem("unidade_vinculada", data.unidade);
      }
      if (data.endereco) {
        setEndereco(data.endereco);
      }
      if (data.telefone) {
        setTelefone(data.telefone);
        localStorage.setItem("telefone", data.telefone);
      }
      if (data.email) {
        setEmail(data.email);
        localStorage.setItem("email", data.email);
      }
    } catch {
      // noop
    }
  }

  async function solicitarOS() {
    if (!solicitanteNome.trim() || !detalhamento.trim()) {
      alert("Preencha solicitante e descrição");
      return;
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("cliente", cliente || "Cliente avulso");
      formData.append("subcliente", subcliente);
      formData.append("marca", marca);
      formData.append("unidade", unidade);
      formData.append("endereco", endereco);
      formData.append("telefone", telefone);
      formData.append("email", email);
      formData.append("solicitante_nome", solicitanteNome.trim());
      formData.append("detalhamento", detalhamento.trim());
      if (foto) formData.append("foto", foto);

      await apiFetch("/projects/open", { method: "POST", body: formData });
      alert("Solicitação enviada para o admin.");
      router.push("/terceiro");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao solicitar OS");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f8ff] p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Portal do cliente</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">Nova solicitação</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/terceiro")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Empresa" value={cliente || "Cliente avulso"} disabled />
          <Field label="Subcliente / Unidade" value={subcliente || unidade || "-"} disabled />
          <Field label="Marca" value={marca || "-"} disabled />
          <Field label="Endereço" value={endereco || "-"} disabled />
          <Field label="Telefone" value={telefone || "-"} disabled />
          <Field label="Email" value={email || "-"} disabled />
          <Field label="Solicitante" value={solicitanteNome} onChange={setSolicitanteNome} placeholder="Nome do solicitante" />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Descrição do problema</label>
            <textarea
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              value={detalhamento}
              onChange={(e) => setDetalhamento(e.target.value)}
              placeholder="Descreva em detalhes o que precisa ser feito"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Foto do problema (opcional)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:font-bold file:text-sky-700"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={solicitarOS}
          disabled={enviando}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-sky-800 disabled:opacity-60"
        >
          {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {enviando ? "Enviando..." : "Enviar solicitação"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:text-slate-500"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </label>
  );
}
