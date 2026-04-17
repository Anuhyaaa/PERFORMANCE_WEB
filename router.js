(function(){'use strict';const sections=document.querySelectorAll('.page-section');const navLinks=document.querySelectorAll('.nav-link, [data-nav]');let currentSection='home';function navigateTo(sectionId){if(sectionId===currentSection)return;sections.forEach(section=>{section.classList.remove('active')});const targetSection=document.getElementById(sectionId);if(targetSection){targetSection.classList.add('active');currentSection=sectionId;updateActiveNavLink(sectionId);history.pushState({section:sectionId},'',`#${sectionId}`);window.scrollTo({top:0,behavior:'smooth'});initializeSection(sectionId)}}
function updateActiveNavLink(sectionId){navLinks.forEach(link=>{const linkSection=link.getAttribute('data-nav')||link.getAttribute('href').substring(1);if(linkSection===sectionId){link.classList.add('active')}else{link.classList.remove('active')}})}
function initializeSection(sectionId){switch(sectionId){case 'steps':if(window.updateStepDisplay){window.updateStepDisplay()}
break;case 'weekly':if(window.loadWeeklyData){window.loadWeeklyData()}
break;case 'water':if(window.loadWaterData){window.loadWaterData()}
break;case 'quotes':if(window.displayQuote){window.displayQuote()}
break;case 'profile':if(window.loadUserProfile){window.loadUserProfile()}
break;case 'progress':if(window.loadProgressData){window.loadProgressData()}
break;case 'distance':if(window.loadDistanceData){window.loadDistanceData()}
break;case 'home':if(window.updateDashboard){window.updateDashboard()}
break}}
function handleNavClick(e){const target=e.target.closest('[data-nav], .nav-link');if(!target)return;e.preventDefault();const sectionId=target.getAttribute('data-nav')||target.getAttribute('href').substring(1);navigateTo(sectionId)}
function handlePopState(e){const sectionId=e.state?.section||getHashSection()||'home';navigateTo(sectionId)}
function getHashSection(){const hash=window.location.hash.substring(1);return hash||'home'}
function initRouter(){document.addEventListener('click',handleNavClick);window.addEventListener('popstate',handlePopState);const initialSection=getHashSection();navigateTo(initialSection);if(window.location.hash){setTimeout(()=>window.scrollTo(0,0),1)}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initRouter)}else{initRouter()}
window.navigateTo=navigateTo})()