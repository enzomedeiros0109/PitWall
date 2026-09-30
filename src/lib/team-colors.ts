const CONSTRUCTOR_COLORS: Record<string, string> = {
  alpine: "#FF87BC",
  aston_martin: "#229971",
  ferrari: "#E8002D",
  haas: "#B6BABD",
  kick_sauber: "#52E252",
  mclaren: "#FF8000",
  mercedes: "#27F4D2",
  rb: "#6692FF",
  red_bull: "#3671C6",
  williams: "#64C4FF",
}

export function getTeamColor(constructorId: string) {
  return CONSTRUCTOR_COLORS[constructorId] ?? "#A1A1AA"
}
