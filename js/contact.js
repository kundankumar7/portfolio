const linkedinLink = document.getElementById("linkedinLink");

linkedinLink.addEventListener("click", function (event) {
    event.preventDefault();

    const profileWebUrl = "https://www.linkedin.com/in/kundan89/";
    const androidAppIntentUrl = "intent://www.linkedin.com/in/kundan89/#Intent;package=com.linkedin.android;scheme=https;end;";
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
        // Try to open LinkedIn app using Android intent
        window.location.href = androidAppIntentUrl;

        // Fallback to browser after short delay if app is not installed
        setTimeout(() => {
            window.open(profileWebUrl, "_blank");
        }, 300);
    } else {
        // For iOS and desktop, open in new tab directly
        window.open(profileWebUrl, "_blank");
    }
});

