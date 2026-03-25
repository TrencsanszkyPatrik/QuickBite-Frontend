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

const ALKOHOLOS_KATEGORIAK_NORMALIZALT = new Set(
  ALKOHOLOS_KATEGORIAK.map((kategoria) => normalizeForCompare(kategoria))
)

const ALKOHOLOS_KULCSSZAVAK = [
  'ipa',
  'stout',
  'lager',
  'ale',
  'sor',
  'beer',
  'bor',
  'wine',
  'pezsgo',
  'champagne',
  'whiskey',
  'whisky',
  'vodka',
  'gin',
  'rum',
  'tequila',
  'likor',
  'vermut',
  'martini',
  'spritz',
  'cocktail',
  'koktel',
  'palinka',
  'brandy',
  'cidra',
  'cider',
  'prosecco',
  'soju',
  'shochu',
  'sake'
]

export const isAlkoholosTermek = (item, restaurantNameInput) => {
  if (!item) return false

  const normalizedCategory = normalizeForCompare(item.category)
  const categoryMatch = !!normalizedCategory && ALKOHOLOS_KATEGORIAK_NORMALIZALT.has(normalizedCategory)

  if (categoryMatch) return true

  const itemName = normalizeForCompare(item.name)
  return ALKOHOLOS_KULCSSZAVAK.some((kulcsszo) => itemName.includes(kulcsszo))
}
