function getWeeklyData() {
	const weeklyData = JSON.parse(localStorage.getItem('fitTrackWeekly') || '{}');
	console.log('Weekly Summary: stored data', weeklyData);
	return weeklyData;
}

function getStepsForDate(date, weeklyData) {
	const dateString = date.toDateString();
	const steps = weeklyData[dateString] || 0;
	console.log('Weekly Summary: date mapping', { dateString, steps });
	return steps;
}

function updateWeeklySummary() {
	const weeklyData = getWeeklyData();
	const today = new Date();
	const currentDay = today.getDay();
	const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const shortDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const weeklyItems = document.querySelectorAll('.weekly-item');
	const startOfWeek = new Date(today);
	const daysSinceMonday = (currentDay + 6) % 7;
	startOfWeek.setDate(today.getDate() - daysSinceMonday);

	weeklyItems.forEach((item, index) => {
		const date = new Date(startOfWeek);
		date.setDate(startOfWeek.getDate() + index);

		const steps = getStepsForDate(date, weeklyData);
		const dayStepsElement = item.querySelector('.day-steps');
		const dayNameElement = item.querySelector('.day-name');
		const itemDay = item.getAttribute('data-day');
		const todayName = dayNames[currentDay];
		const shortDayName = shortDayNames[date.getDay()];

		if (dayNameElement) {
			dayNameElement.textContent = shortDayName;
		}

		if (dayStepsElement) {
			dayStepsElement.textContent = `${steps.toLocaleString()} steps`;
		}

		if (itemDay === todayName) {
			item.classList.add('current-day');
		} else {
			item.classList.remove('current-day');
		}
	});
}

function init() {
	console.log('Weekly Summary: init running');
	updateWeeklySummary();

	window.addEventListener('storage', (event) => {
		if (event.key === 'fitTrackWeekly' || event.key === 'fitTrackSteps' || event.key === 'fitTrackDate') {
			console.log('Weekly Summary: storage changed, refreshing');
			updateWeeklySummary();
		}
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}