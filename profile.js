const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const weightInput=document.getElementById('weightInput');const weightDisplay=document.getElementById('weightDisplay');const saveWeightBtn=document.getElementById('saveWeightBtn');const statusMessage=document.getElementById('statusMessage');

// Keeps the profile feedback message animated without changing the existing save behavior.
function updateStatus(message,tone){if(!statusMessage){return}
statusMessage.classList.remove('is-success','is-error','is-updated');statusMessage.textContent=message;statusMessage.style.display='block';if(tone==='success'){statusMessage.classList.add('is-success');statusMessage.style.backgroundColor='#e8f5e9';statusMessage.style.borderLeftColor='#4caf50'}else if(tone==='error'){statusMessage.classList.add('is-error');statusMessage.style.backgroundColor='#ffebee';statusMessage.style.borderLeftColor='#f44336'}else{statusMessage.classList.add('is-updated')}
if(prefersReducedMotion){return}
void statusMessage.offsetWidth}
function loadUserProfile(){const username=localStorage.getItem('fittrack_username');if(username){const profileName=document.getElementById('profileName');if(profileName){profileName.textContent=username}
const profileAvatar=document.getElementById('profileAvatar');if(profileAvatar){profileAvatar.src=`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;profileAvatar.alt=`${username}'s Avatar`}}}
function loadWeight(){const savedWeight=localStorage.getItem('fitTrackWeight');if(savedWeight){weightInput.value=savedWeight;weightDisplay.textContent=`Current Weight: ${savedWeight} kg`;weightDisplay.style.display='block'}}
function saveWeight(){const weight=weightInput.value.trim();if(!weight||isNaN(weight)||weight<=0){updateStatus('⚠️ Please enter a valid weight','error');return}
localStorage.setItem('fitTrackWeight',weight);weightDisplay.textContent=`Current Weight: ${weight} kg`;weightDisplay.style.display='block';updateStatus('✓ Profile updated successfully!','success');setTimeout(()=>{statusMessage.style.display='none'},3000)}
loadUserProfile();loadWeight();saveWeightBtn.addEventListener('click',saveWeight)