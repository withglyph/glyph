<div
  class="flex [&>*]:flex-1
    [&>*:first-child]:(rounded-r-none border-r-none)
    [&>*:not(:first-child,:last-child)]:(rounded-(l-none r-none) border-r-none)
    [&>*:last-child]:rounded-l-none
    "
  role="group"
>
  <slot />
</div>
