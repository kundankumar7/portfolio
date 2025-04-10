function applyTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Determine the theme: saved > OS preference > default light
    const theme = savedTheme || (prefersDark ? "dark" : "light");
    
    // Apply the theme
    if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        document.documentElement.removeAttribute("data-theme"); // or set "light"
    }
}

// Run on page load
applyTheme();