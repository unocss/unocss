<div class="text-left">
  <div class="mb-2">
    You can find a port of <a href="https://tailwindcss-forms.vercel.app/"
      >@tailwindcss/forms</a
    >
    for UnoCSS at
    <a href="https://github.com/Julien-R44/unocss-preset-forms"
      >Julien-R44/unocss-preset-forms</a
    >. Here's a few examples but you should check out the original plugin's full
    <a href="https://tailwindcss-forms.vercel.app/">demo</a>.
  </div>

  <div class="mb-2">
    <input type="text" placeholder="out of the box input" />
    <input type="text" placeholder="styled input" class="styled-input" />
  </div>

  <select>
    <option>Out of the box</option>
    <option>Option 2</option>
    <option>Option 3</option>
  </select>

  <select class="pl-4 pr-12 py-3 rounded-full">
    <option>Custom padding and rounding</option>
    <option>Option 2</option>
    <option>Option 3</option>
  </select>

  <div class="flex items-center">
    <input id="my_rounded_checkbox" type="checkbox" class="rounded mr-2" />
    <label for="my_rounded_checkbox">.rounded</label>
  </div>

  <div class="flex items-center">
    <input id="my_checkbox" type="checkbox" class="text-pink-500 mr-2" />
    <label for="my_checkbox">.text-pink-500</label>
  </div>
</div>

<style>
  a {
    --at-apply: underline;
  }
</style>
