"use client";
import { useState, useEffect } from "react";
import { searchCity, CitySuggestion } from "@/utils/search-city";

export function CityPicker({
  onSelect,
}: {
  onSelect: (location: { lat: number; lng: number; display: string }) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    if (isSelected) return;

    const timeout = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const results = await searchCity(query);
      setSuggestions(results);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, isSelected]);

  const handleSelect = (city: CitySuggestion) => {
    setIsSelected(true);

    const display = `${city.name}${
      city.state ? `, ${city.state}` : ""
    }, ${city.country}`;

    onSelect({
      lat: city.lat,
      lng: city.lon,
      display,
    });

    setQuery(display);
    setSuggestions([]);
  };

  const showDropdown = !isSelected && (loading || suggestions.length > 0);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setIsSelected(false);
          setQuery(e.target.value);
        }}
        placeholder="Search city..."
        className="
          w-full bg-background border border-border rounded-xl
          px-4 py-3 text-foreground
          focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500
          transition
        "
      />

      {showDropdown && (
        <div
          className="
            absolute top-full left-0 mt-2 z-50
            w-full rounded-xl border border-border
            bg-card shadow-lg
            max-h-48 overflow-auto
          "
        >
          {loading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Searching…
            </div>
          ) : (
            suggestions.map((city, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(city)}
                className="
                  w-full text-left px-4 py-2 text-sm
                  hover:bg-muted/30 transition
                "
              >
                {city.name}
                {city.state ? `, ${city.state}` : ""} ({city.country})
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
