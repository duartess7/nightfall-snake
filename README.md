<div align="center">

# NIGHTFALL SNAKE

**An original TypeScript contribution serpent built for [@duartess7](https://github.com/duartess7).**

![Nightfall Snake](./dist/nightfall-snake.svg)

</div>

## About

Nightfall Snake turns the GitHub contribution calendar into an animated hunt: a glowing serpent crosses the entire grid, consumes active contribution cells and resets for another cycle.

This project is an independent implementation of the contribution-snake concept. Its path solver, animation timeline, SVG renderer and Nightfall visual system were written from scratch in TypeScript for `duartess7`; no contribution-snake generator source code was copied.

## Features

- original serpentine path solver;
- animated SVG with no browser-side JavaScript;
- contribution cells consumed in timeline order;
- direct GitHub GraphQL integration;
- deterministic demo mode and automated tests;
- daily regeneration through GitHub Actions;
- custom gothic purple Nightfall identity.

## Pipeline

```text
GitHub GraphQL API → TypeScript engine → animated SVG → profile README
```

## Embed

```html
<a href="https://github.com/duartess7/nightfall-snake">
  <img
    src="https://raw.githubusercontent.com/duartess7/nightfall-snake/main/dist/nightfall-snake.svg"
    alt="Nightfall Snake eating the duartess7 contribution grid"
    width="95%"
  />
</a>
```

## Authorship

Designed and developed for **duartess7**. The implementation, configuration, documentation and original visual design are not offered as open-source software.

Copyright © 2026 duartess7. All rights reserved. See [LICENSE.md](./LICENSE.md).
