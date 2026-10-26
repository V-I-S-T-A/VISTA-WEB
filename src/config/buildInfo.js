/* global __APP_UPDATED_AT__ */
export const APP_UPDATED_AT = __APP_UPDATED_AT__;
export const APP_UPDATED_LABEL = new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila',
}).format(new Date(APP_UPDATED_AT));
