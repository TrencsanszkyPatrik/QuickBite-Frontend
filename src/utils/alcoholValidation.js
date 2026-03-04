const ALKOHOLOS_KATEGORIAK = [
  'Alkohol',
  'Alkoholos ital',
  'Alkoholos italok',
  'Sör',
  'Sörök',
  'Bor',
  'Rövidital',
  'Rövid ital',
  'Röviditalok',
  'Whiskey',
  'Vodka',
  'Vermut',
  'Tequila',
  'Rum',
  'Likőr',
  'Gin',
  'Energiaital',
  'Energiaitalok',
  'Koktélok',
  'Koktél'
]

const normalizeForCompare = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

export const isAlkoholosTermek = (item, restaurantNameInput) => {
  if (!item) return false

  const normalizedCategory = normalizeForCompare(item.category)
  const categoryMatch =
    !!normalizedCategory &&
    ALKOHOLOS_KATEGORIAK.map((k) => normalizeForCompare(k)).includes(normalizedCategory)

  if (categoryMatch) return true

  const restaurantName = normalizeForCompare(restaurantNameInput)
  const itemName = normalizeForCompare(item.name)
  const isZipsBrewhouse = restaurantName.includes('zip') && restaurantName.includes('brewhouse')
  const isTuzhelyKavezoBisztro =
    restaurantName.includes('tuzhely') &&
    restaurantName.includes('kavezo') &&
    restaurantName.includes('bisztro')
  const isHajnaliWokBao =
    restaurantName.includes('hajnali') &&
    restaurantName.includes('wok') &&
    restaurantName.includes('bao')
  const isSaboresPerdidos =
    restaurantName.includes('sabores') &&
    restaurantName.includes('perdidos')
  const isLaStradaItaliana =
    restaurantName.includes('la strada') &&
    restaurantName.includes('italiana')
  const isNeoDog =
    restaurantName.includes('neo') &&
    restaurantName.includes('dog')
  const isItalKategoriaban = ['ital', 'italok'].includes(normalizedCategory)
  const isUditoKategoriaban = ['udito', 'uditok'].includes(normalizedCategory)

  if (isZipsBrewhouse) {
    return ['ipa', 'kezmuves sor', 'stout'].some((drinkName) => itemName.includes(drinkName))
  }

  if (isTuzhelyKavezoBisztro && isItalKategoriaban) {
    return ['aperol spritz', 'bloody mary', 'craft sorok', 'craft sor', 'mimosa']
      .some((drinkName) => itemName.includes(drinkName))
  }

  if (isHajnaliWokBao && isItalKategoriaban) {
    return ['lychee martini', 'sake flight', 'shochu', 'soju', 'makgeolli']
      .some((drinkName) => itemName.includes(drinkName))
  }

  if (isSaboresPerdidos && itemName.includes('paloma picante')) return true

  if (isLaStradaItaliana) {
    return (
      itemName.includes('campari soda') ||
      itemName.includes('aperol spitz') ||
      itemName.includes('aperol spritz')
    )
  }

  if (isNeoDog && isUditoKategoriaban && itemName.includes('source code')) return true

  return false
}
