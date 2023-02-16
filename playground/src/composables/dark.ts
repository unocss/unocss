export const isDark = useDark()
export const toggleDark = () => {
  isDark.value = !isDark.value
}
