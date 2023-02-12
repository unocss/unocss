import { EditorView } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const keyword = 'var(--cm-keyword)'
const property = 'var(--cm-property)'
const punctuation = 'var(--cm-punctuation)'
const invalid = '#ffffff'
const foreground = 'var(--cm-foreground)'
const lineNumber = 'var(--cm-line-number)'
const comment = 'var(--cm-comment)'
const variable = 'var(--cm-variable)'
const string = 'var(--cm-string)'
const darkBackground = 'var(--cm-background)'
const highlightBackground = 'var(--cm-line-highlight-background)'
const background = 'var(--cm-background)'
const tooltipBackground = '#242222'
const selection = 'var(--cm-selection-background)'
const cursor = '#888'

export const vitesseTheme = EditorView.theme({
  '&': {
    color: foreground,
    backgroundColor: background,
  },
  '& div': {
    flexDirection: 'initial',
  },

  '&.cm-focused': {
    outline: 'none',
  },

  '.cm-content': {
    caretColor: cursor,
  },

  '.cm-completionIcon': {
    display: 'none',
  },

  '.cm-cursor, .cm-dropCursor': { borderLeftColor: cursor },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: selection },

  '.cm-panels': { backgroundColor: darkBackground, color: foreground },
  '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
  '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },

  '.cm-searchMatch': {
    backgroundColor: '#72a1ff59',
    outline: '1px solid #457dff',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#6199ff2f',
  },

  '.cm-line': { border: '1px solid transparent' },
  '.cm-activeLine': { backgroundColor: highlightBackground, border: '1px solid var(--cm-line-highlight-border)' },
  '.cm-selectionMatch': { backgroundColor: '#aafe661a' },

  '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
    backgroundColor: 'transparent',
  },

  '.cm-gutters': {
    backgroundColor: background,
    color: lineNumber,
    border: 'none',
  },

  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: '#bfbaaa',
  },

  '.cm-foldPlaceholder': {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ddd',
  },

  '.cm-tooltip': {
    border: 'none',
    backgroundColor: tooltipBackground,
    color: '#c2beb3',
  },
  '.cm-tooltip .cm-tooltip-arrow:before': {
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  '.cm-tooltip .cm-tooltip-arrow:after': {
    borderTopColor: tooltipBackground,
    borderBottomColor: tooltipBackground,
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: '#ffffff14',
      color: '#c2beb3',
    },
  },
}, { dark: true })

export const vitesseHighlightStyle = HighlightStyle.define([
  {
    tag: [t.variableName, t.regexp],
    color: 'var(--cm-decorator)',
  },
  {
    tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
    color: property,
  },
  {
    tag: [t.function(t.variableName), t.labelName],
    color: variable,
  },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: '#c99076',
  },
  {
    tag: [t.definition(t.name), t.separator],
    color: foreground,
  },
  {
    tag: [t.angleBracket],
    color: '#666666',
  },
  {
    tag: [t.brace],
    color: '#5eaab5',
  },
  {
    tag: [t.bracket],
    color: '#4d9375',
  },
  {
    tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace, t.keyword, t.atom, t.bool, t.special(t.variableName)],
    color: keyword,
  },
  {
    tag: [t.definitionKeyword],
    color: 'var(--cm-definition-keyword)',
  },
  {
    tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.link, t.special(t.string)],
    color: punctuation,
  },
  {
    tag: [t.meta, t.comment],
    color: comment,
  },
  {
    tag: t.strong,
    fontWeight: 'bold',
  },
  {
    tag: t.emphasis,
    fontStyle: 'italic',
  },
  {
    tag: t.strikethrough,
    textDecoration: 'line-through',
  },
  {
    tag: t.link,
    color: lineNumber,
    textDecoration: 'underline',
  },
  {
    tag: t.heading,
    fontWeight: 'bold',
    color: property,
  },
  {
    tag: [t.processingInstruction, t.string, t.inserted],
    color: string,
  },
  {
    tag: t.invalid,
    color: invalid,
  },
])

export const vitesse: Extension = [vitesseTheme, syntaxHighlighting(vitesseHighlightStyle)]
