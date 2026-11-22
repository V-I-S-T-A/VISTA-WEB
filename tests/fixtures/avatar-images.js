// Distinct fictional avatars for visual and identity regression checks.
const svg = (color, text) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${color}"/><text x="32" y="41" text-anchor="middle" fill="white" font-family="sans-serif" font-size="28">${text}</text></svg>`)}`;
export const organizationAvatar = svg('#1a59a5', 'O');
export const submitterAvatar = svg('#7436ad', 'S');
