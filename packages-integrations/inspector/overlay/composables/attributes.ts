import { computed, ref, watch } from 'vue'
import { useElement } from './exports/element'

const FILTERED_ATTRIBUTES = ['class', 'id', 'href', 'src', 'style', 'alt', 'data-v-', 'data-hidden-classes', 'data-hidden-attributes']
const HIDDEN_ATTRIBUTES_ATTR = 'data-hidden-attributes'

export function useAttributes() {
  const { element, tracking, triggering } = useElement()

  const allAttributes = ref<Map<string, Set<string>>>(new Map())
  const originalAttributeOrder = ref<string[]>([])
  const originalValueOrder = ref<Map<string, string[]>>(new Map())
  const hiddenAttributes = ref<Map<string, string[]>>(new Map())

  const activeAttributes = computed(() => {
    tracking()

    if (!element.value) {
      return new Map<string, Set<string>>()
    }

    const attrs = new Map<string, Set<string>>()
    for (let i = 0; i < element.value.attributes.length; i++) {
      const attr = element.value.attributes[i]
      if (!FILTERED_ATTRIBUTES.some(i => attr.name.startsWith(i))) {
        const list = attr.value.split(' ').filter(Boolean)
        attrs.set(attr.name, new Set(list.length > 0 ? list : ['~']))
      }
    }
    return attrs
  })

  // 从元素的自定义属性中读取隐藏的属性
  function loadHiddenAttributes(el: Element) {
    const hiddenAttrsStr = el.getAttribute(HIDDEN_ATTRIBUTES_ATTR)
    hiddenAttributes.value.clear()

    if (hiddenAttrsStr) {
      try {
        const hiddenData = JSON.parse(hiddenAttrsStr) as Record<string, string[]>
        Object.entries(hiddenData).forEach(([attrName, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            hiddenAttributes.value.set(attrName, values)
          }
        })
      }
      catch (error) {
        // 如果解析失败，忽略
        console.warn('Failed to parse hidden attributes:', error)
      }
    }
  }

  // 将隐藏的属性保存到元素的自定义属性中
  function saveHiddenAttributes(el: Element) {
    if (hiddenAttributes.value.size > 0) {
      const hiddenData: Record<string, string[]> = {}
      hiddenAttributes.value.forEach((values, attrName) => {
        hiddenData[attrName] = values
      })
      el.setAttribute(HIDDEN_ATTRIBUTES_ATTR, JSON.stringify(hiddenData))
    }
    else {
      el.removeAttribute(HIDDEN_ATTRIBUTES_ATTR)
    }
  }

  watch(
    () => element.value,
    (newElement) => {
      allAttributes.value.clear()
      originalAttributeOrder.value = []
      originalValueOrder.value.clear()
      hiddenAttributes.value.clear()

      if (newElement) {
        // 加载隐藏的属性
        loadHiddenAttributes(newElement)

        for (let i = 0; i < newElement.attributes.length; i++) {
          const attr = newElement.attributes[i]
          if (!FILTERED_ATTRIBUTES.some(i => attr.name.startsWith(i))) {
            originalAttributeOrder.value.push(attr.name)

            const values = attr.value.split(' ').filter(Boolean)
            allAttributes.value.set(attr.name, new Set(values))

            originalValueOrder.value.set(attr.name, values.length > 0 ? values : ['~'])
          }
        }

        // 将隐藏的属性也添加到 allAttributes 和 originalAttributeOrder 中
        hiddenAttributes.value.forEach((values, attrName) => {
          if (!allAttributes.value.has(attrName)) {
            allAttributes.value.set(attrName, new Set(values))
            originalAttributeOrder.value.push(attrName)
          }
          else {
            // 如果属性已存在，将隐藏的值也添加到 allAttributes 中
            values.forEach((value) => {
              allAttributes.value.get(attrName)!.add(value)
            })
          }

          if (!originalValueOrder.value.has(attrName)) {
            originalValueOrder.value.set(attrName, values)
          }
          else {
            // 如果顺序已存在，将隐藏的值追加到顺序列表中（如果还不存在的话）
            const existingOrder = originalValueOrder.value.get(attrName)!
            const newValues = values.filter(v => !existingOrder.includes(v))
            if (newValues.length > 0) {
              originalValueOrder.value.set(attrName, [...existingOrder, ...newValues])
            }
          }
        })
      }
    },
    { immediate: true },
  )

  watch(
    activeAttributes,
    (newAttrs) => {
      newAttrs.forEach((values, attrName) => {
        if (!allAttributes.value.has(attrName)) {
          allAttributes.value.set(attrName, new Set())
          if (!originalAttributeOrder.value.includes(attrName)) {
            originalAttributeOrder.value.push(attrName)
          }
        }

        values.forEach((value) => {
          allAttributes.value.get(attrName)!.add(value)
        })

        if (!originalValueOrder.value.has(attrName)) {
          originalValueOrder.value.set(attrName, Array.from(values))
        }
        else {
          const existingOrder = originalValueOrder.value.get(attrName)!
          const newValues = Array.from(values).filter(v => !existingOrder.includes(v))
          originalValueOrder.value.set(attrName, [...existingOrder, ...newValues])
        }
      })
    },
    { immediate: true },
  )

  const attributes = computed(() => {
    const result = new Map<string, { all: string[], active: string[] }>()

    originalAttributeOrder.value.forEach((attrName) => {
      if (allAttributes.value.has(attrName)) {
        const allValues = allAttributes.value.get(attrName)!
        const activeValues = activeAttributes.value.get(attrName) || new Set()

        const originalOrder = originalValueOrder.value.get(attrName) || []
        const orderedAllValues = originalOrder.filter(v => allValues.has(v))
        const orderedActiveValues = originalOrder.filter(v => activeValues.has(v))

        result.set(attrName, {
          all: orderedAllValues,
          active: orderedActiveValues,
        })
      }
    })

    return result
  })

  function updateAttribute(attrName: string, newValues: string[]) {
    if (!element.value) {
      return
    }

    const currentActiveValues = activeAttributes.value.get(attrName)
    const currentActiveArray = currentActiveValues ? Array.from(currentActiveValues) : []

    // 找出被删除的值（当前活跃但不在新值中的）
    const removedValues = currentActiveArray.filter(value => !newValues.includes(value))

    // 找出被恢复的值（之前隐藏但现在在新值中的）
    const hiddenValues = hiddenAttributes.value.get(attrName) || []
    const restoredValues = hiddenValues.filter(value => newValues.includes(value))

    // 更新隐藏属性映射
    if (removedValues.length > 0) {
      const existingHidden = hiddenAttributes.value.get(attrName) || []
      const updatedHidden = [...new Set([...existingHidden, ...removedValues])]
      hiddenAttributes.value.set(attrName, updatedHidden)
    }

    if (restoredValues.length > 0) {
      const existingHidden = hiddenAttributes.value.get(attrName) || []
      const updatedHidden = existingHidden.filter(value => !restoredValues.includes(value))
      if (updatedHidden.length > 0) {
        hiddenAttributes.value.set(attrName, updatedHidden)
      }
      else {
        hiddenAttributes.value.delete(attrName)
      }
    }

    // 保存隐藏的属性到元素
    saveHiddenAttributes(element.value)

    // 如果为空数组，则删除属性
    if (newValues.length === 0) {
      element.value.removeAttribute(attrName)
    }
    // 如果只包含占位符 '~'，则添加空属性
    else if (newValues.length === 1 && newValues[0] === '~') {
      element.value.setAttribute(attrName, '')
    }
    else {
      // 过滤掉占位符 '~'，只设置实际的值
      const filteredValues = newValues.filter(value => value !== '~')
      if (filteredValues.length === 0) {
        element.value.removeAttribute(attrName)
      }
      else {
        // 按照原始顺序重新排列值
        const originalOrder = originalValueOrder.value.get(attrName) || []
        const orderedValues = originalOrder.filter(value => filteredValues.includes(value))
        const newUniqueValues = filteredValues.filter(value => !originalOrder.includes(value))
        const finalValues = [...orderedValues, ...newUniqueValues]

        element.value.setAttribute(attrName, finalValues.join(' '))
      }
    }
    triggering()
  }

  return {
    attributes,
    updateAttribute,
    originalAttributeOrder: computed(() => originalAttributeOrder.value),
    originalValueOrder: computed(() => originalValueOrder.value),
  }
}
