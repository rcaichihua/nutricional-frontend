export async function fetchJson(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || `Error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}
