<template>
  <div id="app-container" class="w-full min-h-screen bg-gray-100">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Estilos globales si son necesarios. 
   La mayoría de los estilos estarán en style.css */
body {
  margin: 0;
}
</style>
