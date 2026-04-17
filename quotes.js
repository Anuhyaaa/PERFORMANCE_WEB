const quotes = [
	{ text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
	{ text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
	{ text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Khloe Kardashian" },
	{ text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
	{ text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
	{ text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
	{ text: "The only way to finish is to start.", author: "Unknown" },
	{ text: "Don't wish for a good body, work for it.", author: "Unknown" },
	{ text: "Sweat is fat crying.", author: "Unknown" },
	{ text: "You don't have to be extreme, just consistent.", author: "Unknown" },
	{ text: "A one hour workout is 4% of your day. No excuses.", author: "Unknown" },
	{ text: "Exercise is a celebration of what your body can do, not a punishment for what you ate.", author: "Unknown" },
	{ text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
	{ text: "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.", author: "Christian D. Larson" },
	{ text: "Fitness is not a destination, it is a way of life.", author: "Unknown" }
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const quoteBox = document.getElementById('quoteBox');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const newQuoteBtn = document.querySelector('.get-quote-btn') || document.getElementById('newQuoteBtn');
let swapFrameId = 0;

function getDailyQuote() {
	const today = new Date().toDateString();
	const savedQuoteDate = localStorage.getItem('fitTrackQuoteDate');
	const savedQuoteIndex = localStorage.getItem('fitTrackQuoteIndex');

	if (savedQuoteDate !== today || !savedQuoteIndex) {
		const randomIndex = Math.floor(Math.random() * quotes.length);
		localStorage.setItem('fitTrackQuoteDate', today);
		localStorage.setItem('fitTrackQuoteIndex', randomIndex.toString());
		return quotes[randomIndex];
	}

	return quotes[parseInt(savedQuoteIndex, 10)];
}

function getRandomQuote() {
	const randomIndex = Math.floor(Math.random() * quotes.length);
	return quotes[randomIndex];
}

function displayQuote(quote) {
	if (quoteText) {
		quoteText.textContent = `"${quote.text}"`;
	}

	if (quoteAuthor) {
		quoteAuthor.textContent = `— ${quote.author}`;
	}
}

function animateQuoteSwap(quote) {
	if (!quoteBox || !quoteText || !quoteAuthor) {
		return;
	}

	if (prefersReducedMotion) {
		displayQuote(quote);
		return;
	}

	if (swapFrameId) {
		cancelAnimationFrame(swapFrameId);
	}

	const step = 0.08;
	let opacity = 1;
	let phase = 'out';

	const applyOpacity = (value) => {
		const opacityValue = value.toFixed(2);
		const offset = (1 - value) * 10;

		quoteText.style.opacity = opacityValue;
		quoteAuthor.style.opacity = opacityValue;
		quoteText.style.transform = `translateY(${offset}px)`;
		quoteAuthor.style.transform = `translateY(${offset}px)`;
	};

	quoteText.style.willChange = 'opacity, transform';
	quoteAuthor.style.willChange = 'opacity, transform';

	const tick = () => {
		if (phase === 'out') {
			opacity = Math.max(0, opacity - step);
			applyOpacity(opacity);

			if (opacity === 0) {
				displayQuote(quote);
				phase = 'in';
			}
		} else {
			opacity = Math.min(1, opacity + step);
			applyOpacity(opacity);

			if (opacity === 1) {
				quoteText.style.opacity = '';
				quoteAuthor.style.opacity = '';
				quoteText.style.transform = '';
				quoteAuthor.style.transform = '';
				quoteText.style.willChange = '';
				quoteAuthor.style.willChange = '';
				swapFrameId = 0;
				return;
			}
		}

		swapFrameId = requestAnimationFrame(tick);
	};

	swapFrameId = requestAnimationFrame(tick);
}

function init() {
	displayQuote(getDailyQuote());

	if (newQuoteBtn) {
		newQuoteBtn.addEventListener('click', () => {
			animateQuoteSwap(getRandomQuote());
		});
	}
}

init();