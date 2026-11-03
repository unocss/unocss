// @unocss-includes
import type { ComputedRef, Ref } from 'vue'
import type { TabPanel } from '../../types'
import { computed, markRaw, ref, shallowRef } from 'vue'
import BasicInfo from '../../components/panels/BasicInfo.vue'
import BoxModel from '../../components/panels/BoxModel.vue'
import ClassList from '../../components/panels/ClassList.vue'
import DomTree from '../../components/panels/DomTree.vue'
import StylesInfo from '../../components/panels/InlineStyles.vue'
import Layout from '../../components/panels/layout/index.vue'
import Search from '../../components/panels/Search.vue'
import Settings from '../../components/panels/Settings.vue'
import TextContent from '../../components/panels/TextContent.vue'

interface UseTabsReturn {
  tabs: Ref<TabPanel[]>
  activeTab: ComputedRef<TabPanel>
  slideDirection: Ref<'left' | 'right'>
  setActiveTab: (id: string) => void
}

const defaultPanels: TabPanel[] = [
  { id: 'search', label: 'Search', icon: 'i-hugeicons:search-01', component: Search },
  { id: 'basic', label: 'Basic Info', icon: 'i-hugeicons:alert-diamond', component: BasicInfo },
  { id: 'classes', label: 'Class', icon: 'i-hugeicons:colors', component: ClassList },
  { id: 'styles', label: 'Inline Styles', icon: 'i-hugeicons:left-to-right-list-star', component: StylesInfo },
  { id: 'layout', label: 'Layout', icon: 'i-hugeicons:layout-03', component: Layout },
  // { id: 'colors', label: 'Colors', icon: 'i-hugeicons:biscuit', component: StylesInfo },
  { id: 'box', label: 'Box Model', icon: 'i-hugeicons:package-dimensions-02', component: BoxModel },
  { id: 'text', label: 'Text', icon: 'i-hugeicons:text-footnote', component: TextContent },
  { id: 'dom-tree', label: 'Dom Tree', icon: 'i-hugeicons:crowdfunding', component: DomTree },
  { id: 'setting', label: 'Setting', icon: 'i-hugeicons:ai-setting', component: Settings },
]

export function useTabs(userPanels: TabPanel[] = []): UseTabsReturn {
  const tabs = shallowRef<TabPanel[]>([...defaultPanels, ...userPanels].map(panel => ({ ...panel, component: markRaw(panel.component) })))
  const activeTabId = ref<string>(tabs.value[1].id)
  const slideDirection = ref<'left' | 'right'>('right')

  function setActiveTab(id: string) {
    const currentIndex = tabs.value.findIndex(tab => tab.id === activeTabId.value)
    const newIndex = tabs.value.findIndex(tab => tab.id === id)

    if (newIndex < currentIndex) {
      slideDirection.value = 'right'
    }
    else {
      slideDirection.value = 'left'
    }

    activeTabId.value = id
  }

  const activeTab = computed(() => tabs.value.find(tab => tab.id === activeTabId.value)!)

  return {
    tabs,
    activeTab,
    slideDirection,
    setActiveTab,
  }
}
