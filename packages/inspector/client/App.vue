<template>
  <div h-full grid="~ cols-[1fr,4fr]">
    <ModuleList b="r main" />
    <div h-full grid="~ rows-[max-content,1fr]" overflow-hidden>
      <NarBar />
      <RouterView />
    </div>
  </div>
</template>
