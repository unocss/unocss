import type { GuideItem } from '~/types'

export const guideIndex: GuideItem[] = [
  {
    type: 'guide',
    name: 'colors',
    title: 'Colors',
    keywords: ['color', 'colour', 'colours'],
    component: () => import('../guides/colors.vue'),
  },
]

export const guideColors = guideIndex.find(i => i.name === 'colors')!
