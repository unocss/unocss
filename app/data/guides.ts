import type { GuideItem } from '~/types'

export const guideIndex: GuideItem[] = []

export const guideColors = guideIndex.find(i => i.name === 'colors')!
