import { Platform } from "react-native";
import {
  launchImageLibraryAsync,
  launchCameraAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
} from "expo-image-picker";
import { API_URL } from "./api";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

export async function pickImageFromLibrary() {
  const permission = await requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Permita o acesso à galeria para selecionar uma imagem.");
  }

  const result = await launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
    maxWidth: 1600,
    maxHeight: 1600,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) {
    throw new Error("Não foi possível ler a imagem selecionada.");
  }

  const contentType = asset.mimeType || "image/jpeg";
  if (!ALLOWED_IMAGE_TYPES.has(contentType.toLowerCase())) {
    throw new Error("Use uma imagem JPEG, PNG, WebP, HEIC ou GIF.");
  }

  if (asset.fileSize > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }

  return asset;
}

export async function takePhotoForReport() {
  const permission = await requestCameraPermissionsAsync();

  if (!permission.granted) {
    throw new Error("Permita o acesso à câmera para tirar uma foto do relato.");
  }

  const result = await launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
    maxWidth: 1600,
    maxHeight: 1600,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) {
    throw new Error("Não foi possível obter a foto tirada.");
  }

  const contentType = asset.mimeType || "image/jpeg";
  if (!ALLOWED_IMAGE_TYPES.has(contentType.toLowerCase())) {
    throw new Error("Use uma imagem JPEG, PNG, WebP, HEIC ou GIF.");
  }

  if (asset.fileSize > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }

  return asset;
}

export async function appendImageToFormData(formData, asset) {
  const contentType = asset.mimeType || "image/jpeg";
  if (!ALLOWED_IMAGE_TYPES.has(contentType.toLowerCase())) {
    throw new Error("O formato desta imagem não é compatível.");
  }
  if (asset.fileSize > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("A imagem deve ter no máximo 5 MB.");
  }

  const extension = contentType.split("/")[1]?.split(";")[0] || "jpeg";
  const fileName = asset.fileName || `imagem.${extension}`;

  if (Platform.OS === "web") {
    const response = await fetch(asset.uri);
    if (!response.ok) {
      throw new Error("Não foi possível preparar a imagem selecionada.");
    }

    const file = await response.blob();
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("A imagem deve ter no máximo 5 MB.");
    }

    formData.append("imagem", file, fileName);
    return;
  }

  formData.append("imagem", {
    uri: asset.uri,
    name: fileName,
    type: contentType,
  });
}

export function sendFormData(url, options) {
  if (Platform.OS === "web") {
    return fetch(url, options);
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(options.method || "POST", url);
    request.timeout = 30000;

    Object.entries(options.headers || {}).forEach(([name, value]) => {
      request.setRequestHeader(name, value);
    });

    request.onload = () => {
      resolve({
        ok: request.status >= 200 && request.status < 300,
        status: request.status,
        json: async () => {
          try {
            return JSON.parse(request.responseText);
          } catch {
            throw new Error("O servidor retornou uma resposta inválida.");
          }
        },
      });
    };
    request.onerror = () => reject(new Error("Falha de conexão ao enviar os dados."));
    request.ontimeout = () => reject(new Error("O envio dos dados excedeu o tempo limite."));
    request.onabort = () => reject(new Error("O envio dos dados foi cancelado."));
    request.send(options.body);
  });
}

export async function getImageUrl(path) {
  if (!path) {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
