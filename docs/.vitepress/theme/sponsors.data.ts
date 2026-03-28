interface RawSponsor {
  name: string
  login: string
  avatar: string
  amount: number
  link: string | null
  org: boolean
}

export interface SponsorItem {
  name: string
  img: string
  url: string
}

export interface SponsorTier {
  tier: string
  size: 'big' | 'medium' | 'small' | 'mini' | 'xmini'
  items: SponsorItem[]
}

const SPONSORS_URL = 'https://cdn.jsdelivr.net/gh/antfu/static/sponsors.json'

function classifyTier(amount: number): { title: string, size: SponsorTier['size'] } | null {
  if (amount >= 500)
    return { title: 'Platinum Sponsors', size: 'big' }
  if (amount >= 100)
    return { title: 'Gold Sponsors', size: 'medium' }
  if (amount >= 50)
    return { title: 'Silver Sponsors', size: 'small' }
  if (amount >= 10)
    return { title: 'Sponsors', size: 'mini' }
  return null
}

const TIER_ORDER = ['Platinum Sponsors', 'Gold Sponsors', 'Silver Sponsors', 'Sponsors']

export default {
  async load(): Promise<SponsorTier[]> {
    let raw: RawSponsor[]
    try {
      raw = await fetch(SPONSORS_URL).then(r => r.json())
    }
    catch {
      return []
    }

    const tierMap = new Map<string, SponsorTier>()

    for (const sponsor of raw) {
      if (!sponsor.link || sponsor.amount < 10)
        continue

      const tier = classifyTier(sponsor.amount)
      if (!tier)
        continue

      if (!tierMap.has(tier.title)) {
        tierMap.set(tier.title, { tier: tier.title, size: tier.size, items: [] })
      }

      tierMap.get(tier.title)!.items.push({
        name: sponsor.name || sponsor.login,
        img: sponsor.avatar,
        url: sponsor.link,
      })
    }

    return TIER_ORDER
      .map(name => tierMap.get(name))
      .filter((t): t is SponsorTier => !!t && t.items.length > 0)
  },
}

declare const data: SponsorTier[]
export { data }
