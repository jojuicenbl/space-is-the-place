<template>
  <div id="app">
    <!-- <NavBar /> -->
    <HeaderBar />
    <div>Space is the place where we can escape the limitations of our earthly existence</div>
    <router-view></router-view>
  </div>
</template>

<script>
import NavBar from './components/Nav/Nav.vue'
import HeaderBar from './components/Header/Header.vue'

export default {
  name: 'app',
  components: {
    // NavBar,
    HeaderBar
  }
}
</script>

<style></style>
