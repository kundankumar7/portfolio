document.addEventListener("DOMContentLoaded", () => {
    const backButton = document.getElementById("back-btn");
    if (!backButton) return;

    // Constants
    const MAX_TAP_DURATION = 300; // ms
    const MAX_MOVE_DISTANCE = 15; // px

    let touchStartTime = 0;
    let startX = 0;
    let startY = 0;

    const goBack = () => {
        window.location.href = "/";
    };

    const isTapGesture = (duration, dx, dy) =>
        duration < MAX_TAP_DURATION && dx < MAX_MOVE_DISTANCE && dy < MAX_MOVE_DISTANCE;

    // Touch fallback (mobile, tablets, touchpads)
    backButton.addEventListener("touchstart", (event) => {
        if (event.touches.length === 1) {
            touchStartTime = Date.now();
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }
    }, { passive: false });

    backButton.addEventListener("touchend", (event) => {
        if (event.changedTouches.length === 1) {
            const elapsed = Date.now() - touchStartTime;
            const touch = event.changedTouches[0];
            const dx = Math.abs(touch.clientX - startX);
            const dy = Math.abs(touch.clientY - startY);

            if (isTapGesture(elapsed, dx, dy)) {
                if (event.cancelable) event.preventDefault();
                goBack();
            }
        }
    }, { passive: false });

    // Pointer fallback (modern browsers, pens, hybrid touch)
    backButton.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "touch" || event.pointerType === "pen") {
            touchStartTime = Date.now();
            startX = event.clientX;
            startY = event.clientY;
        }
    });

    backButton.addEventListener("pointerup", (event) => {
        if (event.pointerType === "touch" || event.pointerType === "pen") {
            const elapsed = Date.now() - touchStartTime;
            const dx = Math.abs(event.clientX - startX);
            const dy = Math.abs(event.clientY - startY);

            if (isTapGesture(elapsed, dx, dy)) {
                if (event.cancelable) event.preventDefault();
                goBack();
            }
        }
    });

    // Click fallback (mouse, keyboard)
    backButton.addEventListener("click", (event) => {
        if (event.cancelable) event.preventDefault();
        goBack();
    });
});
