// API 設定常數
export const API_BASE = import.meta.env.VITE_API_BASE;
export const API_PATH = import.meta.env.VITE_API_PATH;

// 從 Cookie 取得 Token
export function getTokenFromCookie() {
	const name = "hexToken=";
	const decodedCookie = decodeURIComponent(document.cookie);
	const ca = decodedCookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i].trim();
		if (c.indexOf(name) === 0) {
			return c.substring(name.length);
		}
	}
	return "";
}

// 清除 Token
export function clearToken() {
	document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// 設定 Token
export function setToken(token, expired) {
	clearToken();
	document.cookie = `hexToken=${token}; expires=${new Date(expired).toUTCString()}; path=/`;
}
