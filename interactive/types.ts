import type { RuleContext } from '@unocss/core'
import type { Component } from 'vue'

export interface DocItem {
  type: 'mdn' | 'caniuse'
  title: string
  url: string
  summary?: string
}

export interface RuleItem {
  type: 'rule'
  class: string
  css?: string
  body?: string
  context?: RuleContext
  colors?: string[]
  features?: string[]
  layers?: string[]
}

export interface GuideItem {
  type: 'guide'
  name: string
  title: string
  summary?: string
  keywords?: string[]
  component: () => Promise<{ default: Component }>
}

export type ResultItem = DocItem | RuleItem | GuideItem
