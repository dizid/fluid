<script setup lang="ts">
// Open course (T-0594): no accounts, so no profile, coach or sign-out links.
</script>

<template>
  <header class="header">
    <div class="header__container">
      <router-link to="/" class="header__logo">
        <span class="header__logo-text">Fluid Intimacy</span>
      </router-link>

      <nav class="header__nav">
        <router-link to="/modules" class="header__link">Modules</router-link>
        <router-link to="/guide" class="header__link">Personal guide</router-link>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: var(--color-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: var(--space-md) var(--space-lg);
  position: sticky;
  top: 0;
  z-index: var(--z-dropdown);
}

.header__container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__logo {
  text-decoration: none;
}

.header__logo-text {
  font-family: var(--font-family-serif);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.header__link {
  /* 24 px tap height on phones (text is 18 px): padding grows the tap area,
     the equal negative margin keeps the layout exactly where it was */
  padding: 3px 0;
  margin: -3px 0;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.header__link:hover {
  color: var(--color-primary);
}

.header__link.router-link-active {
  color: var(--color-primary);
}

.header__link--button {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

@media (max-width: 640px) {
  .header__nav {
    gap: var(--space-md);
  }

  .header__link {
    font-size: var(--font-size-xs);
  }
}
</style>
