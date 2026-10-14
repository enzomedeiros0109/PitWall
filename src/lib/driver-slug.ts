export function getDriverSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function findDriverBySlug<T extends { givenName: string; familyName: string }>(drivers: T[], slug: string): T | undefined {
  const exact = drivers.find((driver) => getDriverSlug(`${driver.givenName} ${driver.familyName}`) === slug)
  if (exact) return exact

  const trailingMatches = drivers.filter((driver) =>
    getDriverSlug(`${driver.givenName} ${driver.familyName}`).endsWith(`-${slug}`),
  )
  return trailingMatches.length === 1 ? trailingMatches[0] : undefined
}
