<script>
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const links = [
      {
        name: 'twitter',
        url: 'https://twitter.com/permaswap'
      },
      {
        name: 'discord',
        url: 'https://discord.gg/WM5MQZGVPF'
      },
      {
        name: 'telegram',
        url: 'https://t.me/FinanceEver'
      }
    ]
    return {
      links
    }
  }
})
</script>

<template>
  <div style="width:1024px;" class="mx-auto flex flex-row items-center justify-between py-12">
    <div>
      <img class="h-8 mb-3" src="@/images/logo.png">
      <div class="text-xs font-light" style="color: rgba(255, 255, 255, 0.65);">
        ©2022 everFinance. All rights reserved
      </div>
    </div>
    <div class="flex flex-row items-center">
      <a
        v-for="(link, index) in links"
        :key="index"
        :href="link.url"
        target="_blank"
        class="ml-8">
        <img :src="require(`@/images/${link.name}.png`)">
      </a>
    </div>
  </div>
</template>
