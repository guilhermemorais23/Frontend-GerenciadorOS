"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "https://gerenciador-de-os.onrender.com";

export default function TecnicoServicoRedirectPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  useEffect(() => {
    if (!id) {
      console.error("ID da OS não encontrado");
      router.replace("/tecnico");
      return;
    }

    decidirFluxo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function decidirFluxo() {
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

      if (!res.ok) {
        const text = await res.text();
        console.error("Erro backend:", text);
        throw new Error("Erro ao buscar OS");
      }

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
    } catch (err) {
      console.error("Erro técnico:", err);
      router.replace("/tecnico");
    }
  }

  return <p className="p-6">Carregando serviço...</p>;
}
