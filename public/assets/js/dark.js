(() => {
  // src/assets/js/dark.js
  function enableDarkMode() {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  }
  function disableDarkMode() {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }
  function detectColorScheme() {
    let theme = "light";
    if (localStorage.getItem("theme")) {
      theme = localStorage.getItem("theme");
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
    theme === "dark" ? enableDarkMode() : disableDarkMode();
  }
  detectColorScheme();
  document.getElementById("dark-mode-toggle").addEventListener("click", () => {
    localStorage.getItem("theme") === "light" ? enableDarkMode() : disableDarkMode();
  });
})();
//# sourceMappingURL=dark.js.map
