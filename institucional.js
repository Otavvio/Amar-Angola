const toggle=document.getElementById('navToggle');
const links=document.getElementById('navLinks');
toggle?.setAttribute('aria-expanded','false');
toggle?.addEventListener('click',()=>{const open=links.classList.toggle('active');toggle.setAttribute('aria-expanded',String(open));});
links?.addEventListener('click',e=>{if(e.target.closest('a')){links.classList.remove('active');toggle.setAttribute('aria-expanded','false');}});
