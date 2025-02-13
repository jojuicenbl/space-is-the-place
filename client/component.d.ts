import type { ComponentOptions } from "vue"

declare module "*.vue" {
  const component: ComponentOptions
  export default component
}

declare module "@vue/runtime-core" {
  interface GlobalComponents {
    VContainer: (typeof import("vuetify/components"))["VContainer"]
    VRow: (typeof import("vuetify/components"))["VRow"]
    VCol: (typeof import("vuetify/components"))["VCol"]
    VCard: (typeof import("vuetify/components"))["VCard"]
    VBtn: (typeof import("vuetify/components"))["VBtn"]
    VTextField: (typeof import("vuetify/components"))["VTextField"]
    VSelect: (typeof import("vuetify/components"))["VSelect"]
    VDialog: (typeof import("vuetify/components"))["VDialog"]
    VMenu: (typeof import("vuetify/components"))["VMenu"]
    VList: (typeof import("vuetify/components"))["VList"]
    VListItem: (typeof import("vuetify/components"))["VListItem"]
  }
}
