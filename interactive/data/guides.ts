import type { GuideItem } from '~/types'

export const guideIndex = Object.entries(import.meta.glob('../guides/*.{md,vue}')).map((i): GuideItem => {
  const title = i[0].split('/').pop()!.replace(/\.\w+$/, '')
  return {
    type: 'guide',
    title: title[0].toUpperCase() + title.slice(1),
    component: i[1] as any,
  }
})

export const guideColors = guideIndex.find(i => i.title === 'Colors')!
