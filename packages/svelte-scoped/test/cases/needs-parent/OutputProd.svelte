<script lang="ts">
  export let onclick: () => any;
</script>

<button class="usp-n69tx1" on:click={onclick} type="button">
  <span class="usp-g9gauz" />
  <slot /></button
>

<style>
  :global(.usp-g9gauz) {
    background: url("data:image/svg+xml;utf8,%3Csvg viewBox='0 0 256 308' display='inline-block' vertical-align='middle' width='1em' height='1em' xmlns='http://www.w3.org/2000/svg' %3E%3Cpath fill='%23FF3E00' d='M239.682 40.707C211.113-.182 154.69-12.301 113.895 13.69L42.247 59.356a82.2 82.2 0 0 0-37.135 55.056a86.57 86.57 0 0 0 8.536 55.576a82.4 82.4 0 0 0-12.296 30.719a87.6 87.6 0 0 0 14.964 66.244c28.574 40.893 84.997 53.007 125.787 27.016l71.648-45.664a82.18 82.18 0 0 0 37.135-55.057a86.6 86.6 0 0 0-8.53-55.577a82.4 82.4 0 0 0 12.29-30.718a87.57 87.57 0 0 0-14.963-66.244'/%3E%3Cpath fill='%23FFF' d='M106.889 270.841c-23.102 6.007-47.497-3.036-61.103-22.648a52.7 52.7 0 0 1-9.003-39.85a50 50 0 0 1 1.713-6.693l1.35-4.115l3.671 2.697a92.5 92.5 0 0 0 28.036 14.007l2.663.808l-.245 2.659a16.07 16.07 0 0 0 2.89 10.656a17.14 17.14 0 0 0 18.397 6.828a15.8 15.8 0 0 0 4.403-1.935l71.67-45.672a14.92 14.92 0 0 0 6.734-9.977a15.92 15.92 0 0 0-2.713-12.011a17.16 17.16 0 0 0-18.404-6.832a15.8 15.8 0 0 0-4.396 1.933l-27.35 17.434a52.3 52.3 0 0 1-14.553 6.391c-23.101 6.007-47.497-3.036-61.101-22.649a52.68 52.68 0 0 1-9.004-39.849a49.43 49.43 0 0 1 22.34-33.114l71.664-45.677a52.2 52.2 0 0 1 14.563-6.398c23.101-6.007 47.497 3.036 61.101 22.648a52.7 52.7 0 0 1 9.004 39.85a51 51 0 0 1-1.713 6.692l-1.35 4.116l-3.67-2.693a92.4 92.4 0 0 0-28.037-14.013l-2.664-.809l.246-2.658a16.1 16.1 0 0 0-2.89-10.656a17.14 17.14 0 0 0-18.398-6.828a15.8 15.8 0 0 0-4.402 1.935l-71.67 45.674a14.9 14.9 0 0 0-6.73 9.975a15.9 15.9 0 0 0 2.709 12.012a17.16 17.16 0 0 0 18.404 6.832a15.8 15.8 0 0 0 4.402-1.935l27.345-17.427a52.2 52.2 0 0 1 14.552-6.397c23.101-6.006 47.497 3.037 61.102 22.65a52.68 52.68 0 0 1 9.003 39.848a49.45 49.45 0 0 1-22.34 33.12l-71.664 45.673a52.2 52.2 0 0 1-14.563 6.398'/%3E%3C/svg%3E")
      no-repeat;
    background-size: 100% 100%;
    background-color: transparent;
    display: inline-block;
    vertical-align: middle;
    width: 1em;
    height: 1em;
  }
  :global(.usp-n69tx1) {
    font-weight: 600;
  }
  button {
    border-radius: 0.25rem;
    --un-bg-opacity: 1;
    background-color: rgb(254 226 226 / var(--un-bg-opacity));
    padding: 0.75rem;
  }
  button:hover {
    --un-bg-opacity: 1;
    background-color: rgb(254 202 202 / var(--un-bg-opacity));
  }
  :global(.dark) button {
    --un-bg-opacity: 1;
    background-color: rgb(185 28 28 / var(--un-bg-opacity));
  }
  :global(.dark) button:hover {
    --un-bg-opacity: 1;
    background-color: rgb(220 38 38 / var(--un-bg-opacity));
  }
</style>
