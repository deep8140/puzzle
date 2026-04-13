import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        puzzle: resolve(__dirname, 'puzzle.html'),
        tictactoe: resolve(__dirname, 'tictactoe.html'),
        memory: resolve(__dirname, 'memory.html'),
        snake: resolve(__dirname, 'snake.html'),
        rps: resolve(__dirname, 'rps.html'),
      },
    },
  },
});
