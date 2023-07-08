import 'uno.css'
import './style.css'

// @unocss-include
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div h-screen w-screen flex>
    <div 
      text="5xl yellow"
      font-rounded ma
      flex="~ gap-2 items-center justify-center"
      px2 py1 ma cursor-default
      drop-shadow="color-yellow lg hover:xl"
      transition-all duration-300
    >
      <div i-ph-lightning-thin text-6xl></div>
      <div>UnoCSS + Lightning CSS</div>
    </div>
  </div>
`
