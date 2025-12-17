export interface CitySuggestion {
  name: string;
  lat: number;
  lon: number;
  state?: string;
  country: string;
}

/** Shape returned by OpenWeather geocoding API */
interface OpenWeatherCity {
  name: string;
  lat: number;
  lon: number;
  state?: string;
  country: string;
}

/** Fetch helper with strict typing */
async function fetchOpenWeather(
  query: string,
  limit: number,
  apiKey: string
): Promise<OpenWeatherCity[]> {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=${limit}&appid=${apiKey}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`OpenWeather request failed: ${resp.status}`);
  }

  return (await resp.json()) as OpenWeatherCity[];
}

/**
 * 🎯 Fuzzy match helper - checks if searchText matches targetText
 * Returns a score (lower is better match)
 */
function fuzzyMatchScore(searchText: string, targetText: string): number {
  const search = searchText.toLowerCase().trim();
  const target = targetText.toLowerCase();

  // Exact match = best score
  if (target === search) return 0;

  // Starts with = very good
  if (target.startsWith(search)) return 1;

  // Contains = good
  if (target.includes(search)) return 2;

  // Word starts with any search token = okay
  const searchTokens = search.split(/\s+/);
  const targetTokens = target.split(/\s+/);

  for (const searchToken of searchTokens) {
    for (const targetToken of targetTokens) {
      if (targetToken.startsWith(searchToken)) {
        return 3;
      }
    }
  }

  // No match
  return 999;
}

/**
 * 🔍 Main city search method with fuzzy matching
 * - Gets broader results from API
 * - Filters with fuzzy matching on client side
 * - Restricts to India (IN)
 */
export async function searchCity(query: string): Promise<CitySuggestion[]> {
  const trimmed = query.trim();

  if (trimmed.length < 2) return [];

  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!API_KEY) {
    console.error("Missing OpenWeather API key");
    return [];
  }

  const tokens = trimmed.split(/\s+/);
  const allResults: OpenWeatherCity[] = [];
  const seenCities = new Set<string>();

  // Strategy: Get results from multiple query patterns
  const queries: string[] = [];

  // 1️⃣ Full query
  queries.push(`${trimmed},IN`);

  // 2️⃣ First token only (e.g., "new" from "new delh")
  if (tokens.length > 0 && tokens[0].length >= 2) {
    queries.push(`${tokens[0]},IN`);
  }

  // 3️⃣ Last token only (e.g., "delh" from "new delh")
  if (tokens.length > 1 && tokens[tokens.length - 1].length >= 2) {
    queries.push(`${tokens[tokens.length - 1]},IN`);
  }

  // 4️⃣ If multi-word, try each significant token
  if (tokens.length > 1) {
    for (const token of tokens) {
      if (token.length >= 3) {
        queries.push(`${token},IN`);
      }
    }
  }

  // Remove duplicates
  const uniqueQueries = Array.from(new Set(queries));

  // Fetch from all query patterns
  for (const q of uniqueQueries) {
    try {
      const results = await fetchOpenWeather(q, 10, API_KEY);

      // Add unique cities only
      for (const city of results) {
        const key = `${city.name}-${city.lat}-${city.lon}`;
        if (!seenCities.has(key) && city.country.toUpperCase() === "IN") {
          seenCities.add(key);
          allResults.push(city);
        }
      }
    } catch (err) {
      console.warn(`City search failed for query "${q}"`, err);
      continue;
    }
  }

  if (allResults.length === 0) return [];

  // 🎯 Now do fuzzy matching on the collected results
  const scoredResults = allResults.map((city) => {
    const fullName = city.state ? `${city.name} ${city.state}` : city.name;
    const score = fuzzyMatchScore(trimmed, fullName);

    return {
      city,
      score,
    };
  });

  // Sort by score (best matches first)
  scoredResults.sort((a, b) => a.score - b.score);

  // Filter out non-matches (score 999) and take top 5
  const topMatches = scoredResults
    .filter((r) => r.score < 999)
    .slice(0, 5)
    .map(
      (r): CitySuggestion => ({
        name: r.city.state
          ? `${r.city.name}, ${r.city.state}`
          : r.city.name,
        lat: r.city.lat,
        lon: r.city.lon,
        state: r.city.state,
        country: r.city.country,
      })
    );

  return topMatches;
}