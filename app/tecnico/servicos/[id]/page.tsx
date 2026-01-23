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
  }, [id]);

  async function carregarOS() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/projects/tecnico/view/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      if (data.status === "concluido") {
        router.replace(`/tecnico/servicos/${id}/visualizar`);
        return;
      }

      if (data.antes?.fotos?.length > 0) {
        router.replace(`/tecnico/servicos/${id}/depois`);
        return;
      }

      router.replace(`/tecnico/servicos/${id}/antes`);
    } catch {
      router.replace("/tecnico");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="p-6">Carregando...</p>;

  return null;
}
