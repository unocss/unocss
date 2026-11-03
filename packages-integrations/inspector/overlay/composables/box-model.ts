export function getBoxModel(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  const px = (value: string) => Number.parseFloat(value) || 0
  const margin = { top: px(style.marginTop), right: px(style.marginRight), bottom: px(style.marginBottom), left: px(style.marginLeft) }
  const padding = { top: px(style.paddingTop), right: px(style.paddingRight), bottom: px(style.paddingBottom), left: px(style.paddingLeft) }
  const border = { top: px(style.borderTopWidth), right: px(style.borderRightWidth), bottom: px(style.borderBottomWidth), left: px(style.borderLeftWidth) }
  return {
    containerTop: rect.top - margin.top,
    containerLeft: rect.left - margin.left,
    containerWidth: rect.width + margin.left + margin.right,
    containerHeight: rect.height + margin.top + margin.bottom,
    elementWidth: rect.width,
    elementHeight: rect.height,
    paddingWidth: Math.max(0, rect.width - border.left - border.right),
    paddingHeight: Math.max(0, rect.height - border.top - border.bottom),
    contentWidth: Math.max(0, rect.width - border.left - border.right - padding.left - padding.right),
    contentHeight: Math.max(0, rect.height - border.top - border.bottom - padding.top - padding.bottom),
    margin,
    padding,
    border,
  }
}
