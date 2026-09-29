const images = import.meta.glob<string>("../assets/sessions/*.png", {
  eager: true,
  import: "default",
  query: "?url",
});

const sessionImages = [
  { aliases: ["melbourne", "albert park"], file: "melbourne.png" },
  { aliases: ["shanghai", "china"], file: "china.png" },
  { aliases: ["suzuka", "japan"], file: "japan.png" },
  { aliases: ["miami"], file: "miami.png" },
  { aliases: ["montreal", "montréal", "gilles villeneuve", "canada"], file: "canada.png" },
  { aliases: ["monaco", "monte carlo"], file: "monaco.png" },
  { aliases: ["barcelona", "catalunya"], file: "barcelona.png" },
  { aliases: ["spielberg", "red bull ring", "austria"], file: "austria.png" },
  { aliases: ["silverstone", "great britain", "british"], file: "great_britain.png" },
  { aliases: ["spa", "francorchamps", "belgium"], file: "belgium.png" },
  { aliases: ["budapest", "hungary"], file: "hungary.png" },
  { aliases: ["zandvoort", "netherlands", "dutch"], file: "netherlands.png" },
  { aliases: ["monza", "italy"], file: "italy.png" },
  { aliases: ["madrid"], file: "madrid.png" },
  { aliases: ["baku", "azerbaijan"], file: "azerbaijan.png" },
  { aliases: ["sakhir", "bahrain"], file: "bahrain.png" },
  { aliases: ["marina bay", "singapore"], file: "singapore.png" },
  { aliases: ["austin", "circuit of the americas", "cota"], file: "usa.png" },
  { aliases: ["mexico city", "mexico"], file: "mexico.png" },
  { aliases: ["sao paulo", "são paulo", "interlagos", "brazil"], file: "brazil.png" },
  { aliases: ["las vegas"], file: "lasVegas.png" },
  { aliases: ["lusail", "qatar"], file: "qatar.png" },
  { aliases: ["yas marina", "abu dhabi"], file: "abuDhabi.png" },
];

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function getSessionImage(circuit: string, location: string): string {
  const searchText = normalize(`${circuit} ${location}`);
  const match = sessionImages.find(({ aliases }) =>
    aliases.some((alias) => searchText.includes(normalize(alias))),
  );

  return images[`../assets/sessions/${match?.file ?? "unknown-circuit.png"}`];
}
