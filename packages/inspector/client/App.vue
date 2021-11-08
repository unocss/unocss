<template>
  <div h-full grid="~ cols-[1fr,4fr]">
    <div h-full grid="~ rows-[max-content,1fr]" b="r main" of-hidden>
      <NarBar />
      <ModuleList />
    </div>
    <div h-full of-hidden>
      <RouterView />
    </div>
  </div>
</template>
