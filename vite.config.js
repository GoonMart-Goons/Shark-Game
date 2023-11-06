// vite.config.js
export default {
  build: {
    rollupOptions: {
      input: {
        main: './main.js', // Adjust the path to your main entry file
        index: './index.html'
      },
    },
  },
};