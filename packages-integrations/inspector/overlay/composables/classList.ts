import { computed, ref, watch } from 'vue'
import { useElement } from './exports/element'

const HIDDEN_CLASSES_ATTR = 'data-hidden-classes'

export function useClassList() {
  const { element, tracking, triggering } = useElement()

  const allClasses = ref<Set<string>>(new Set())
  const originalClassOrder = ref<string[]>([])
  const hiddenClasses = ref<Set<string>>(new Set())

  const activeClasses = computed(() => {
    tracking()

    if (!element.value) {
      return []
    }

    return Array.from(element.value.classList)
  })

  // Load hidden classes from the element's custom attribute
  function loadHiddenClasses(el: Element) {
    const hiddenClassesStr = el.getAttribute(HIDDEN_CLASSES_ATTR)
    if (hiddenClassesStr) {
      hiddenClasses.value = new Set(hiddenClassesStr.split(' ').filter(Boolean))
    }
    else {
      hiddenClasses.value.clear()
    }
  }

  // Save hidden classes to the element's custom attribute
  function saveHiddenClasses(el: Element) {
    if (hiddenClasses.value.size > 0) {
      el.setAttribute(HIDDEN_CLASSES_ATTR, Array.from(hiddenClasses.value).join(' '))
    }
    else {
      el.removeAttribute(HIDDEN_CLASSES_ATTR)
    }
  }

  watch(
    () => element.value,
    (newElement) => {
      allClasses.value.clear()
      originalClassOrder.value = []
      hiddenClasses.value.clear()

      if (newElement) {
        // Load hidden classes from the element's custom attribute
        loadHiddenClasses(newElement)

        const classList = Array.from(newElement.classList)
        // Record original order
        originalClassOrder.value = [...classList]
        classList.forEach((className) => {
          allClasses.value.add(className)
        })

        // Add hidden classes to 「allClasses」 and 「originalClassOrder」
        hiddenClasses.value.forEach((className) => {
          if (!allClasses.value.has(className)) {
            allClasses.value.add(className)
            originalClassOrder.value.push(className)
          }
        })
      }
    },
    { immediate: true },
  )

  watch(
    activeClasses,
    (newClasses) => {
      newClasses.forEach((className) => {
        if (!allClasses.value.has(className)) {
          allClasses.value.add(className)
          if (!originalClassOrder.value.includes(className)) {
            originalClassOrder.value.push(className)
          }
        }
      })
    },
    { immediate: true },
  )

  const displayClasses = computed(() => {
    return originalClassOrder.value.filter(className => allClasses.value.has(className))
  })

  const classList = computed({
    get: () => activeClasses.value,
    set: (newList: string[]) => {
      if (!element.value) {
        return
      }

      // Find out the classes that have been unchecked
      const currentClasses = new Set(activeClasses.value)
      const newClassesSet = new Set(newList)

      // Find out the classes that have been unchecked
      currentClasses.forEach((className) => {
        if (!newClassesSet.has(className)) {
          hiddenClasses.value.add(className)
        }
      })

      // Find out the classes that have been unchecked
      newList.forEach((className) => {
        if (hiddenClasses.value.has(className)) {
          hiddenClasses.value.delete(className)
        }
      })

      saveHiddenClasses(element.value)

      const orderedList = originalClassOrder.value.filter(className => newList.includes(className))
      const newClasses = newList.filter(className => !originalClassOrder.value.includes(className))
      const finalList = [...orderedList, ...newClasses]

      element.value.className = finalList.join(' ')

      triggering()
    },
  })

  return {
    displayClasses,
    classList,
    originalClassOrder: computed(() => originalClassOrder.value),
  }
}
