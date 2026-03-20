const BASE_URL = "https://jiosaavn-api-privatecvc2.vercel.app";

function cleanText(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
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

function mapSong(song: any): MappedSong {
  const cover = song.image?.[2]?.link || song.image?.[1]?.link || song.image?.[0]?.link || "";
  const url =
    song.downloadUrl?.[4]?.link ||
    song.downloadUrl?.[3]?.link ||
    song.downloadUrl?.[2]?.link ||
    song.downloadUrl?.[1]?.link ||
    song.downloadUrl?.[0]?.link ||
    "";

  return {
    id: song.id,
    title: cleanText(song.name || ""),
    artist: cleanText(song.primaryArtists || ""),
    album: cleanText(song.album?.name || ""),
    cover,
    url,
    duration: parseInt(song.duration) || 0,
  };
}

export async function searchSongs(query: string, limit = 20): Promise<MappedSong[]> {
  const res = await fetch(`${BASE_URL}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
  const data = await res.json();
  if (data.status === "SUCCESS" && data.data?.results) {
    return data.data.results.map(mapSong);
  }
  return [];
}
