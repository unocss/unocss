export const directionMap: Record<string, string[]> = {
  'l': ['-left'],
  'r': ['-right'],
  't': ['-top'],
  'b': ['-bottom'],
  's': ['-inline-start'],
  'e': ['-inline-end'],
  'x': ['-left', '-right'],
  'y': ['-top', '-bottom'],
  '': [''],
  'a': [''],
}

export const cornerMap: Record<string, string[]> = {
  't': ['-top-left', '-top-right'],
  'r': ['-top-right', '-bottom-right'],
  'b': ['-bottom-left', '-bottom-right'],
  'l': ['-bottom-left', '-top-left'],
  'tl': ['-top-left'],
  'lt': ['-top-left'],
  'tr': ['-top-right'],
  'rt': ['-top-right'],
  'bl': ['-bottom-left'],
  'lb': ['-bottom-left'],
  'br': ['-bottom-right'],
  'rb': ['-bottom-right'],
  '': [''],
}

export const xyzMap: Record<string, string[]> = {
  'x': ['-x'],
  'y': ['-y'],
  'z': ['-z'],
  '': ['-x', '-y'],
}

const basePositionMap = [
  'top',
  'top center',
  'top left',
  'top right',
  'bottom',
  'bottom center',
  'bottom left',
  'bottom right',
  'left',
  'left center',
  'left top',
  'left bottom',
  'right',
  'right center',
  'right top',
  'right bottom',
  'center',
  'center top',
  'center bottom',
  'center left',
  'center right',
  'center center',
]

export const positionMap: Record<string, string> = Object.assign(
  {},

  // [{ top: 'top' }, { 'top-center': 'top center' }, ...]
  ...basePositionMap.map(p => ({ [p.replace(/ /, '-')]: p })),

  // [{ t: 'top' }, { tc: 'top center' }, ...]
  ...basePositionMap.map(p => ({ [p.replace(/\b(\w)\w+/g, '$1').replace(/ /, '')]: p })),
)
