import { API_URL } from "./api";

export async function getDadosDesafiosUsuario(idUsuario) {
  const response = await fetch(
    `${API_URL}/usuarios/${encodeURIComponent(idUsuario)}/desafios`
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensagem || "Não foi possível carregar seu impacto.");
  }

  if (!data.impacto || !Array.isArray(data.desafios)) {
    throw new Error("Os seus dados serão atualizados de acordo com o seu progresso.");
  }

  return data;
}

export function formatarNumeroImpacto(value, maximumFractionDigits = 0) {
  return Number(value || 0).toLocaleString("pt-BR", {
    maximumFractionDigits,
  });
}
