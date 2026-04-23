const quotes = [
    {
      text: "The only bad workout is the one that didn't happen.",
      author: "Unknown",
    },
    {
      text: "Take care of your body. It's the only place you have to live.",
      author: "Jim Rohn",
    },
    {
      text: "Fitness is not about being better than someone else. It's about being better than you used to be.",
      author: "Khloe Kardashian",
    },
    {
      text: "The groundwork for all happiness is good health.",
      author: "Leigh Hunt",
    },
    {
      text: "Your body can stand almost anything. It's your mind that you have to convince.",
      author: "Unknown",
    },
    {
      text: "Success isn't always about greatness. It's about consistency.",
      author: "Dwayne Johnson",
    },
    { text: "The only way to finish is to start.", author: "Unknown" },
    { text: "Don't wish for a good body, work for it.", author: "Unknown" },
    { text: "Sweat is fat crying.", author: "Unknown" },
    {
      text: "You don't have to be extreme, just consistent.",
      author: "Unknown",
    },
    {
      text: "A one hour workout is 4% of your day. No excuses.",
      author: "Unknown",
    },
    {
      text: "Exercise is a celebration of what your body can do, not a punishment for what you ate.",
      author: "Unknown",
    },
    {
      text: "The pain you feel today will be the strength you feel tomorrow.",
      author: "Unknown",
    },
    {
      text: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.",
      author: "Christian D. Larson",
    },
    {
      text: "Fitness is not a destination, it is a way of life.",
      author: "Unknown",
    },
  ],
  prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches,
  quoteBox = document.getElementById("quoteBox"),
  quoteText = document.getElementById("quoteText"),
  quoteAuthor = document.getElementById("quoteAuthor"),
  methodLabel = document.getElementById("methodLabel"),
  jqueryQuoteBtn = document.getElementById("jqueryQuoteBtn"),
  vanillaQuoteBtn = document.querySelector("#vanillaQuoteBtn"),
  legacyQuoteBtn =
    document.querySelector(".get-quote-btn") ||
    document.getElementById("newQuoteBtn");


let swapFrameId = 0;
let jQueryLoaderPromise = null;

function loadJQuery() {
  if (window.jQuery) {
    return Promise.resolve(window.jQuery);
  }

  if (!jQueryLoaderPromise) {
    jQueryLoaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://code.jquery.com/jquery-3.7.1.min.js";
      script.integrity = "sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=";
      script.crossOrigin = "anonymous";
      script.onload = () => resolve(window.jQuery);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return jQueryLoaderPromise;
}

function preloadJQuery() {
  if (window.jQuery || jQueryLoaderPromise) {
    return;
  }

  const triggerLoad = () => {
    loadJQuery().catch(() => {});
  };

  if ("requestIdleCallback" in window) {
    requestIdleCallback(triggerLoad, { timeout: 5000 });
  } else {
    setTimeout(triggerLoad, 5000);
  }
}
function getDailyQuote() {
  const t = new Date().toDateString(),
    e = localStorage.getItem("fitTrackQuoteDate"),
    o = localStorage.getItem("fitTrackQuoteIndex");
  if (e !== t || !o) {
    const e = Math.floor(Math.random() * quotes.length);
    return (
      localStorage.setItem("fitTrackQuoteDate", t),
      localStorage.setItem("fitTrackQuoteIndex", e.toString()),
      quotes[e]
    );
  }
  return quotes[parseInt(o, 10)];
}
function getRandomQuote() {
  const t = Math.floor(Math.random() * quotes.length);
  return quotes[t];
}
function setCurrentMethod(t) {
  methodLabel && (methodLabel.textContent = `Current Method: ${t}`);
}
function displayQuote(t) {
  (quoteText && (quoteText.textContent = `"${t.text}"`),
    quoteAuthor && (quoteAuthor.textContent = `— ${t.author}`));
}
function resetQuoteTransitionStyles() {
  quoteText &&
    quoteAuthor &&
    ((quoteText.style.opacity = ""),
    (quoteAuthor.style.opacity = ""),
    (quoteText.style.transform = ""),
    (quoteAuthor.style.transform = ""),
    (quoteText.style.willChange = ""),
    (quoteAuthor.style.willChange = ""));
}
function animateQuoteSwapVanilla(t) {
  if (!quoteBox || !quoteText || !quoteAuthor) return;
  if (prefersReducedMotion) return void displayQuote(t);
  swapFrameId && cancelAnimationFrame(swapFrameId);
  let e = 1,
    o = "out";
  const n = (t) => {
    const e = t.toFixed(2),
      o = 10 * (1 - t);
    ((quoteText.style.opacity = e),
      (quoteAuthor.style.opacity = e),
      (quoteText.style.transform = `translateY(${o}px)`),
      (quoteAuthor.style.transform = `translateY(${o}px)`));
  };
  ((quoteText.style.willChange = "opacity, transform"),
    (quoteAuthor.style.willChange = "opacity, transform"));
  const a = () => {
    if ("out" === o)
      ((e = Math.max(0, e - 0.08)),
        n(e),
        0 === e && (displayQuote(t), (o = "in")));
    else if (((e = Math.min(1, e + 0.08)), n(e), 1 === e))
      return (resetQuoteTransitionStyles(), void (swapFrameId = 0));
    swapFrameId = requestAnimationFrame(a);
  };
  swapFrameId = requestAnimationFrame(a);
}
function animateQuoteSwapJQuery(t) {
  if (!quoteText || !quoteAuthor) return;
  if (
    (swapFrameId &&
      (cancelAnimationFrame(swapFrameId),
      (swapFrameId = 0),
      resetQuoteTransitionStyles()),
    !window.jQuery || prefersReducedMotion)
  )
    return void displayQuote(t);
  const e = window.jQuery(quoteText),
    o = window.jQuery(quoteAuthor);
  (e.stop(!0, !0).fadeOut(180, () => {
    e.text(`"${t.text}"`).fadeIn(180);
  }),
    o.stop(!0, !0).fadeOut(180, () => {
      o.text(`— ${t.author}`).fadeIn(180);
    }));
}
function init() {
  quoteText &&
    quoteAuthor &&
    (displayQuote(getDailyQuote()),
    setCurrentMethod("Vanilla JS"),
    vanillaQuoteBtn &&
      vanillaQuoteBtn.addEventListener("click", () => {
        (setCurrentMethod("Vanilla JS"),
          animateQuoteSwapVanilla(getRandomQuote()));
      }),
    jqueryQuoteBtn &&
      jqueryQuoteBtn.addEventListener("click", () => {
        setCurrentMethod("jQuery");
        loadJQuery()
          .then(() => {
            animateQuoteSwapJQuery(getRandomQuote());
          })
          .catch(() => {
            setCurrentMethod("Vanilla JS");
            animateQuoteSwapVanilla(getRandomQuote());
          });
      }),
    vanillaQuoteBtn ||
      jqueryQuoteBtn ||
      !legacyQuoteBtn ||
      legacyQuoteBtn.addEventListener("click", () => {
        (setCurrentMethod("Vanilla JS"),
          animateQuoteSwapVanilla(getRandomQuote()));
      }));
  preloadJQuery();
}
init();
