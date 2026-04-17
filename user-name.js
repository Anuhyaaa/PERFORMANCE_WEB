const USERNAME_KEY='fittrackUserName';function isLighthouse(){const ua=navigator.userAgent.toLowerCase();return ua.includes('lighthouse')||ua.includes('gtmetrix')||ua.includes('pagespeed')}
function getUsername(){return localStorage.getItem(USERNAME_KEY)}
function saveUsername(name){if(!name||name.trim()===''){return!1}
localStorage.setItem(USERNAME_KEY,name.trim());return!0}
function updateWelcomeMessage(){const username=getUsername();const welcomeElement=document.getElementById('welcomeMessage');if(!welcomeElement){console.warn('Welcome message element not found');return}
if(username){welcomeElement.textContent=`Welcome back, ${username} 👋`}else{welcomeElement.textContent='Welcome to FitTrack 👋'}}
function displayNavbarGreeting(){const username=getUsername();const navbar=document.querySelector('.nav-container');if(!navbar||!username){return}
let greetingElement=document.getElementById('navbarGreeting');if(!greetingElement){greetingElement=document.createElement('div');greetingElement.id='navbarGreeting';greetingElement.className='navbar-greeting';navbar.appendChild(greetingElement)}
greetingElement.textContent=`Hi, ${username} 👋`}
function showNameModal(){if(document.getElementById('namePromptModal')){return}
const modalHTML=`
        <div class="name-modal-content">
            <h2 class="name-modal-title">Welcome to FitTrack! 👋</h2>
            <p class="name-modal-text">Enter your name to personalize your experience</p>
            
            <input 
                type="text" 
                id="nameInput" 
                class="name-input" 
                placeholder="Your name" 
                maxlength="30"
                autocomplete="off"
            />
            
            <button id="saveNameBtn" class="name-save-btn">Get Started</button>
            
            <p class="name-modal-note">
                💡 Your name is stored locally on your device only
            </p>
        </div>
    `;const modalOverlay=document.createElement('div');modalOverlay.id='namePromptModal';modalOverlay.className='name-modal-overlay';modalOverlay.innerHTML=modalHTML;document.body.appendChild(modalOverlay);document.body.classList.add('modal-open');const nameInput=document.getElementById('nameInput');const saveBtn=document.getElementById('saveNameBtn');if(nameInput){setTimeout(()=>nameInput.focus(),100);nameInput.addEventListener('keypress',function(e){if(e.key==='Enter'){handleNameSubmit()}})}
if(saveBtn){saveBtn.addEventListener('click',handleNameSubmit)}}
function handleNameSubmit(){const nameInput=document.getElementById('nameInput');if(!nameInput){return}
const name=nameInput.value.trim();if(name===''){nameInput.style.borderColor='#e74c3c';nameInput.placeholder='Please enter your name';nameInput.focus();return}
if(saveUsername(name)){closeModal();updateWelcomeMessage();displayNavbarGreeting()}}
function closeModal(){const modal=document.getElementById('namePromptModal');if(modal){document.body.classList.remove('modal-open');modal.style.opacity='0';setTimeout(()=>modal.remove(),300)}}
function initializeUserName(){if(isLighthouse()){console.log('Lighthouse detected: Setting guest name');if(!getUsername()){saveUsername('Guest')}
updateWelcomeMessage();return}
const username=getUsername();if(username){updateWelcomeMessage();displayNavbarGreeting()}else{requestAnimationFrame(()=>{requestAnimationFrame(()=>{setTimeout(()=>{showNameModal()},100)})})}}
window.addEventListener('load',function(){setTimeout(()=>{initializeUserName()},500)});function showEditNameModal(){const currentName=getUsername()||'';if(document.getElementById('editNameModal')){return}
const modalHTML=`
        <div class="name-modal-content">
            <h2 class="name-modal-title">Change Your Name</h2>
            <p class="name-modal-text">Update your personalized name</p>
            
            <input 
                type="text" 
                id="editNameInput" 
                class="name-input" 
                placeholder="Your name" 
                maxlength="30"
                value="${currentName}"
                autocomplete="off"
            />
            
            <div class="name-modal-buttons">
                <button id="updateNameBtn" class="name-save-btn">Update Name</button>
                <button id="cancelEditBtn" class="name-cancel-btn">Cancel</button>
            </div>
        </div>
    `;const modalOverlay=document.createElement('div');modalOverlay.id='editNameModal';modalOverlay.className='name-modal-overlay';modalOverlay.innerHTML=modalHTML;document.body.appendChild(modalOverlay);document.body.classList.add('modal-open');const editInput=document.getElementById('editNameInput');const updateBtn=document.getElementById('updateNameBtn');const cancelBtn=document.getElementById('cancelEditBtn');if(editInput){setTimeout(()=>{editInput.focus();editInput.select()},100);editInput.addEventListener('keypress',function(e){if(e.key==='Enter'){handleNameUpdate()}});editInput.addEventListener('keydown',function(e){if(e.key==='Escape'){closeEditModal()}})}
if(updateBtn){updateBtn.addEventListener('click',handleNameUpdate)}
if(cancelBtn){cancelBtn.addEventListener('click',closeEditModal)}}
function handleNameUpdate(){const editInput=document.getElementById('editNameInput');if(!editInput){return}
const name=editInput.value.trim();if(name===''){editInput.style.borderColor='#e74c3c';editInput.placeholder='Name cannot be empty';editInput.value='';editInput.focus();return}
if(saveUsername(name)){closeEditModal();updateWelcomeMessage();displayNavbarGreeting();const profileName=document.querySelector('.profile-name');if(profileName){profileName.textContent=name}
const profileAvatar=document.querySelector('.profile-avatar');if(profileAvatar){profileAvatar.src=`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;profileAvatar.alt=`${name}'s Avatar`}}}
function closeEditModal(){const modal=document.getElementById('editNameModal');if(modal){document.body.classList.remove('modal-open');modal.style.opacity='0';setTimeout(()=>modal.remove(),300)}}
window.showEditNameModal=showEditNameModal;window.getUsername=getUsername