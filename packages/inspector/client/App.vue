<template>
  <div h-full grid="~ cols-[1fr,4fr]">
    <Sidebar />
    <div h-full of-hidden>
      <RouterView />
    </div>
  </div>
</template>
