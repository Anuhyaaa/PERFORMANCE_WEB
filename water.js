const WATER_GOAL = 8;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let waterCount = 0;

const waterCountElement = document.getElementById('waterCount');
const waterProgress = document.getElementById('waterProgress');
const waterPercentage = document.getElementById('waterPercentage');
const waterGlasses = document.getElementById('waterGlasses');
const addGlassBtn = document.getElementById('addGlassBtn');
const resetWaterBtn = document.getElementById('resetWaterBtn');
const statusMessage = document.getElementById('statusMessage');
const waterCard = document.querySelector('.container .card');

// Updates the status copy and keeps the success state visually distinct.
function setStatus(message, tone = 'default') {
	if (!statusMessage) {
		return;
	}

	statusMessage.textContent = message;
	statusMessage.classList.remove('is-success', 'is-error', 'is-updated');

	if (tone === 'success') {
		statusMessage.classList.add('is-success');
		return;
	}

	if (tone === 'error') {
		statusMessage.classList.add('is-error');
		return;
	}

	statusMessage.classList.add('is-updated');
}

// Adds a brief card pulse when the goal is reached or reset.
function updateGoalState() {
	if (!waterProgress || !waterCard) {
		return;
	}

	const goalReached = waterCount >= WATER_GOAL;
	waterProgress.classList.toggle('goal-reached', goalReached);
	waterCard.classList.toggle('goal-reached', goalReached);
}

// Gives the button a short pressed state for touch-friendly feedback.
function tapFeedback(button) {
	if (!button || prefersReducedMotion) {
		return;
	}

	button.classList.add('is-pressed');
	window.setTimeout(() => {
		button.classList.remove('is-pressed');
	}, 160);
}

function loadWaterData() {
	const savedWater = localStorage.getItem('fitTrackWater');
	const savedDate = localStorage.getItem('fitTrackWaterDate');
	const today = new Date().toDateString();

	if (savedDate !== today) {
		waterCount = 0;
		localStorage.setItem('fitTrackWaterDate', today);
		localStorage.setItem('fitTrackWater', '0');
		return;
	}

	waterCount = savedWater ? parseInt(savedWater, 10) || 0 : 0;
}

function saveWaterData() {
	localStorage.setItem('fitTrackWater', String(waterCount));
	localStorage.setItem('fitTrackWaterDate', new Date().toDateString());
}

function updateDisplay() {
	if (waterCountElement) {
		waterCountElement.textContent = String(waterCount);
	}

	const percentage = Math.min((waterCount / WATER_GOAL) * 100, 100);

	if (waterProgress) {
		waterProgress.style.width = percentage + '%';
	}

	if (waterPercentage) {
		waterPercentage.textContent = Math.round(percentage) + '%';
	}

	updateGoalState();
}

function renderGlasses() {
	if (!waterGlasses) {
		return;
	}

	waterGlasses.innerHTML = '';

	for (let i = 0; i < WATER_GOAL; i += 1) {
		const glass = document.createElement('div');
		glass.style.fontSize = '2.5rem';
		glass.style.transition = 'transform 0.3s ease';
		glass.textContent = i < waterCount ? '💧' : '🥛';

		if (i < waterCount) {
			glass.style.transform = 'scale(1.1)';
			if (!prefersReducedMotion) {
				glass.style.animation = 'popIn 260ms ease both';
				glass.style.animationDelay = `${i * 35}ms`;
			}
		}

		waterGlasses.appendChild(glass);
	}
}

function addGlass() {
	console.log('Water tracker: add glass clicked', waterCount);
	tapFeedback(addGlassBtn);

	if (waterCount < WATER_GOAL) {
		waterCount += 1;
		updateDisplay();
		renderGlasses();
		saveWaterData();

		if (waterCount === WATER_GOAL) {
			setStatus('🎉 Daily water goal achieved!', 'success');
			return;
		}

		setStatus('Water added', 'updated');
		return;
	}

	setStatus('✓ You\'ve reached your daily water goal!', 'success');
}

function resetWater() {
	if (!confirm('Are you sure you want to reset your water intake?')) {
		return;
	}

	console.log('Water tracker: reset clicked');
	tapFeedback(resetWaterBtn);
	waterCount = 0;
	updateDisplay();
	renderGlasses();
	saveWaterData();
	setStatus('✓ Water intake reset', 'updated');
}

function init() {
	console.log('Water tracker init starting');
	loadWaterData();
	updateDisplay();
	renderGlasses();
	setStatus('Water tracker ready', 'updated');

	if (addGlassBtn) {
		addGlassBtn.addEventListener('click', addGlass);
	}

	if (resetWaterBtn) {
		resetWaterBtn.addEventListener('click', resetWater);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
