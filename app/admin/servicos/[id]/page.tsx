"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import jsPDF from "jspdf";

export default function DetalheOSPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [os, setOs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarOS();
  }, []);

  async function carregarOS() {
    try {
      const data = await apiFetch(`/projects/admin/view/${id}`);
      setOs(data);
    } catch (err: any) {
      alert("Erro ao carregar OS: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function cancelarOS() {
    const ok = confirm("Tem certeza que deseja cancelar esta OS?");
    if (!ok) return;

    try {
      await apiFetch(`/projects/admin/cancelar/${id}`, {
        method: "PUT",
      });

      alert("OS cancelada com sucesso!");
      await carregarOS();
    } catch (err: any) {
      alert("Erro ao cancelar: " + err.message);
    }
  }

  async function excluirOS() {
    const ok = confirm(
      "⚠️ ATENÇÃO!\n\nEssa ação NÃO pode ser desfeita.\nDeseja excluir esta OS definitivamente?"
    );
    if (!ok) return;

    try {
      await apiFetch(`/projects/admin/delete/${id}`, {
        method: "DELETE",
      });

      alert("OS excluída com sucesso!");
      router.push("/admin");
    } catch (err: any) {
      alert("Erro ao excluir OS: " + err.message);
    }
  }

  function abrirWhatsApp() {
    if (!os?.tecnico?.telefone) {
      alert("Técnico sem telefone cadastrado");
      return;
    }

    const telefone = os.tecnico.telefone.replace(/\D/g, "");

    const mensagem = `
Olá ${os.tecnico.nome},
Você foi designado para a OS ${os.osNumero}.

Cliente: ${os.cliente}
Endereço: ${os.endereco}

Serviço:
${os.detalhamento}
    `;

    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  }
async function gerarPDF() {
  if (!os) return;

  const doc = new jsPDF("p", "mm", "a4");

  const pageHeight = 297;
  const margin = 15;
  const contentWidth = 180;
  let y = 20;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = 20;
    }
  };

  // ======================
  // CABEÇALHO
  // ======================
  doc.setFontSize(16);
  doc.text("ORDEM DE SERVIÇO", 105, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.text(`OS: ${os.osNumero}`, margin, y);
  doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 195, y, {
    align: "right",
  });
  y += 6;

  doc.text(`Status: ${os.status}`, margin, y); y += 5;
  doc.text(`Cliente: ${os.cliente}`, margin, y); y += 5;

  if (os.marca || os.unidade) {
    doc.text(`Marca: ${os.marca || "-"}`, margin, y); y += 5;
    doc.text(`Unidade: ${os.unidade || "-"}`, margin, y); y += 5;
  }

  doc.text(`Endereço: ${os.endereco || "-"}`, margin, y); y += 5;
  doc.text(`Técnico: ${os.tecnico?.nome || "-"}`, margin, y); y += 10;

  // ======================
  // DETALHAMENTO
  // ======================
  doc.setFontSize(12);
  doc.text("DETALHAMENTO DO SERVIÇO", margin, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(os.detalhamento || "-", margin, y, { maxWidth: contentWidth });
  y += 12;

  // ======================
  // FUNÇÃO RELATÓRIO
  // ======================
  const renderRelatorio = (titulo: string, dados: any) => {
    if (!dados) return;

    ensureSpace(40);

    doc.setFontSize(12);
    doc.text(titulo, margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.text("Relatório:", margin, y);
    y += 5;
    doc.text(dados.relatorio || "-", margin, y, {
      maxWidth: contentWidth,
    });
    y += 10;

    doc.text("Observação:", margin, y);
    y += 5;
    doc.text(dados.observacao || "-", margin, y, {
      maxWidth: contentWidth,
    });
    y += 10;
  };

  // ======================
  // FUNÇÃO FOTOS 2x2
  // ======================
  const renderFotos = async (titulo: string, fotos: string[]) => {
    if (!fotos || fotos.length === 0) return;

    ensureSpace(80);

    doc.setFontSize(12);
    doc.text(titulo, margin, y);
    y += 8;

    const imgW = 80;
    const imgH = 55;
    const gap = 10;

    let x = margin;
    let col = 0;

    for (const foto of fotos.slice(0, 4)) {
      ensureSpace(imgH + 10);

      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          doc.addImage(
            `data:image/jpeg;base64,${foto}`,
            "JPEG",
            x,
            y,
            imgW,
            imgH
          );

          col++;
          if (col % 2 === 0) {
            x = margin;
            y += imgH + gap;
          } else {
            x += imgW + gap;
          }
          resolve();
        };
        img.src = `data:image/jpeg;base64,${foto}`;
      });
    }

    y += 10;
  };

  // ======================
  // ANTES
  // ======================
  renderRelatorio("RELATÓRIO - ANTES", os.antes);
  await renderFotos("FOTOS - ANTES", os.antes?.fotos || []);

  // ======================
  // DEPOIS
  // ======================
  renderRelatorio("RELATÓRIO - DEPOIS", os.depois);
  await renderFotos("FOTOS - DEPOIS", os.depois?.fotos || []);

  doc.save(`OS-${os.osNumero}.pdf`);
}



  if (loading) {
    return <div className="p-6 text-center text-gray-700">Carregando...</div>;
  }

  if (!os) {
    return <div className="p-6 text-center text-red-600">OS não encontrada</div>;
  }

  const statusColor =
    os.status === "cancelado"
      ? "bg-red-100 text-red-700 border-red-300"
      : os.status === "concluido"
      ? "bg-green-100 text-green-700 border-green-300"
      : os.status === "em_andamento"
      ? "bg-blue-100 text-blue-700 border-blue-300"
      : "bg-yellow-100 text-yellow-700 border-yellow-300";

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">

        {/* TOPO */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Detalhes da OS</h1>

          <div className="flex gap-2 flex-wrap">
           

            <button
              onClick={gerarPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
            >
              Gerar PDF
            </button>

            <button
              onClick={() => router.push(`/admin/servicos/${id}/editar`)}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg"
            >
              ✏️ Alterar
            </button>

            <button
              onClick={cancelarOS}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-2 rounded-lg"
            >
              ❌ Cancelar
            </button>

            <button
              onClick={excluirOS}
              className="bg-red-700 hover:bg-red-800 text-white text-sm px-4 py-2 rounded-lg"
            >
              🗑️ Excluir OS
            </button>

            <button
              onClick={() => router.back()}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm px-4 py-2 rounded-lg"
            >
              Voltar
            </button>
          </div>
        </div>

        {/* DADOS */}
        <div className="space-y-4 text-sm text-gray-900">
          <div>
            <p className="text-xs text-gray-600 font-semibold">NÚMERO DA OS</p>
            <p className="font-bold text-base">{os.osNumero || "-"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-semibold">STATUS</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm border ${statusColor}`}>
              {os.status}
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-semibold">CLIENTE</p>
            <p className="font-bold">{os.cliente}</p>
          </div>

          <div>
            <p className="text-xs text-gray-600 font-semibold">TÉCNICO</p>
            <p className="font-bold">{os.tecnico?.nome || "-"}</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-semibold mb-1">
              DETALHAMENTO DO SERVIÇO
            </p>
            <p className="whitespace-pre-line">{os.detalhamento || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
