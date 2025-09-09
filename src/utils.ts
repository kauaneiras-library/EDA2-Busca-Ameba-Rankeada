export const uid = (p = "id") => `${p}_${Date.now().toString(36)}_${Math.floor(Math.random() * 9999)}`;
export const nowISO = () => new Date().toISOString();
