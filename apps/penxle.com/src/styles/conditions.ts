export const conditions = {
  invalid: '&:is(:invalid, [data-invalid], [aria-invalid="true"])',
  active: '&:is(:active:active, [data-active])',
  enabled: '&:is(:enabled, a[aria-disabled="false"])',
  disabled: '&:is(:disabled, [aria-disabled="true"])',
  busy: '&:is([aria-busy="true"])',
  hover: '&:is(:hover, [data-hover="true"])',
};
