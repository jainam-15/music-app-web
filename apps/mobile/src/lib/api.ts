const BASE_URL = "https://jiosaavn-api-privatecvc2.vercel.app";

export interface MappedSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  url: string;
  duration: number;
  language?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: MappedSong[];
  createdAt?: string;
}

function cleanText(text: any): string {
  if (!text || typeof text !== "string") return "";
  const entities: { [key: string]: string } = {
    "&quot;": '"', "&amp;": "&", "&#039;": "'", "&lt;": "<", "&gt;": ">",
    "&hellip;": "...", "&ndash;": "-", "&mdash;": "-", "&reg;": "®", "&copy;": "©"
  };
  return text.replace(/&[a-z0-9#]+;/gi, (m) => entities[m] || m);
}

function mapSong(song: any): MappedSong {
  const cover = song.image?.[2]?.link || song.image?.[1]?.link || song.image?.[0]?.link || "";
  const url =
    song.downloadUrl?.[4]?.link || song.downloadUrl?.[3]?.link ||
    song.downloadUrl?.[2]?.link || song.downloadUrl?.[1]?.link ||
    song.downloadUrl?.[0]?.link || "";
  return {
    id: song.id,
    title: cleanText(song.name || song.title || ""),
    artist: cleanText(song.primaryArtists || song.artist || ""),
    album: cleanText(song.album?.name || song.album || ""),
    cover, url,
    duration: parseInt(song.duration) || 0,
    language: song.language || "unknown",
  };
}

const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5;

async function fetchWithCache(url: string) {
  const now = Date.now();
  const cached = apiCache.get(url);
  if (cached && (now - cached.timestamp < CACHE_TTL)) return cached.data;
  const res = await fetch(url);
  const data = await res.json();
  apiCache.set(url, { data, timestamp: now });
  return data;
}

export async function searchSongs(query: string, limit = 20): Promise<MappedSong[]> {
  try {
    const data = await fetchWithCache(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (data.status === "SUCCESS" && data.data?.results) return data.data.results.map(mapSong);
  } catch (e) { console.error(e); }
  return [];
}

export async function getSongById(id: string): Promise<MappedSong | null> {
  try {
    const data = await fetchWithCache(`${BASE_URL}/songs?id=${id}`);
    if (data.status === "SUCCESS" && data.data?.[0]) return mapSong(data.data[0]);
  } catch (e) { console.error(e); }
  return null;
}

export async function getTrendingSongs(): Promise<MappedSong[]> {
  const queries = ["trending hindi hits", "latest punjabi hits", "top bollywood songs"];
  return searchSongs(queries[Math.floor(Math.random() * queries.length)], 12);
}

export async function getRecommendedSongs(id: string, limit = 10, song?: MappedSong): Promise<MappedSong[]> {
  try {
    const data = await fetchWithCache(`${BASE_URL}/songs/${id}/recommendations?limit=${limit}`);
    if (data.status === "SUCCESS" && data.data?.length > 0) return data.data.map(mapSong);
  } catch (e) { console.error("Recommendations API failed", e); }
  const primaryArtist = song?.artist?.split(/[,&]/)[0]?.trim().toLowerCase() || "";
  const lang = song?.language?.toLowerCase() || "hindi";
  const indianLangs = ["hindi", "punjabi", "tamil", "telugu", "marathi"];
  const isIndian = indianLangs.includes(lang);
  const queries = isIndian ? [`latest ${lang} hits`, `${primaryArtist} top songs`] : ["global top pop", "trending billboard hits"];
  for (const q of queries) {
    const results = await searchSongs(q, limit);
    if (results.length > 0) return results.filter(r => r.id !== id);
  }
  return [];
}

export async function getLyrics(id: string): Promise<string | null> {
  try {
    const data = await fetchWithCache(`${BASE_URL}/songs/${id}/lyrics`);
    if (data.status === "SUCCESS" && data.data?.lyrics) return cleanText(data.data.lyrics);
  } catch (e) { console.error("Lyrics fetch failed", e); }
  return null;
}

// ---- Backend API (NestJS) ----
// 10.0.2.2 works for Android Emulator, localhost for iOS Simulator.
// For physical devices, you must replace this with your computer's local IP (e.g., 192.168.x.x)
const API_BASE = "http://10.0.2.2:3001"; 

// Helper with timeout to prevent infinite hanging
async function fetchWithTimeout(url: string, options: any, timeoutMs = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function apiPost(path: string, body: any) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) { 
    console.warn(`API POST ${path} failed or timed out:`, e); 
    return null; 
  }
}

async function apiGet(path: string) {
  try {
    const res = await fetchWithTimeout(`${API_BASE}${path}`, {});
    return await res.json();
  } catch (e) { 
    console.warn(`API GET ${path} failed or timed out:`, e); 
    return []; 
  }
}

export const UserAPI = {
  // --- User Sync ---
  syncUser: (userData: any) => apiPost("/users/sync", userData),

  // --- Liked Songs (matches backend: POST /users/like, GET /users/liked/:id) ---
  toggleLike: (userId: string, song: MappedSong) => apiPost("/users/like", { userId, song }),
  getLikedSongs: (userId: string): Promise<MappedSong[]> => apiGet(`/users/liked/${userId}`),

  // --- Recent Plays (matches backend: POST /users/last-played, GET /users/last-played/:id) ---
  addRecentPlay: (userId: string, song: MappedSong) => apiPost("/users/last-played", { userId, song }),
  getRecentPlays: (userId: string): Promise<MappedSong[]> => apiGet(`/users/last-played/${userId}`),
  clearRecentPlays: (userId: string) => apiPost("/users/clear-recent-plays", { userId }),

  // --- Playlists (matches backend CRUD) ---
  getPlaylists: (userId: string): Promise<Playlist[]> => apiGet(`/users/playlists/${userId}`),
  createPlaylist: (userId: string, name: string): Promise<Playlist> => apiPost("/users/playlists", { userId, name }),
  deletePlaylist: (userId: string, playlistId: string) => apiPost("/users/playlists/delete", { userId, playlistId }),
  addToPlaylist: (userId: string, playlistId: string, song: MappedSong) => apiPost("/users/playlists/add", { userId, playlistId, song }),
  removeFromPlaylist: (userId: string, playlistId: string, songId: string) => apiPost("/users/playlists/remove", { userId, playlistId, songId }),
};
