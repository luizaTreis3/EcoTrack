export function formatarTelefoneBrasileiro(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }
  digits = digits.slice(0, 11);

  if (!digits) {
    return "";
  }

  const ddd = digits.slice(0, 2);
  if (digits.length <= 2) {
    return digits.length === 2 ? `(${ddd})` : `(${ddd}`;
  }

  const celular = digits[2] === "9";
  const quantidadeMaxima = celular ? 11 : 10;
  const tamanhoPrefixo = celular ? 5 : 4;
  const numero = digits.slice(2, quantidadeMaxima);
  const prefixo = numero.slice(0, tamanhoPrefixo);
  const sufixo = numero.slice(tamanhoPrefixo);

  return `(${ddd}) ${prefixo}${sufixo ? `-${sufixo}` : ""}`;
}

export function formatarCpfBrasileiro(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatarCep(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
