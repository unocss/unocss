<script setup lang="ts">
const data = new FormData()
const onChange = (e: InputEvent) => {
  debugger
  const files = e.target.files ?? []
  data.append('file', files)
  fetch('/upload', {
    method: 'post',
    body: data,
  })
}
// defineComponent({
//   setup() {
//     const uploadBtn = ref<any>(null);
//     const fileList = ref([]);

//     const data = new FormData();
//     const onChange = (e: InputEvent) => {
//       debugger;
//       const files = e.target.files ?? [];
//       data.append("file", files);
//       fetch("/upload", {
//         method: "post",
//         body: data,
//       });
//     };

//     return {
//       onChange,
//     }
//   },
// });
</script>

<template>
  <!-- <div
    relative
    font-mono
    overflow-auto
    text-sm
  > -->
  <div>
    <input
      id="form"
      ref="uploadBtn"
      type="file"
      accept=".vue"
      multiple="multiple"
      name="file"
      @change="onChange"
    />
    upload
  </div>
  <!-- <textarea ref="el" /> -->
  <!-- </div> -->
</template>
