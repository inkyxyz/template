let isCopying = false;
let isRedirecting = false;

/* ===== ПАРАЛЛАКС (оптимизирован для мобильных) ===== */
const starsParallax = document.getElementById('starsParallax');
const glassCard = document.getElementById('glassCard');
const galaxy = document.getElementById('galaxy');
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768 || ('ontouchstart' in window);
let targetMX=0,targetMY=0,currentMX=0,currentMY=0;
let parallaxActive = !isMobile;

if(!isMobile){
  document.addEventListener('mousemove',(e)=>{
    targetMX=(e.clientX/window.innerWidth-0.5)*2;
    targetMY=(e.clientY/window.innerHeight-0.5)*2;
  });
  document.addEventListener('mouseleave',()=>{targetMX=0;targetMY=0;});
} else {
  // На мобильных — лёгкий параллакс по ориентации (реже обновляем)
  let orientThrottle = 0;
  window.addEventListener('deviceorientation',(e)=>{
    if(e.gamma===null||e.beta===null) return;
    const now = Date.now();
    if(now - orientThrottle < 50) return;
    orientThrottle = now;
    targetMX=Math.max(-1,Math.min(1,e.gamma/40));
    targetMY=Math.max(-1,Math.min(1,(e.beta-45)/40));
  }, {passive:true});
}

function animateParallax(){
  currentMX+=(targetMX-currentMX)*0.08;
  currentMY+=(targetMY-currentMY)*0.08;
  const tx = currentMX*(isMobile?8:15);
  const ty = currentMY*(isMobile?8:15);
  starsParallax.style.transform=`translate(${tx}px, ${ty}px)`;
  if(!isMobile){
    glassCard.style.transform=`perspective(1200px) rotateY(${currentMX*4}deg) rotateX(${-currentMY*4}deg)`;
    if(galaxy) galaxy.style.marginLeft = (currentMX*10)+'px';
  }
  requestAnimationFrame(animateParallax);
}
animateParallax();

/* ===== ЦВЕТОВЫЕ УТИЛИТЫ ===== */
function hexToRgb(hex){
  const h=hex.replace('#','');
  const full=h.length===3? h.split('').map(c=>c+c).join(''):h;
  return {r:parseInt(full.substring(0,2),16), g:parseInt(full.substring(2,4),16), b:parseInt(full.substring(4,6),16)};
}
function rgbToHex(r,g,b){
  return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
}
function mix(hexA,hexB,weight){ // weight 0..1 of hexA
  const a=hexToRgb(hexA), b=hexToRgb(hexB);
  return rgbToHex(a.r*weight+b.r*(1-weight), a.g*weight+b.g*(1-weight), a.b*weight+b.b*(1-weight));
}
function rgba(hex,alpha){ const c=hexToRgb(hex); return `rgba(${c.r},${c.g},${c.b},${alpha})`; }
function relLuminance(hex){
  const c=hexToRgb(hex);
  const chan=v=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);};
  return 0.2126*chan(c.r)+0.7152*chan(c.g)+0.0722*chan(c.b);
}

/* ===== ГЕНЕРАЦИЯ ПОЛНОЙ КАСТОМНОЙ ТЕМЫ (все переменные разом) ===== */
function buildCustomTheme(hex){
  const lum = relLuminance(hex);
  const isLight = lum > 0.62;
  let vars = {};
  if(isLight){
    vars['--c-bg-deep']  = mix(hex, '#ffffff', 0.10);
    vars['--c-bg-mid']   = mix(hex, '#ffffff', 0.06);
    vars['--c-bg-glow']  = '#ffffff';
    vars['--c-text']         = '#15131f';
    vars['--c-text-dim']     = 'rgba(21,19,31,0.62)';
    vars['--c-text-faint']   = 'rgba(21,19,31,0.38)';
    vars['--c-glass-bg']     = 'rgba(255,255,255,0.55)';
    vars['--c-glass-border'] = 'rgba(21,19,31,0.10)';
    vars['--c-surface']      = 'rgba(21,19,31,0.045)';
    vars['--c-surface-hover']= 'rgba(21,19,31,0.085)';
    vars['--c-accent-strong']= mix(hex, '#000000', 0.62);
    vars['--c-accent']       = mix(hex, '#000000', 0.80);
    vars['--c-accent-soft']  = rgba(vars['--c-accent-strong'], 0.16);
    vars['--c-accent-line']  = rgba(vars['--c-accent-strong'], 0.24);
    vars['--nebula-1'] = mix(hex,'#ffffff',0.55);
    vars['--nebula-2'] = mix(hex,'#ffffff',0.35);
    vars['--nebula-3'] = mix(hex,'#ffffff',0.65);
    vars['--aurora-1'] = rgba(hex,0.10);
    vars['--aurora-2'] = rgba(mix(hex,'#38bdf8',0.5),0.08);
    vars['--aurora-3'] = rgba(mix(hex,'#a78bfa',0.5),0.09);
    vars['--comet-color'] = vars['--c-accent-strong'];
  } else {
    vars['--c-bg-deep']  = mix(hex, '#000000', 0.10);
    vars['--c-bg-mid']   = mix(hex, '#000000', 0.16);
    vars['--c-bg-glow']  = mix(hex, '#000000', 0.28);
    vars['--c-text']         = '#ffffff';
    vars['--c-text-dim']     = 'rgba(226,222,240,0.6)';
    vars['--c-text-faint']   = 'rgba(226,222,240,0.35)';
    vars['--c-glass-bg']     = rgba(hex,0.05);
    vars['--c-glass-border'] = rgba(mix(hex,'#ffffff',0.6),0.18);
    vars['--c-surface']      = 'rgba(255,255,255,0.04)';
    vars['--c-surface-hover']= 'rgba(255,255,255,0.08)';
    vars['--c-accent']       = mix(hex,'#ffffff',0.72);
    vars['--c-accent-strong']= hex;
    vars['--c-accent-soft']  = rgba(vars['--c-accent'],0.25);
    vars['--c-accent-line']  = rgba(vars['--c-accent'],0.28);
    vars['--nebula-1'] = mix(hex,'#000000',0.65);
    vars['--nebula-2'] = mix(hex,'#000000',0.5);
    vars['--nebula-3'] = mix(hex,'#000000',0.35);
    vars['--aurora-1'] = rgba(hex,0.15);
    vars['--aurora-2'] = rgba(mix(hex,'#38bdf8',0.5),0.10);
    vars['--aurora-3'] = rgba(mix(hex,'#a78bfa',0.5),0.12);
    vars['--comet-color'] = vars['--c-accent'];
  }
  return vars;
}

function clearCustomInlineVars(){
  const keys=['--c-bg-deep','--c-bg-mid','--c-bg-glow','--c-text','--c-text-dim','--c-text-faint',
  '--c-glass-bg','--c-glass-border','--c-surface','--c-surface-hover','--c-accent','--c-accent-strong',
  '--c-accent-soft','--c-accent-line','--nebula-1','--nebula-2','--nebula-3','--aurora-1','--aurora-2','--aurora-3','--comet-color'];
  keys.forEach(k=>document.documentElement.style.removeProperty(k));
}

function setActiveTheme(theme){
  if(theme!=='custom') clearCustomInlineVars();
  document.body.setAttribute('data-theme',theme);
  document.querySelectorAll('.theme-dot').forEach(d=>d.classList.toggle('active', d.getAttribute('data-set')===theme));
  try{ localStorage.setItem('theme',theme); }catch(e){}
}

function applyCustomColor(hex){
  const vars = buildCustomTheme(hex);
  Object.keys(vars).forEach(k=>document.documentElement.style.setProperty(k, vars[k]));
  document.getElementById('customDot').style.display='inline-block';
  document.getElementById('customSep').style.display='block';
  setActiveTheme('custom');
  try{ localStorage.setItem('customColor',hex); }catch(e){}
}

document.querySelectorAll('.theme-dot[data-set]').forEach(dot=>{
  dot.addEventListener('click',()=>{
    const theme=dot.getAttribute('data-set');
    if(theme==='custom'){
      const saved=localStorage.getItem('customColor')||document.getElementById('customColorInput').value;
      applyCustomColor(saved);
      return;
    }
    setActiveTheme(theme);
    dot.animate([{transform:'scale(1.08)'},{transform:'scale(1.35)'},{transform:'scale(1.08)'}],{duration:400,easing:'cubic-bezier(0.34,1.56,0.64,1)'});
  });
});
document.getElementById('customColorInput').addEventListener('input',(e)=>applyCustomColor(e.target.value));

try{
  const savedColor=localStorage.getItem('customColor');
  const saved=localStorage.getItem('theme');
  if(savedColor){
    document.getElementById('customColorInput').value=savedColor;
    document.getElementById('customDot').style.display='inline-block';
    document.getElementById('customSep').style.display='block';
    if(saved==='custom') applyCustomColor(savedColor);
  }
  if(saved && saved!=='custom') setActiveTheme(saved);
}catch(e){}

/* ===== RIPPLE ===== */
document.querySelectorAll('.btn,.social').forEach(el=>{
  el.addEventListener('click',function(e){
    const rect=this.getBoundingClientRect();
    const ripple=document.createElement('span');
    ripple.className='btn-ripple';
    const size=Math.max(rect.width,rect.height);
    ripple.style.width=ripple.style.height=size+'px';
    ripple.style.left=(e.clientX-rect.left)+'px';
    ripple.style.top=(e.clientY-rect.top)+'px';
    this.appendChild(ripple);
    setTimeout(()=>ripple.remove(),700);
  });
});

function avatarClick(el){
  el.animate([
    {transform:'scale(1) rotate(0deg)'},
    {transform:'scale(1.15) rotate(-8deg)'},
    {transform:'scale(0.95) rotate(4deg)'},
    {transform:'scale(1) rotate(0deg)'}
  ],{duration:500,easing:'cubic-bezier(0.34,1.56,0.64,1)'});
}

(function animateViews(){
  const el=document.getElementById('viewsCount');
  const target=128; let current=0; const step=Math.max(1, target/40);
  const interval=setInterval(()=>{ current+=step; if(current>=target){current=target;clearInterval(interval);} el.textContent=Math.floor(current); },25);
})();

function copyTel(){
  if(isCopying) return;
  isCopying=true;
  const tel="+79991234567";
  if(navigator.clipboard && window.isSecureContext){ navigator.clipboard.writeText(tel).catch(fallbackCopy); } else { fallbackCopy(); }
  function fallbackCopy(){
    const ta=document.createElement('textarea');
    ta.value=tel; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try{document.execCommand('copy');}catch(e){}
    document.body.removeChild(ta);
  }
  document.body.classList.add('copying');
  const btn=document.getElementById('copyBtn');
  const originalHTML=btn.innerHTML;
  btn.innerHTML='<i class="fas fa-check"></i><span>Готово</span>';
  if(navigator.vibrate) navigator.vibrate(20);
  setTimeout(()=>{ document.body.classList.remove('copying'); btn.innerHTML=originalHTML; isCopying=false; },1800);
}

/* ===== ПОРТАЛ ОТКРЫТИЯ (без вылетающих иконок) ===== */
function goWarp(e, platform, url){
  e.preventDefault(); e.stopPropagation();
  if(isRedirecting) return;
  isRedirecting=true;

  const overlay=document.getElementById('warpOverlay');
  const flash=document.getElementById('warpFlash');
  const heroGlyph=document.getElementById('heroIconGlyph');
  const text=document.getElementById('warpText');
  const sub=document.getElementById('warpSub');

  let label='',iconClass='',color='',subText='';
  if(platform==='call'){label='Звоним';iconClass='fas fa-phone-alt';color='#a5b4fc';subText='Набираем номер';}
  else if(platform==='whatsapp'){label='WhatsApp';iconClass='fab fa-whatsapp';color='#25D366';subText='Открываем чат';}
  else if(platform==='telegram'){label='Telegram';iconClass='fab fa-telegram';color='#29b6f6';subText='Открываем чат';}
  else if(platform==='viber'){label='Viber';iconClass='fab fa-viber';color='#7360f2';subText='Открываем чат';}

  overlay.style.setProperty('--warp-color',color);
  heroGlyph.className='hero-icon-glyph '+iconClass;
  text.textContent = platform==='call' ? 'Звоним...' : 'Переход в '+label;
  sub.textContent = subText;

  flash.classList.remove('flash-active'); void flash.offsetWidth;
  flash.classList.add('flash-active');

  overlay.classList.add('active');
  if(navigator.vibrate) navigator.vibrate(30);

  setTimeout(()=>{ window.location.href=url; },1500);
  setTimeout(()=>{ overlay.classList.remove('active'); isRedirecting=false; },2400);
}

window.addEventListener('pageshow',()=>{
  document.getElementById('warpOverlay').classList.remove('active');
  isRedirecting=false;
});
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden){
    setTimeout(()=>{ document.getElementById('warpOverlay').classList.remove('active'); isRedirecting=false; },300);
  }
});

/* ===== КОСМИЧЕСКИЕ ЭФФЕКТЫ ===== */
function createTwinkles(){
  const space=document.querySelector('.stars-parallax');
  // Меньше элементов на мобильных для плавности
  const count = isMobile ? (window.innerWidth<400?10:16) : (window.innerWidth<500?22:36);
  for(let i=0;i<count;i++){
    const star=document.createElement('div');
    star.className='twinkle';
    const size=1+Math.random()*2.5;
    star.style.width=size+'px'; star.style.height=size+'px';
    star.style.left=Math.random()*100+'%'; star.style.top=Math.random()*100+'%';
    star.style.animationDelay=(Math.random()*3)+'s';
    star.style.animationDuration=(2.5+Math.random()*3)+'s';
    space.appendChild(star);
  }
}
function createParticles(){
  const space=document.querySelector('.stars-parallax');
  const palette=['#c7d2fe','#a5b4fc','#ddd6fe','#e9d5ff','#ffffff'];
  // Значительно меньше частиц на мобильных
  const count = isMobile ? (window.innerWidth<400?12:18) : (window.innerWidth<500?28:48);
  for(let i=0;i<count;i++){
    const p=document.createElement('div');
    p.className='particle';
    const size=1+Math.random()*(isMobile?2.2:3.2);
    const color=palette[Math.floor(Math.random()*palette.length)];
    p.style.width=size+'px'; p.style.height=size+'px';
    p.style.background=`radial-gradient(circle, ${color} 0%, transparent 75%)`;
    if(!isMobile) p.style.boxShadow=`0 0 ${size*2.5}px ${color}`;
    p.style.left=(20+Math.random()*60)+'%';
    p.style.top=(15+Math.random()*70)+'%';
    const px=(Math.random()-0.5)*(isMobile?160:260), py=(Math.random()-0.5)*(isMobile?160:260);
    p.style.setProperty('--px',px+'px');
    p.style.setProperty('--py',py+'px');
    p.style.setProperty('--p-op', (0.25+Math.random()*0.55).toFixed(2));
    const dur=16+Math.random()*20;
    p.style.animationDuration=dur+'s';
    p.style.animationDelay=(-Math.random()*dur)+'s';
    space.appendChild(p);
  }
}
function createShootingStar(){
  if(isMobile && Math.random()>0.4) return; // реже на мобильных
  const space=document.querySelector('.stars-parallax');
  const star=document.createElement('div');
  star.className='shooting';
  const startX=Math.random()*window.innerWidth*0.8+window.innerWidth*0.3;
  const startY=Math.random()*window.innerHeight*0.5;
  star.style.left=startX+'px'; star.style.top=startY+'px';
  star.style.transform='rotate(-30deg)';
  space.appendChild(star);
  const duration=1000+Math.random()*700;
  const distance=380+Math.random()*320;
  star.animate([
    {transform:'translate(0,0) rotate(-30deg)',opacity:0},
    {transform:`translate(${-distance*0.3}px, ${distance*0.15}px) rotate(-30deg)`,opacity:1,offset:0.15},
    {transform:`translate(${-distance}px, ${distance*0.5}px) rotate(-30deg)`,opacity:0}
  ],{duration,easing:'ease-out'}).onfinish=()=>star.remove();
}
function scheduleShootingStar(){
  const burst = isMobile ? 1 : (1 + Math.floor(Math.random()*2));
  for(let i=0;i<burst;i++){ setTimeout(createShootingStar, i*180); }
  // Реже на мобильных
  setTimeout(scheduleShootingStar, isMobile ? (2200+Math.random()*2500) : (900+Math.random()*1800));
}
window.addEventListener('load',()=>{
  createTwinkles();
  createParticles();
  setTimeout(scheduleShootingStar, isMobile ? 1800 : 1000);
});