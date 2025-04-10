const githubLink = document.getElementById("githubLink");

githubLink.addEventListener("click", function (event) {
    event.preventDefault();

    const profileWebUrl = "https://github.com/kundankumar7";
    const androidIntentUrl = "intent://github.com/kundankumar7#Intent;package=com.github.android;scheme=https;end;";
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
        // Try opening the GitHub app using Android intent
        window.location.href = androidIntentUrl;

        // Fallback: open profile in browser if app isn't installed
        setTimeout(() => {
            window.open(profileWebUrl, "_blank");
        }, 300);
    } else {
        // For iOS or desktop, just open in a new tab
        window.open(profileWebUrl, "_blank");
    }
});

