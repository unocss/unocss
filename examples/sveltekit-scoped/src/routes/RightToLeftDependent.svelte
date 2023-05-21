<script>
  import ReceivesClassProp from "./ReceivesClassProp.svelte";
</script>

<div class="flex space-x-1 md:space-x-4 rtl:space-x-reverse">
  <div class="rtl:text-green-600">Green when RTL</div>
  <ReceivesClassProp class="text-blue-500 font-semibold" number={1} />
  <ReceivesClassProp class="text-red-500 font-bold" number={2} />
  <ReceivesClassProp number={3} />
</div>

<div class="apply-spacing">
  <div class="rtl:text-green-600">Green when RTL</div>
  <ReceivesClassProp class="text-blue-500 font-semibold" number={1} />
  <ReceivesClassProp class="text-red-500 font-bold" number={2} />
  <ReceivesClassProp number={3} />
</div>

<style>
  .apply-spacing {
    --at-apply: flex space-x-1 md:space-x-4 rtl:space-x-reverse;
  }
</style>
