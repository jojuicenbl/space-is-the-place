<script setup lang="ts">
import Card from '@/components/UI/Card.vue'
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Hero Section -->
      <section class="text-center mb-16 md:mb-24">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 tracking-tight">
          A PLACE FOR MUSIC EXPLORERS 
        </h1>
        <p class="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto">
          Space Is The Place is a visual and sonic home for record collectors.
        </p>
      </section>

      <!-- Manifesto Section -->
      <section class="mb-16 md:mb-24">
        <div class="grid md:grid-cols-2 gap-8 md:gap-12">
          <div class="space-y-8">
            <p class="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
              Music is memory. Music is motion. Music is orbit. Every record carries a fragment of someone's universe — a moment collected, preserved, replayed.
            </p>
            <p class="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
              I started this project as a personal archive, a way to map my own sonic journey through spiritual jazz, dub echoes, psychedelic currents, west-indies gems, deep house pulses, and far-off cosmic vibrations.
            </p>
          </div>
          <div class="space-y-8">
            <p class="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
              But collections aren't meant to stay hidden. They are meant to breathe, to be shared, to echo through others.
            </p>
            <p class="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
              Space Is The Place is now a home for all diggers. A place where anyone can connect their Discogs collection, explore it through a modern visual interface, and rediscover the music that shaped them. This is a space built for curiosity, for the joy of crate digging, for the stories pressed into wax. A space to wander, to listen, to remember.
            </p>
          </div>
        </div>
      </section>

      <!-- Why This Project Exists Section -->
      <section class="mb-16 md:mb-24">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 md:mb-12 text-center">
          Why this project exists
        </h2>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <Card variant="bordered" padding="lg" class="hover:shadow-lg transition-shadow duration-300">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
              A visual way to explore your Discogs collection
            </h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Not just data — an experience. Your records become a navigable universe instead of a static list.
            </p>
          </Card>

          <Card variant="bordered" padding="lg" class="hover:shadow-lg transition-shadow duration-300">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
              A tribute to the culture of digging
            </h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Vinyl, imperfections, sleeves, history, movement. This is for the ones who still flip through crates.
            </p>
          </Card>

          <Card variant="bordered" padding="lg" class="hover:shadow-lg transition-shadow duration-300 sm:col-span-2 md:col-span-1">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Built by a music lover, for music lovers
            </h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Designed around how collectors actually think about their shelves, their discoveries, and their rituals.
            </p>
          </Card>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="mb-16 md:mb-24">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 md:mb-12 text-center">
          How it works
        </h2>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
          <div class="flex flex-col items-center text-center space-y-4">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700">
              1
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Connect your Discogs account
            </h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Use a simple OAuth flow to link your collection securely.
            </p>
          </div>

          <div class="flex flex-col items-center text-center space-y-4">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700">
              2
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Explore your collection visually
            </h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Filter, search, and browse through albums with a clean, responsive grid.
            </p>
          </div>

          <div class="flex flex-col items-center text-center space-y-4 sm:col-span-2 md:col-span-1">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700">
              3
            </div>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Stream on Apple Music
            </h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Smart matching pulls in streaming links so you can listen as you explore.
            </p>
          </div>
        </div>
      </section>

      <!-- The Creator Section -->
      <section class="mb-16 md:mb-24">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 md:mb-12 text-center">
          The creator
        </h2>
        <div class="flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-3xl mx-auto">
          <div class="flex-shrink-0">
            <img
              src="/the-digger.jpeg"
              alt="The creator crate-digging"
              class="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
            />
          </div>
          <div class="text-center md:text-left space-y-4">
            <p class="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300">
              I'm a digger, a music lover, and a believer in the ritual of collecting. I built this space to map the sounds that shaped me — and now, to give others a place to explore theirs.
            </p>
            <p class="text-sm sm:text-base text-gray-500 dark:text-gray-500 italic">
              — Joris Neblai
            </p>
          </div>
        </div>
      </section>

      <!-- The Philosophy Section -->
      <section class="mb-12 md:mb-16">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 md:mb-12 text-center">
          The philosophy
        </h2>
        <div class="max-w-3xl mx-auto">
          <blockquote class="relative">
            <div class="border-l-4 border-gray-300 dark:border-gray-700 pl-6 md:pl-8 py-4">
              <p class="text-xl sm:text-2xl md:text-3xl font-light italic text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
                "Where we escape the limitations of earthly existence."
              </p>
              <cite class="text-sm sm:text-base text-gray-600 dark:text-gray-400 not-italic">
                — Sun Ra
              </cite>
            </div>
          </blockquote>
        </div>
      </section>

    </div>
  </div>
</template>
