// for debugging overflow element
document.querySelectorAll('*').forEach(el => {
    if (el.scrollWidth > document.documentElement.clientWidth) {
        console.log('Overflowing Element:', el, 'Width:', el.scrollWidth);
        el.style.outline = '2px solid red'; // Highlight the element
    }
});


// Restore original position while switching between pages
// Save position
const saveScroll = () => {
    const position = document.documentElement.scrollTop ||
        document.body.scrollTop ||
        window.scrollY;
    sessionStorage.setItem("scrollPosition", position);
};

window.addEventListener("beforeunload", saveScroll);
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden') saveScroll();
});

// Restore position
window.addEventListener("load", () => {
    const scrollPosition = sessionStorage.getItem("scrollPosition");
    if (scrollPosition) {
        setTimeout(() => {
            window.scrollTo({
                top: Number(scrollPosition),
                behavior: 'instant'
            });
        }, 50);
    }
});

// Theme Toggle for big screen
//  Theme Apply starts here for big screen
const themeToggle = document.getElementById("theme-toggle");
const root = document.documentElement;
const sunIcon = document.querySelector(".theme-icon-wrapper .sun");
const moonIcon = document.querySelector(".theme-icon-wrapper .moon");

function getPreferredTheme() {
    return localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    //   Toggle icon visibility
    if (theme === "dark") {
        sunIcon.style.opacity = "0";
        moonIcon.style.opacity = "1";
    } else {
        sunIcon.style.opacity = "1";
        moonIcon.style.opacity = "0";
    }
}

// Flag to track touch events
let isTouchDevice = false;

// Detect touch events and set the flag
themeToggle.addEventListener("touchstart", () => {
    isTouchDevice = true;  // Mark that the user is on a touch device
    const currentTheme = root.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    applyTheme(newTheme);
});

// Prevent click event if it was a touch event
themeToggle.addEventListener("click", (event) => {
    if (isTouchDevice) {
        event.preventDefault();  // Prevent the click event from firing on touch devices
        isTouchDevice = false;   // Reset the flag after the click event has been prevented
    } else {
        const currentTheme = root.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";

        applyTheme(newTheme);
    }
});

// Apply theme on load
// applyTheme(getPreferredTheme()); // already handled separately

// Hide/show navbar + progress bar animation
document.addEventListener("DOMContentLoaded", function () {

    // 1. Scroll Behavior + Hide/Show Navbar
    const stickyHeader = document.getElementById("sticky-header");
    let lastScrollY = window.scrollY;
    const headerDefaultMargin = 24; // 1.5rem = 24px
    const scrollThreshold = 50; // Minimum scroll before hiding
    const showThreshold = 10; // Scroll up distance to show header
    let initialMarginTop;
    let totalHeaderSpaceCached = null;

    // Dynamically Calculate Header Height & Margins
    function updateHeaderHeight() {
        const computedStyle = window.getComputedStyle(stickyHeader);
        const marginTop = parseFloat(computedStyle.marginTop) || 0;
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
        const headerHeight = parseFloat(computedStyle.height);

        const totalHeaderSpace = marginTop + marginBottom + headerHeight;
        totalHeaderSpaceCached = totalHeaderSpace;

        // Store in CSS variable for use in padding calculations
        document.documentElement.style.setProperty("--sticky-header-height", `${headerHeight}px`);
        document.documentElement.style.setProperty("--total-header-space", `${totalHeaderSpace}px`);

        // console.log(`[UPDATE] Total Header Space: ${totalHeaderSpace}px (Margin: ${marginTop}px + ${marginBottom}px, Height: ${headerHeight}px)`);
    }

    // Apply Padding Compensation Dynamically
    function applyPaddingCompensation() {
        const paddingValue = stickyHeader.classList.contains("sticky") && totalHeaderSpaceCached
            ? `${totalHeaderSpaceCached}px`
            : "0px";

        document.body.style.paddingTop = paddingValue;

        // console.log(`[APPLY] Body padding-top: ${paddingValue}`);
    }

    // Handle Scroll Behavior
    function handleScroll() {
        const currentScrollY = window.scrollY;

        // User is scrolling up
        if (currentScrollY < lastScrollY) {
            if (stickyHeader.classList.contains("hidden")) {
                // console.log("[SHOW] Scrolling up, showing header.");
                stickyHeader.classList.remove("hidden");
            }
        }
        // User is scrolling down (only hide after significant movement)
        else if (currentScrollY > lastScrollY + scrollThreshold) {
            if (!stickyHeader.classList.contains("hidden") && stickyHeader.classList.contains("sticky")) {
                // console.log("[HIDE] Significant scroll down, hiding header.");
                stickyHeader.classList.add("hidden");
            }
        }

        // Transition to Sticky Mode
        if (currentScrollY >= headerDefaultMargin) {
            if (!stickyHeader.classList.contains("sticky")) {
                // console.log(" [STICKY] Header reached top, activating sticky mode.");
                document.body.classList.add("sticky-header-active");
                applyPaddingCompensation(); // Update padding

                // stickyHeader.classList.add("sticky");
                // stickyHeader.style.marginTop = "0px";

                requestAnimationFrame(() => {
                    stickyHeader.classList.add("sticky");
                    stickyHeader.style.marginTop = "0px";
                });
            }
        } else {


            // Reset to Natural Position
            if (
                stickyHeader.classList.contains("sticky") && lastScrollY - currentScrollY > showThreshold
            ) {
                // console.log("[RESET] Page at top, returning to natural position.");
                stickyHeader.classList.remove("sticky", "hidden");

                // Reset to original margin instead of hardcoded 1.5rem
                stickyHeader.style.marginTop = initialMarginTop;
                // stickyHeader.style.marginTop = "1.5rem";

                document.body.classList.remove("sticky-header-active");
                applyPaddingCompensation(); // Reset padding
            }
        }

        lastScrollY = currentScrollY;
    }

    // Handle Page Load with Mid-Scroll
    function handlePageLoad() {
        updateHeaderHeight();

        // Store the original margin (computed style)
        initialMarginTop = window.getComputedStyle(stickyHeader).marginTop;

        if (window.scrollY > headerDefaultMargin) {
            // console.log("[LOAD] Page loaded mid-scroll → Applying sticky header.");
            document.body.classList.add("sticky-header-active");
            applyPaddingCompensation();
            stickyHeader.classList.add("sticky");
            stickyHeader.style.marginTop = "0px";
        }

    }

    handlePageLoad();

    // Event Listeners for handing flow of scrolling up and down the page
    window.addEventListener("scroll", handleScroll);

    // Debounced resize listener
    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateHeaderHeight();
            applyPaddingCompensation();
        }, 150);
    });

    // 2. Progress bar animation
    const progressBar = document.querySelector(".progress-meter");

    // === Scroll Progress Function ===
    function updateProgressBar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
    }

    // === Restore Scroll Position ===
    const savedScroll = sessionStorage.getItem("scrollPosition");
    if (savedScroll) {
        // Ensure progress bar doesn't show full immediately after restoring scroll
        window.scrollTo({ top: Number(savedScroll), behavior: "instant" });

        // Delay progress bar update until after scroll is settled
        setTimeout(() => {
            progressBar.style.opacity = "1";
            updateProgressBar();
        }, 250); // Slight delay to let the scroll settle
    }

    // === Delay initial update to avoid flicker ===
    setTimeout(() => {
        progressBar.style.opacity = "1";
        updateProgressBar();

        // Scroll event fallback
        window.addEventListener("scroll", updateProgressBar, { passive: true });

        // Animation loop fallback (mobile + legacy)
        requestAnimationFrame(function animateProgress() {
            updateProgressBar();
            requestAnimationFrame(animateProgress);
        });
    }, 100); // Let scroll position settle

    // === Save scroll position on exit ===
    const saveScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        sessionStorage.setItem("scrollPosition", scrollTop);
    };

    window.addEventListener("beforeunload", saveScroll);
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'hidden') saveScroll();
    });
});

// Typing Animation with Cursor Effect and Smooth Transitions
const messages = {
    greeting: [
        "Hey there! Welcome to my little corner of the web. Hope you're having a fantastic day!"
    ],
    intro: [
        "I'm Kumar Kundan - someone who enjoys building things that make life easier and more efficient.",
        "I specialize in backend development, where logic meets creativity to build seamless digital experiences."
    ],
    quotes: [
        "Code is like humor. When you have to explain it, it's bad.",
        "The best performance improvement is the transition from the nonworking state to the working state.",
        "When in doubt, use brute force."
    ],
    puzzles: [
        { question: "I speak without a mouth and hear without ears. I am always present but never seen. What am I?", answer: "An Echo!" },
        { question: "The more of me you take, the more you leave behind. What am I?", answer: "Footsteps!" },
        { question: "I have keys but open no locks. I have space but no room. You can enter, but you can't go outside. What am I?", answer: "A Keyboard!" },
        { question: "I have a binary heart but infinite memory. What am I?", answer: "A Computer!" },
        { question: "The more you compress me, the bigger I get. What am I?", answer: "A Zip File!" },
        { question: "What runs but never walks, has a stack but no shelves?", answer: "A Program!" },
        { question: "I take input, process it, and give output, but I'm not a human. What am I?", answer: "A CPU!" },
        { question: "I speak in zeros and ones but power the world. What am I?", answer: "Binary Code!" },
        { question: "I can store everything but have no physical form. What am I?", answer: "The Cloud!" },
        { question: "I speak without a mouth and hear without ears. I am born in code but don't truly exist. What am I?", answer: "An AI chatbot!" },
        { question: "I start with 'C', end with 'S', and contain logic at my core. What am I?", answer: " Computer Science!" },
        { question: "The more of me you have, the slower your system runs. What am I?", answer: "Bugs!" },
        { question: "I have keys but open no locks. I have space but no room. You can enter, but you can't leave. What am I?", answer: "A Keyboard!" },
        { question: "The more you compress me, the more I expand when used. What am I?", answer: "A Compressed File!" },
        { question: "I store everything but lose it all when power is gone. What am I?", answer: "RAM (Random Access Memory)!" },
        { question: "I help websites remember you but can be deleted anytime. What am I?", answer: "Cookies!" },
        { question: "Our love is like recursion—endless and self-sustaining, unless we forget the base case. What are we?", answer: "A Perfect Couple!" },
        { question: "You and I are like two linked lists—separate at first but merged forever at a special point. What am I?", answer: "A Love Story!" },
        { question: "We may have different parameters, but together we always return true. What are we?", answer: "A Compatible Pair!" },
        { question: "I'm a bit like a deadlock—stuck in love with you and never wanting to break free. What am I?", answer: " A Hopeless Romantic!" },
        { question: "You and I are like a binary tree—every decision brings us closer to a common root. What am I?", answer: "True Love!" },
        { question: "Love is like a stack—Last In, First Out, but the right person stays on top forever. What am I?", answer: "A Loyal Partner!" },
        { question: "We are like two parallel processors—working together in harmony, never blocking each other. What are we?", answer: "A Power Couple!" },
        { question: "I searched the entire database, but there's only one record that matters—you! What am I?", answer: " A Devoted Lover!" },
        { question: "In the algorithm of life, you are my best optimization—reducing complexity, increasing happiness. What am I?", answer: "Your Soulmate!" },
        { question: "Without you, my heart throws a segmentation fault—no pointer to happiness found. What am I?", answer: "A Love-Struck Coder!" },
    ]
};

// Shuffle function to randomize order
function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

let shuffledQuotes = [];
let shuffledPuzzles = [];

function initializeShuffledLists() {
    if (shuffledQuotes.length === 0) {
        shuffledQuotes = shuffleArray([...messages.quotes]);
        // console.log("Shuffled Quotes:", shuffledQuotes);
    }
    if (shuffledPuzzles.length === 0 && messages.puzzles.length > 0) {
        shuffledPuzzles = shuffleArray([...messages.puzzles]);
        // console.log("Shuffled Puzzles:", shuffledPuzzles);
    }
}

initializeShuffledLists(); // Call once at the beginning

const typingSpeed = 100;
const deletingSpeed = 50;
const pauseBeforeNext = 1500;
const answerDelay = 3000;
const container = document.getElementById("typingText");

let phase = "greeting";
let messageIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isShowingAnswer = false;
let currentPuzzle = null;

function typeEffect() {
    let currentMessage = "";

    // Ensure phase is valid
    if (!messages[phase]) {
        console.error(`Phase '${phase}' is missing in messages!`);
        phase = "greeting"; // Default to a safe phase
    }

    // Handle puzzles correctly
    if (phase === "puzzles") {
        if (!shuffledPuzzles.length) {
            shuffledPuzzles = shuffleArray([...messages.puzzles]);
        }

        if (shuffledPuzzles.length > 0) {
            currentPuzzle = shuffledPuzzles[messageIndex % shuffledPuzzles.length];
            currentMessage = isShowingAnswer ? currentPuzzle.answer : currentPuzzle.question;
        } else {
            currentMessage = "No puzzles available";
        }
    } else {
        currentMessage = messages[phase][messageIndex] || "No message available";
    }

    if (!isDeleting) {
        charIndex++;
        if (charIndex > currentMessage.length) {
            setTimeout(() => {
                if (phase === "puzzles" && !isShowingAnswer) {
                    isShowingAnswer = true;
                    charIndex = 0;
                    typeEffect();
                } else {
                    isDeleting = true;
                    typeEffect();
                }
            }, phase === "puzzles" && !isShowingAnswer ? answerDelay : pauseBeforeNext);
            return;
        }
    } else {
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            isShowingAnswer = false;
            messageIndex++;

            // Transition logic
            if (phase === "greeting" && messageIndex >= messages[phase].length) {
                phase = "intro";
                messageIndex = 0;
            } else if (phase === "intro" && messageIndex >= messages[phase].length) {
                const hasQuotes = messages.quotes.length > 0;
                const hasPuzzles = messages.puzzles.length > 0;

                if (!hasQuotes && !hasPuzzles) {
                    console.error("No quotes or puzzles available! Resetting to greeting.");
                    phase = "greeting";
                } else if (!hasPuzzles) {
                    console.warn("No puzzles available, switching to quotes.");
                    phase = "quotes";
                } else if (!hasQuotes) {
                    console.warn("No quotes available, switching to puzzles.");
                    phase = "puzzles";
                } else {
                    phase = Math.random() < 0.5 ? "quotes" : "puzzles"; // Randomly select quotes or puzzles
                }

                messageIndex = 0;
                initializeShuffledLists();
            }

            // Handle Quotes
            if (phase === "quotes") {
                if (!shuffledQuotes.length) {
                    shuffledQuotes = shuffleArray([...messages.quotes]);
                }
                if (messageIndex >= shuffledQuotes.length) {
                    // All quotes displayed, transition to puzzles
                    phase = "puzzles";
                    messageIndex = 0;
                    initializeShuffledLists();
                } else {
                    currentMessage = shuffledQuotes[messageIndex] || "No quotes available";
                }
            }

            // Handle Puzzles
            else if (phase === "puzzles") {
                if (!shuffledPuzzles.length) {
                    shuffledPuzzles = shuffleArray([...messages.puzzles]);
                }
                if (messageIndex >= shuffledPuzzles.length) {
                    // All puzzles displayed, transition to quotes
                    phase = "quotes";
                    messageIndex = 0;
                    initializeShuffledLists();
                } else {
                    currentPuzzle = shuffledPuzzles[messageIndex];
                    currentMessage = currentPuzzle.question;
                }
            }
        }
    }

    // container.innerHTML = currentMessage.substring(0, charIndex) + "<span class='cursor'></span>";

    // Added letter-spacing: 0.2px here
    container.innerHTML = `<span style="letter-spacing: 0.5px;">${currentMessage.substring(0, charIndex)}</span><span class='cursor'></span>`;

    setTimeout(typeEffect, isDeleting ? deletingSpeed : typingSpeed);
}

typeEffect();

function applyTypingContainerOffset() {
    const container = document.getElementById("typingContainer");
    if (!container) return;

    const computedHeaderSpace = getComputedStyle(document.documentElement).getPropertyValue('--total-header-space').trim();

    // Convert rem to px if needed (safe default fallback to 7rem = 112px)
    let pxValue;
    if (computedHeaderSpace.endsWith("rem")) {
        const remValue = parseFloat(computedHeaderSpace);
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize); // Usually 16px
        pxValue = remValue * rootFontSize;
    } else if (computedHeaderSpace.endsWith("px")) {
        pxValue = parseFloat(computedHeaderSpace);
    } else {
        pxValue = 112; // Fallback for unknown units
    }

    // Add 2rem space below header, as you had in your original margin
    const extraSpace = 2 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    container.style.marginTop = `${pxValue + extraSpace}px`;
    // container.style.marginTop = `330px`;
}

// Initial call
applyTypingContainerOffset();

// Update on resize in case header space changes (responsive)
window.addEventListener("resize", applyTypingContainerOffset);

// Optionally: update when your scroll-based sticky logic updates --total-header-space
window.addEventListener("scroll", applyTypingContainerOffset);























