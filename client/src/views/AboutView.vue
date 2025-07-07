<script setup lang="ts">
import AppNavbar from '@/components/Nav/AppNavbar.vue'
</script>

<template>
  <div class="about-page">
    <AppNavbar />
    <div class="page-content">
      <div class="about-container">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-content">
            <h1 class="page-title">ABOUT THE DIGGER</h1>
            <div class="hero-subtitle">A journey through sound, wax, and endless exploration</div>
          </div>
        </section>

        <!-- Main Content -->
        <section class="main-content">
          <div class="content-grid">
            <!-- Photo Section -->
            <div class="photo-section">
              <div class="photo-container">
                <div class="photo-placeholder">
                  <div class="placeholder-content">
                    <div class="placeholder-icon">📀</div>
                    <div class="placeholder-text">
                      Photo coming soon<br />
                      <span class="placeholder-subtext">Digger in action</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Text Content -->
            <div class="text-content">
              <div class="story-section">
                <p class="story-paragraph">
                  Behind every record lies a story. A moment in time, a vibration, a quest. Mine
                  began years ago, fingers deep in record bins, chasing that elusive feeling. Today,
                  my collection is a reflection of my sonic explorations — a journey through
                  spiritual jazz, psychedelic rock, hypnotic dub, frenetic jungle, abstract beats,
                  and far beyond.
                </p>

                <p class="story-paragraph">
                  I'm a digger. A music lover. A wax collector drawn to the warm imperfection of
                  vinyl, the analog hiss, the visual poetry of record sleeves. My collection is a
                  mosaic of influences — Black Jazz and roots reggae, punk rebellion and Detroit
                  house, meditative world grooves and raw hip-hop. Each record is a meeting, a
                  memory, a pulse frozen in time.
                </p>

                <p class="story-paragraph">
                  <strong>Space Is The Place</strong> isn't just a project. It's my space, my tempo,
                  my tribute to the music that inspires me. Through this app, I'm opening a window
                  into my universe — a visual and sonic archive of the sounds that move me.
                </p>

                <div class="closing-question">
                  <p class="question-text">Can you dig it?</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Decorative Elements -->
        <!-- <div class="decorative-vinyl">
          <div class="vinyl-record vinyl-1"></div>
          <div class="vinyl-record vinyl-2"></div>
          <div class="vinyl-record vinyl-3"></div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Rubik+Mono+One&display=swap');

.about-page {
  min-height: 100vh;
  background: var(--color-background);
}

.page-content {
  padding-top: 80px;
  min-height: calc(100vh - 80px);
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  overflow: hidden;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 4rem 0 3rem 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 4rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-family: 'Rubik Mono One', monospace;
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 400;
  color: var(--color-heading);
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  line-height: 1.1;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 3vw, 1.4rem);
  color: var(--color-text);
  font-weight: 300;
  letter-spacing: 0.02em;
  opacity: 0.8;
}

/* Main Content Grid */
.main-content {
  margin-bottom: 4rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  align-items: start;
}

/* Photo Section */
.photo-section {
  position: sticky;
  top: 120px;
}

.photo-container {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%);
  border: 2px solid var(--color-border);
  transition: all 0.3s ease;
}

.photo-container:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: var(--color-border-hover);
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  padding: 2rem;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.placeholder-text {
  color: var(--color-text);
  font-weight: 500;
  font-size: 1.1rem;
  line-height: 1.4;
  opacity: 0.7;
}

.placeholder-subtext {
  font-size: 0.9rem;
  font-weight: 300;
  opacity: 0.6;
  font-style: italic;
}

/* Text Content */
.text-content {
  padding: 1rem 0;
}

.story-section {
  max-width: 100%;
}

.story-paragraph {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  color: var(--color-text);
  text-align: justify;
  text-justify: inter-word;
}

.story-paragraph:first-child {
  font-size: 1.3rem;
  font-weight: 500;
}

.closing-question {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  border-left: 4px solid hsla(160, 100%, 37%, 1);
  text-align: center;
}

.question-text {
  font-family: 'Rubik Mono One', monospace;
  font-size: 1.4rem;
  color: var(--color-heading);
  margin: 0;
  letter-spacing: 0.02em;
}

/* Decorative Vinyl Records */
/* .decorative-vinyl {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
} */

.vinyl-record {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    #1a1a1a 25%,
    #333 26%,
    #333 45%,
    #1a1a1a 46%,
    #1a1a1a 100%
  );
  opacity: 0.03;
  animation: rotate 30s linear infinite;
}

.vinyl-record::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1a1a1a;
}

.vinyl-1 {
  top: 10%;
  right: -60px;
  animation-duration: 40s;
}

.vinyl-2 {
  bottom: 20%;
  left: -60px;
  animation-duration: 50s;
  animation-direction: reverse;
}

.vinyl-3 {
  top: 60%;
  right: -80px;
  animation-duration: 35s;
  width: 80px;
  height: 80px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .photo-section {
    position: static;
    order: 2;
  }

  .text-content {
    order: 1;
  }

  .photo-container {
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 0 1.5rem;
  }

  .hero-section {
    padding: 3rem 0 2rem 0;
    margin-bottom: 3rem;
  }

  .content-grid {
    gap: 2rem;
  }

  .story-paragraph {
    font-size: 1.1rem;
    text-align: left;
  }

  .story-paragraph:first-child {
    font-size: 1.2rem;
  }

  .closing-question {
    padding: 1.5rem;
    margin-top: 2rem;
  }

  .question-text {
    font-size: 1.2rem;
  }

  .decorative-vinyl {
    display: none;
  }
}

@media (max-width: 480px) {
  .about-container {
    padding: 0 1rem;
  }

  .hero-section {
    padding: 2rem 0 1.5rem 0;
    margin-bottom: 2rem;
  }

  .story-paragraph {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }

  .story-paragraph:first-child {
    font-size: 1.1rem;
  }

  .question-text {
    font-size: 1.1rem;
  }

  .photo-container {
    max-width: 300px;
  }

  .placeholder-icon {
    font-size: 3rem;
  }

  .placeholder-text {
    font-size: 1rem;
  }
}

/* Performance optimization for animations */
@media (prefers-reduced-motion: reduce) {
  .vinyl-record {
    animation: none;
  }

  .photo-container:hover {
    transform: none;
  }
}
</style>
