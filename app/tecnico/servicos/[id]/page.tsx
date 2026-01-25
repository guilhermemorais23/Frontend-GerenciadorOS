"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://gerenciador-de-os.onrender.com";

export default function TecnicoServicoPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    carregarOS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregarOS() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/projects/tecnico/view/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("Resposta inválida do backend:", text);
        throw new Error("Resposta inválida");
      }

      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Resposta não é JSON:", text);
        throw e;
      }

      // 🔒 OS concluída → visualizar
      if (data.status === "concluido") {
        router.replace(`/tecnico/servicos/${id}/visualizar`);
        return;
      }

      // 🔁 ANTES já feito → depois
      if (data.antes?.fotos?.length > 0) {
        router.replace(`/tecnico/servicos/${id}/depois`);
        return;
      }

      // 🔁 padrão → antes
      router.replace(`/tecnico/servicos/${id}/antes`);
    } catch (err) {
      console.error("Erro ao carregar OS do técnico:", err);
      alert("Sessão expirada ou erro ao carregar OS. Faça login novamente.");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="p-6">Carregando...</p>;
  }

  return null;
}
