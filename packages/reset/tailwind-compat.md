# @unocss/reset/tailwind-compat.css

Based on [tailwind.css](./tailwind.css), with some styles clean up to avoid conflicts with UI frameworks.

### Changes

#### Remove background color override for buttons

Linked issue: [#2127](https://github.com/unocss/unocss/issues/2127)

<table>
<thead>
<tr style="text-align: center">
<th>Before</th>
<th>After</th>
</tr>
</thead>
<tbody>
<tr>
<td>

```css
button,
[type='button'],
[type='reset'],
[type='submit'] {
  -webkit-appearance: button; /* 1 */
  background-color: transparent; /* 2 */
  background-image: none; /* 2 */
}
```

</td>

<td>

```css
button,
[type='button'],
[type='reset'],
[type='submit'] {
  -webkit-appearance: button; /* 1 */
  /*background-color: transparent; !* 2 *!*/
  background-image: none; /* 2 */
}
```

</td>
</tr>
</tbody>
</table>


