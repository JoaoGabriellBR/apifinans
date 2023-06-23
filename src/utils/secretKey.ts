import crypto from "crypto";

// Exemplo de uso: Gerar uma chave secreta de 32 bytes (256 bits)
const generateSecretKey = (length: any) => {
  const buffer = crypto.randomBytes(length);
  return buffer.toString("base64");
};

export default generateSecretKey;
