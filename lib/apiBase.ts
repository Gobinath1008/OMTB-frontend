const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

export const API_BASE_URL = configuredApiUrl
  ? configuredApiUrl.toLowerCase().endsWith("/api")
    ? configuredApiUrl
    : `${configuredApiUrl}/api`
  : "http://localhost:8080/api";

export const apiUrl = (path: string) =>
  `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
