"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

const API_URL = "https://gerenciador-de-os.onrender.com";

export default function DetalheOSPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

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

  // 🔥 FUNÇÃO DEFINITIVA PRA IMAGEM (NÃO MUDA MAIS)
  function resolveImageSrc(foto: any) {
    if (!foto) return "";

    // veio como objeto (erro backend)
    if (typeof foto === "object") {
      console.error("Foto inválida (objeto):", foto);
      return "";
    }

    // data:image completo
    if (typeof foto === "string" && foto.startsWith("data:image")) {
      return foto;
    }

    // base64 puro (SEM prefixo)
    if (
      typeof foto === "string" &&
      foto.length > 50 &&
      !foto.startsWith("/") &&
      !foto.startsWith("http")
    ) {
      return `data:image/jpeg;base64,${foto}`;
    }

    // caminho salvo no backend (/uploads/...)
    if (typeof foto === "string" && foto.startsWith("/")) {
      return `${API_URL}${foto}`;
    }

    console.error("Formato de imagem desconhecido:", foto);
    return "";
  }

  async function gerarPDF() {
    if (!os) return;

    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(14);
    doc.text(`Ordem de Serviço - ${os.osNumero}`, 10, y);
    y += 10;

    doc.setFontSize(10);
    doc.text(`Cliente: ${os.cliente}`, 10, y); y += 6;
    doc.text(`Marca: ${os.marca || "-"}`, 10, y); y += 6;
    doc.text(`Unidade: ${os.unidade || "-"}`, 10, y); y += 6;
    doc.text(`Endereço: ${os.endereco || "-"}`, 10, y); y += 6;
    doc.text(`Técnico: ${os.tecnico?.nome || "-"}`, 10, y); y += 10;

    doc.text("DETALHAMENTO:", 10, y); y += 6;
    doc.text(os.detalhamento || "-", 10, y, { maxWidth: 180 });
    y += 10;

    // ===== ANTES =====
    doc.text("ANTES:", 10, y); y += 6;
    doc.text(os.antes?.relatorio || "-", 10, y, { maxWidth: 180 });
    y += 6;

    if (os.antes?.fotos?.length) {
      for (const foto of os.antes.fotos) {
        const img = resolveImageSrc(foto);
        if (img) {
          doc.addImage(img, "JPEG", 10, y, 60, 60);
          y += 70;
        }

        if (y > 260) {
          doc.addPage();
          y = 10;
        }
      }
    }

    y += 6;

    // ===== DEPOIS =====
    doc.text("DEPOIS:", 10, y); y += 6;
    doc.text(os.depois?.relatorio || "-", 10, y, { maxWidth: 180 });
    y += 6;

    if (os.depois?.fotos?.length) {
      for (const foto of os.depois.fotos) {
        const img = resolveImageSrc(foto);
        if (img) {
          doc.addImage(img, "JPEG", 10, y, 60, 60);
          y += 70;
        }

        if (y > 260) {
          doc.addPage();
          y = 10;
        }
      }
    }

    doc.save(`OS-${os.osNumero}.pdf`);
  }

  if (loading) return <p className="p-6">Carregando...</p>;
  if (!os) return <p className="p-6">OS não encontrada</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center text-black">
      <div className="bg-white max-w-xl w-full p-6 rounded-xl shadow">

        {/* BOTÕES */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={gerarPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Gerar PDF
          </button>

          <button
            onClick={() => router.push(`/admin/servicos/${id}/editar`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Editar
          </button>

          <button
            onClick={() => router.back()}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Voltar
          </button>
        </div>

        <p><b>Cliente:</b> {os.cliente}</p>
        <p><b>Marca:</b> {os.marca || "-"}</p>
        <p><b>Unidade:</b> {os.unidade || "-"}</p>

        {/* ANTES */}
        <h3 className="mt-4 font-bold">ANTES</h3>
        <p>{os.antes?.relatorio || "-"}</p>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {os.antes?.fotos?.map((foto: any, i: number) => (
            <img
              key={i}
              src={resolveImageSrc(foto)}
              className="h-32 w-full object-cover rounded border"
            />
          ))}
        </div>

        {/* DEPOIS */}
        <h3 className="mt-4 font-bold">DEPOIS</h3>
        <p>{os.depois?.relatorio || "-"}</p>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {os.depois?.fotos?.map((foto: any, i: number) => (
            <img
              key={i}
              src={resolveImageSrc(foto)}
              className="h-32 w-full object-cover rounded border"
            />
          ))}
        </div>

      </div>
    </div>
  );
}
