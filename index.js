function displayDate(){
    const options={weekday:'long',year:'numeric',month:'long',day:'numeric'};
    const today=new Date();
    const dateElement=document.getElementById('currentDate');
    if(dateElement){dateElement.textContent=today.toLocaleDateString('en-US',options)}}

function updateWelcomeMessage(){const username=localStorage.getItem('fittrack_username');const welcomeElement=document.getElementById('welcomeMessage');if(welcomeElement&&username){welcomeElement.textContent=`Welcome back, ${username} 👋`}}
function loadDashboardData(){const savedSteps=localStorage.getItem('fitTrackSteps')||'0';document.getElementById('todaySteps').textContent=parseInt(savedSteps).toLocaleString();const savedWater=localStorage.getItem('fitTrackWater')||'0';document.getElementById('waterIntake').textContent=savedWater;const streak=calculateStreak();document.getElementById('currentStreak').textContent=streak}
function calculateStreak(){const weeklyData=JSON.parse(localStorage.getItem('fitTrackWeekly')||'{}');let streak=0;let currentDate=new Date();while(!0){const dateString=currentDate.toDateString();const steps=weeklyData[dateString]||0;if(steps>=1000){streak++;currentDate.setDate(currentDate.getDate()-1)}else{break}
if(streak>365)break}
return streak}
displayDate();updateWelcomeMessage();loadDashboardData()      