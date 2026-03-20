const BASE_URL = "https://jiosaavn-api-privatecvc2.vercel.app";

export interface SaavnSong {
  id: string;
  name: string;
  primaryArtists: string;
  duration: string;
  album: { name: string; url: string };
  image: { quality: string; link: string }[];
  downloadUrl: { quality: string; link: string }[];
  language: string;
  hasLyrics: string;
}

export interface MappedSong {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  url: string;
  duration: number;
}

function mapSong(song: SaavnSong): MappedSong {
  // Get highest quality image (500x500)
  const cover = song.image?.[2]?.link || song.image?.[1]?.link || song.image?.[0]?.link || "";
  // Get highest quality audio (320kbps)
  const url =
    song.downloadUrl?.[4]?.link ||
    song.downloadUrl?.[3]?.link ||
    song.downloadUrl?.[2]?.link ||
    song.downloadUrl?.[1]?.link ||
    song.downloadUrl?.[0]?.link ||
    "";

  return {
    id: song.id,
    title: cleanText(song.name),
    artist: cleanText(song.primaryArtists || ""),
    album: cleanText(song.album?.name || ""),
    cover,
    url,
    duration: parseInt(song.duration) || 0,
  };
}

// Simple in-memory cache for API calls
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function fetchWithCache(url: string) {
  const now = Date.now();
  const cached = apiCache.get(url);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }
  const res = await fetch(url);
  const data = await res.json();
  apiCache.set(url, { data, timestamp: now });
  return data;
}

export async function searchSongs(query: string, limit = 20): Promise<MappedSong[]> {
  const data = await fetchWithCache(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
  if (data.status === "SUCCESS" && data.data?.results) {
    return data.data.results.map(mapSong);
  }
  return [];
}

export async function getTrendingSongs(): Promise<MappedSong[]> {
  // Fetch popular/trending songs from India
  const queries = ["trending hindi", "arijit singh", "top bollywood hits", "latest punjabi"];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  return searchSongs(randomQuery, 12);
}

export async function getNewReleases(): Promise<MappedSong[]> {
  return searchSongs("new hindi songs 2024", 12);
}

export async function getRecommended(): Promise<MappedSong[]> {
  const queries = ["romantic songs", "ap dhillon", "diljit dosanjh", "atif aslam best", "lofi hindi"];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  return searchSongs(randomQuery, 12);
}

export async function getMoodPlaylists(): Promise<{ title: string; songs: MappedSong[] }[]> {
  const moods = [
    { title: "Chill Vibes", query: "chill hindi" },
    { title: "Workout Energy", query: "workout punjabi" },
    { title: "Romantic Mood", query: "romantic bollywood" },
    { title: "Party Hits", query: "party songs hindi" },
    { title: "Indie Soul", query: "indie india" },
  ];

  const results = await Promise.all(
    moods.map(async (mood) => ({
      title: mood.title,
      songs: await searchSongs(mood.query, 6),
    }))
  );
  return results;
}

// ---- Album ----
export interface MappedAlbum {
  id: string;
  name: string;
  artist: string;
  cover: string;
  year: string;
  songCount: number;
  songs: MappedSong[];
}

export async function getAlbumById(id: string): Promise<MappedAlbum | null> {
  try {
    const data = await fetchWithCache(`${BASE_URL}/albums?id=${id}`);
    if (data.status === "SUCCESS" && data.data) {
      const album = data.data;
      const cover = album.image?.[2]?.link || album.image?.[1]?.link || "";
      return {
        id: album.id,
        name: cleanText(album.name),
        artist: cleanText(album.primaryArtists || ""),
        cover,
        year: album.year || "",
        songCount: album.songCount || 0,
        songs: (album.songs || []).map(mapSong),
      };
    }
  } catch (e) { console.error(e); }
  return null;
}

export async function searchAlbums(query: string, limit = 10) {
  try {
    const data = await fetchWithCache(`${BASE_URL}/search/albums?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (data.status === "SUCCESS" && data.data?.results) {
      return data.data.results.map((a: any) => ({
        id: a.id,
        name: cleanText(a.name),
        artist: cleanText(a.primaryArtists || a.artist || ""),
        cover: a.image?.[2]?.link || a.image?.[1]?.link || "",
        year: a.year || "",
      }));
    }
  } catch (e) { console.error(e); }
  return [];
}

// ---- Artist ----
export interface MappedArtist {
  id: string;
  name: string;
  image: string;
  followerCount: string;
  topSongs: MappedSong[];
  topAlbums: { id: string; name: string; cover: string; year: string }[];
}

export async function getArtistById(id: string): Promise<MappedArtist | null> {
  try {
    const data = await fetchWithCache(`${BASE_URL}/artists?id=${id}`);
    if (data.status === "SUCCESS" && data.data) {
      const artist = data.data;
      return {
        id: artist.id,
        name: cleanText(artist.name),
        image: artist.image?.[2]?.link || artist.image?.[1]?.link || "",
        followerCount: artist.followerCount || "0",
        topSongs: (artist.topSongs || []).map(mapSong),
        topAlbums: (artist.topAlbums || []).map((a: any) => ({
          id: a.id,
          name: cleanText(a.name),
          cover: a.image?.[2]?.link || a.image?.[1]?.link || "",
          year: a.year || "",
        })),
      };
    }
  } catch (e) { console.error(e); }
  return null;
}

export async function searchArtists(query: string, limit = 10) {
  try {
    const data = await fetchWithCache(`${BASE_URL}/search/artists?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (data.status === "SUCCESS" && data.data?.results) {
      return data.data.results.map((a: any) => ({
        id: a.id,
        name: cleanText(a.name),
        image: a.image?.[2]?.link || a.image?.[1]?.link || "",
      }));
    }
  } catch (e) { console.error(e); }
  return [];
}

// ---- Song detail & Lyrics ----
export async function getSongById(id: string): Promise<MappedSong | null> {
  try {
    const data = await fetchWithCache(`${BASE_URL}/songs?id=${id}`);
    if (data.status === "SUCCESS" && data.data?.[0]) {
      return mapSong(data.data[0]);
    }
  } catch (e) { console.error(e); }
  return null;
}

export async function getLyrics(id: string): Promise<string | null> {
  try {
    const data = await fetchWithCache(`${BASE_URL}/lyrics?id=${id}`);
    if (data.status === "SUCCESS" && data.data?.lyrics) {
      return data.data.lyrics;
    }
  } catch (e) { console.error(e); }
  return null;
}

function cleanText(text: string): string {
  if (!text) return "";
  const entities: { [key: string]: string } = {
    "&quot;": '"',
    "&amp;": "&",
    "&#039;": "'",
    "&lt;": "<",
    "&gt;": ">",
    "&hellip;": "...",
    "&ndash;": "-",
    "&mdash;": "-",
    "&reg;": "®",
    "&copy;": "©"
  };
  return text.replace(/&[a-z0-9#]+;/gi, (m) => entities[m] || m);
}

