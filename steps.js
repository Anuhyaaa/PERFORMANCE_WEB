const DAILY_GOAL = 10000;
const CALORIES_PER_STEP = 0.04;
const STEP_LENGTH_KM = 0.00075;
const STEP_UPPER_THRESHOLD = 11.6;
const STEP_LOWER_THRESHOLD = 10.2;
const STEP_COOLDOWN = 350;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let stepCount = 0;
let displayedStepCount = 0;
let distanceKm = 0;
let lastStepTime = 0;
let stepArmed = false;
let isTracking = false;
let motionListenerAttached = false;
let stepCountAnimationFrame = null;

const stepCountElement = document.getElementById('stepNumber');
const caloriesElement = document.getElementById('calories');
const distanceElement = document.getElementById('distance');
const resetBtn = document.getElementById('resetBtn');
const startTrackingBtn = document.getElementById('startTrackingBtn');
const statusMessage = document.getElementById('statusMessage');
const progressCircle = document.querySelector('.progress-ring-circle');
const stepCounterCard = document.querySelector('.step-counter-card');
const dateDisplay = document.getElementById('dateDisplay');

function setStatus(message) {
	if (statusMessage) {
		statusMessage.textContent = message;
	}
}

// Animates the counter so step changes feel smooth without blocking sensor updates.
function animateStepCount(targetValue) {
	if (!stepCountElement) {
		return;
	}

	if (stepCountAnimationFrame !== null) {
		cancelAnimationFrame(stepCountAnimationFrame);
		stepCountAnimationFrame = null;
	}

	const startValue = displayedStepCount;

	if (prefersReducedMotion || startValue === targetValue) {
		displayedStepCount = targetValue;
		stepCountElement.textContent = targetValue.toLocaleString();
		return;
	}

	const duration = 360;
	const startTime = performance.now();
	const delta = targetValue - startValue;

	const tick = (now) => {
		const progress = Math.min((now - startTime) / duration, 1);
		const eased = 1 - Math.pow(1 - progress, 3);
		const currentValue = Math.round(startValue + delta * eased);

		displayedStepCount = currentValue;
		stepCountElement.textContent = currentValue.toLocaleString();

		if (progress < 1) {
			stepCountAnimationFrame = requestAnimationFrame(tick);
			return;
		}

		displayedStepCount = targetValue;
		stepCountElement.textContent = targetValue.toLocaleString();
		stepCountAnimationFrame = null;
	};

	stepCountAnimationFrame = requestAnimationFrame(tick);
}

// Adds a small pulse when the card receives a new step update.
function pulseStepCard() {
	if (!stepCounterCard || prefersReducedMotion) {
		return;
	}

	stepCounterCard.classList.remove('step-pulse');
	void stepCounterCard.offsetWidth;
	stepCounterCard.classList.add('step-pulse');

	window.setTimeout(() => {
		stepCounterCard.classList.remove('step-pulse');
	}, 320);
}

function isIOSPermissionFlow() {
	return typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function';
}

function setTrackingButtonVisibility(visible) {
	if (!startTrackingBtn) {
		return;
	}

	startTrackingBtn.style.display = visible ? 'block' : 'none';
}

function displayDate() {
	if (!dateDisplay) {
		return;
	}

	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

function loadStepsFromStorage() {
	const savedSteps = localStorage.getItem('fitTrackSteps');
	const savedDistance = localStorage.getItem('fitTrackDistance');
	const savedDate = localStorage.getItem('fitTrackDate');
	const today = new Date().toDateString();

	if (savedDate !== today) {
		if (savedDate && savedSteps) {
			saveToWeeklyData(savedDate, parseInt(savedSteps, 10));
		}

		stepCount = 0;
		distanceKm = 0;
		localStorage.setItem('fitTrackDate', today);
		localStorage.setItem('fitTrackSteps', '0');
		localStorage.setItem('fitTrackDistance', '0');
		return;
	}

	if (savedSteps) {
		stepCount = parseInt(savedSteps, 10) || 0;
		const parsedDistance = savedDistance ? parseFloat(savedDistance) : Number.NaN;
		distanceKm = Number.isFinite(parsedDistance) ? parsedDistance : stepCount * STEP_LENGTH_KM;
	}

	saveToWeeklyData(today, stepCount);
}

function saveStepsToStorage() {
	const today = new Date().toDateString();
	localStorage.setItem('fitTrackSteps', String(stepCount));
	localStorage.setItem('fitTrackDistance', distanceKm.toFixed(2));
	localStorage.setItem('fitTrackDate', today);
	saveToWeeklyData(today, stepCount);
}

function saveToWeeklyData(dateString, steps) {
	const weeklyData = JSON.parse(localStorage.getItem('fitTrackWeekly') || '{}');
	weeklyData[dateString] = steps;

	const dates = Object.keys(weeklyData).sort((a, b) => new Date(b) - new Date(a));
	if (dates.length > 30) {
		dates.slice(30).forEach((date) => delete weeklyData[date]);
	}

	localStorage.setItem('fitTrackWeekly', JSON.stringify(weeklyData));
}

function updateDisplay(options = {}) {
	const animateCount = options.animateCount !== false;

	if (animateCount) {
		animateStepCount(stepCount);
	} else if (stepCountElement) {
		if (stepCountAnimationFrame !== null) {
			cancelAnimationFrame(stepCountAnimationFrame);
			stepCountAnimationFrame = null;
		}

		displayedStepCount = stepCount;
		stepCountElement.textContent = stepCount.toLocaleString();
	}

	const calories = Math.round(stepCount * CALORIES_PER_STEP);
	if (caloriesElement) {
		caloriesElement.textContent = calories.toLocaleString();
	}

	if (distanceElement) {
		distanceElement.textContent = distanceKm.toFixed(2);
	}

	if (progressCircle) {
		const radius = progressCircle.r.baseVal.value;
		const circumference = 2 * Math.PI * radius;
		const progress = Math.min(stepCount / DAILY_GOAL, 1);
		const offset = circumference - progress * circumference;

		progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
		progressCircle.style.strokeDashoffset = offset;
	}

	if (stepCounterCard) {
		if (stepCount >= DAILY_GOAL) {
			stepCounterCard.classList.add('goal-achieved');
		} else {
			stepCounterCard.classList.remove('goal-achieved');
		}
	}
}

function resetStepDetection() {
	lastStepTime = 0;
	stepArmed = false;
}

function registerStep(magnitude) {
	stepCount += 1;
	distanceKm = stepCount * STEP_LENGTH_KM;
	lastStepTime = Date.now();
	stepArmed = false;

	console.log('Step detected:', {
		stepCount,
		distanceKm: Number(distanceKm.toFixed(3)),
		magnitude: Number(magnitude.toFixed(2)),
	});

	updateDisplay({ animateCount: true });
	pulseStepCard();
	saveStepsToStorage();

	if (stepCount === DAILY_GOAL) {
		setStatus('🎉 Daily goal achieved!');
	}
}

function handleMotion(event) {
	const acceleration = event.accelerationIncludingGravity;

	if (!acceleration) {
		console.warn('No accelerationIncludingGravity data available');
		return;
	}

	const x = acceleration.x || 0;
	const y = acceleration.y || 0;
	const z = acceleration.z || 0;
	const magnitude = Math.sqrt(x * x + y * y + z * z);
	const currentTime = Date.now();
	const timeSinceLastStep = currentTime - lastStepTime;

	console.log('Motion values:', {
		x: Number(x.toFixed(2)),
		y: Number(y.toFixed(2)),
		z: Number(z.toFixed(2)),
		magnitude: Number(magnitude.toFixed(2)),
		stepArmed,
		timeSinceLastStep,
	});

	if (!stepArmed && magnitude >= STEP_UPPER_THRESHOLD) {
		stepArmed = true;
	}

	if (stepArmed && magnitude <= STEP_LOWER_THRESHOLD && timeSinceLastStep >= STEP_COOLDOWN) {
		registerStep(magnitude);
	}

	if (magnitude <= STEP_LOWER_THRESHOLD) {
		stepArmed = false;
	}
}

function startStepDetection() {
	if (isTracking) {
		return;
	}

	if (typeof DeviceMotionEvent === 'undefined') {
		setStatus('Device motion not supported');
		return;
	}

	if (!motionListenerAttached) {
		window.addEventListener('devicemotion', handleMotion, { passive: true });
		motionListenerAttached = true;
	}

	isTracking = true;
	localStorage.setItem('fitTrackIsTracking', 'true');
	resetStepDetection();
	setTrackingButtonVisibility(false);
	setStatus('Tracking active');
	console.log('Step tracking started');
}

async function requestMotionPermission() {
	if (!isIOSPermissionFlow()) {
		startStepDetection();
		return;
	}

	try {
		const permission = await DeviceMotionEvent.requestPermission();

		if (permission === 'granted') {
			startStepDetection();
			setStatus('Tracking active');
			localStorage.setItem('fitTrackIsTracking', 'true');
			return;
		}

		setStatus('Permission denied');
		localStorage.setItem('fitTrackIsTracking', 'false');
	} catch (error) {
		console.error('Permission request error:', error);
		setStatus('Permission denied');
		localStorage.setItem('fitTrackIsTracking', 'false');
	}
}

async function handleStartTracking() {
	if (isTracking) {
		return;
	}

	await requestMotionPermission();
}

function resetSteps() {
	if (!confirm('Are you sure you want to reset your step count?')) {
		return;
	}

	stepCount = 0;
	distanceKm = 0;
	resetStepDetection();
	updateDisplay({ animateCount: true });
	saveStepsToStorage();

	if (isTracking) {
		setStatus('Tracking active');
	} else if (isIOSPermissionFlow()) {
		setStatus('Tap Start Step Tracking to begin.');
	} else {
		setStatus('Tracking active');
	}
}

function init() {
	setStatus('Initializing...');
	displayDate();
	loadStepsFromStorage();
	updateDisplay({ animateCount: !prefersReducedMotion });

	if (resetBtn) {
		resetBtn.addEventListener('click', resetSteps);
	}

	if (startTrackingBtn) {
		startTrackingBtn.addEventListener('click', handleStartTracking);
	}

	if (typeof DeviceMotionEvent === 'undefined') {
		setTrackingButtonVisibility(false);
		setStatus('Device motion is not supported on this device.');
		return;
	}

	if (isIOSPermissionFlow()) {
		setTrackingButtonVisibility(true);
		setStatus('Tap to start tracking');
		return;
	}

	setTrackingButtonVisibility(false);
	startStepDetection();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}