const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
const addMinutes = (time, minutes) => { const [h,m] = time.split(':').map(Number); const value = h*60+m+minutes; return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`; };
const timeLabel = seconds => `${Math.floor(Math.max(0,seconds)/60)}:${String(Math.floor(Math.max(0,seconds)%60)).padStart(2,'0')}`;
const dayName = index => index === 0 ? 'Martes 24 de noviembre' : 'Miércoles 25 de noviembre';
let eventData;
let activeDay = 0;

function timelineRow({start,durationMinutes,students,modality,projectTitle,title,description,kind='',tutorId,activity}) {
  const end = addMinutes(start,durationMinutes);
  const names = students ? students.map(name => `<h4 class="student-name">${escapeHTML(name)}</h4>`).join('') : `<h4 class="student-name">${escapeHTML(title)}</h4>`;
  const project = students ? (projectTitle ? `<p class="project-title">${escapeHTML(projectTitle)}</p>` : `<p class="project-title pending">Título del proyecto por anunciar</p>`) : '';
  const excellence=modality==='Excelencia académica';
  const activityLine=excellence?`<p class="activity-label">${escapeHTML(activity || 'Socialización de artículo')}</p>`:'';
  const tutor=eventData?.tutors?.find(t=>t.id===tutorId);
  const tutorLine=tutor?`<p class="tutor-line">Tutor: <strong>${escapeHTML(tutor.name)}</strong></p>`:'';
  return `<article class="timeline-card ${kind}${excellence?' excellence':''}" aria-label="${escapeHTML(start+' a '+end)}"><div class="time-pill"><strong>${escapeHTML(start)}</strong><small>hasta ${escapeHTML(end)}</small></div><div class="student-content">${names}<p class="modality${excellence?' excellence-label':''}">${excellence?'<svg class="icon"><use href="#i-star"/></svg>':''}${escapeHTML(modality || description || '')}${students?.length > 1 ? ' · Presentación en grupo' : ''}</p>${activityLine}${project}${tutorLine}</div><div class="duration"><strong>${durationMinutes}</strong>min</div></article>`;
}

function renderProgram() {
  if (!eventData) return;
  const day = eventData.days[activeDay];
  const query = normalize($('#student-search').value.trim());
  const defenses = day.defenses.filter(defense => normalize([...defense.students,defense.modality,defense.projectTitle || ''].join(' ')).includes(query));
  const rows = [];
  if (!query && day.opening) rows.push(timelineRow({...day.opening,kind:'special',description:'Bienvenida y apertura del encuentro académico'}));
  rows.push(...defenses.map(defense => timelineRow(defense)));
  if (!query) {
    rows.push(timelineRow({...day.deliberation,kind:'deliberation',title:'Deliberación del jurado',description:'Evaluación de la jornada'}));
    rows.push(timelineRow({...day.closing,kind:'closing',title:'Cierre de la jornada',description:'Agradecimientos y despedida'}));
  }
  $('#timeline').innerHTML = rows.length ? rows.join('') : '<div class="empty-result"><p>No encontramos ese nombre en esta jornada.</p><p>Prueba con otro nombre o revisa el otro día.</p><button id="clear-search">Limpiar búsqueda</button></div>';
  $('#clear-search')?.addEventListener('click',() => { $('#student-search').value=''; renderProgram(); $('#student-search').focus(); });
  $('#day-title').textContent = dayName(activeDay);
  const count = day.defenses.reduce((total,defense) => total+defense.students.length,0);
  $('#day-summary').textContent = `${day.defenses.length} turnos · ${count} estudiantes`;
  $('#search-status').textContent = query ? `${defenses.length} ${defenses.length===1?'presentación encontrada':'presentaciones encontradas'} en la jornada seleccionada.` : '';
  $('#day-juries').innerHTML = day.juries.map(id => { const juror = eventData.jury.find(j => j.id===id); return `<li><strong>${escapeHTML(juror.name)}</strong><span>${escapeHTML(juror.role)}</span><p class="jury-mini-profile">${escapeHTML(juror.profile)}</p></li>`; }).join('');
}

function selectDay(index, focus=false) {
  activeDay = index;
  $$('.day-tabs button').forEach((tab,i) => { tab.setAttribute('aria-selected',String(i===index)); tab.tabIndex = i===index?0:-1; });
  $('#day-panel').setAttribute('aria-labelledby',`tab-day-${index}`);
  $('#student-search').value='';
  renderProgram();
  if (focus) $(`#tab-day-${index}`).focus();
}
$$('.day-tabs button').forEach(tab => {
  tab.addEventListener('click',() => selectDay(Number(tab.dataset.day)));
  tab.addEventListener('keydown',event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    selectDay(event.key==='Home'?0:event.key==='End'?1:1-activeDay,true);
  });
});
$('#student-search').addEventListener('input',renderProgram);

function renderJuries() {
  $('#jury-grid').innerHTML = eventData.jury.map(juror => {
    const initials = juror.name.replace(/^Lic\.\s*/,'').split(' ').filter(Boolean).map(x=>x[0]);
    const days = eventData.days.map((day,i) => day.juries.includes(juror.id) ? `<span>${i===0?'Martes 24':'Miércoles 25'}</span>` : '').join('');
    return `<article class="jury-card"><div class="jury-monogram" aria-hidden="true">${escapeHTML(initials[0]+initials[initials.length-2])}</div><p>${escapeHTML(juror.role)}</p><h3>${escapeHTML(juror.name)}</h3><div class="jury-profile">${escapeHTML(juror.profile)}</div><div class="jury-dates">${days}</div></article>`;
  }).join('');
}

function updateCountdown(now=Date.now()) {
  if (!eventData) return;
  const events = eventData.days.map(day => ({start:Date.parse(`${day.date}T19:00:00-04:00`),end:Date.parse(`${day.date}T${day.eventEnd}:00-04:00`)}));
  let diff=0;
  const ongoing = events.findIndex(event => now>=event.start && now<event.end);
  const next = events.findIndex(event => now<event.start);
  if (ongoing!==-1) {
    $('#countdown-label').textContent='EL ENCUENTRO ESTÁ EN CURSO';
    $('#countdown-note').textContent=`${dayName(ongoing)} · Consulta el programa de hoy`;
  } else if (next!==-1) {
    diff=events[next].start-now;
    $('#countdown-label').textContent=next===0?'NOS ENCONTRAMOS EN':'LA SIGUIENTE JORNADA EN';
    $('#countdown-note').textContent=`${next===0?'24':'25'} de noviembre · 19:00 · La Paz`;
  } else {
    $('#countdown-label').textContent='GRACIAS POR ACOMPAÑARNOS';
    $('#countdown-note').textContent='El encuentro académico ha concluido.';
  }
  const seconds=Math.floor(Math.max(0,diff)/1000);
  const values=[Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60];
  ['days','hours','minutes','seconds'].forEach((key,i) => $(`#cd-${key}`).textContent=String(values[i]).padStart(2,'0'));
}

const audio=$('#invitation-audio');
const audioButton=$('#audio-toggle');
function reflectAudioState() {
  const playing=!audio.paused && !audio.ended;
  audioButton.innerHTML=`<svg class="icon"><use href="#i-${playing?'pause':'play'}"/></svg>`;
  audioButton.setAttribute('aria-label',playing?'Pausar invitación':'Reproducir invitación');
  $('#audio-status').textContent=playing?'Reproduciendo invitación':audio.ended?'Volver a escuchar':audio.currentTime>0?'Invitación en pausa':'Pulsa para escuchar';
  $('#hero-listen').innerHTML=`<svg class="icon"><use href="#i-${playing?'pause':'play'}"/></svg>${playing?'Pausar invitación':'Escuchar invitación'}`;
}
async function toggleAudio() {
  if (!audio.paused) { audio.pause(); return; }
  try { if (audio.ended) audio.currentTime=0; await audio.play(); }
  catch { $('#audio-status').textContent='No se pudo reproducir. Pulsa para reintentar.'; }
}
audioButton.addEventListener('click',toggleAudio);
$('#hero-listen').addEventListener('click',toggleAudio);
['play','pause','ended'].forEach(type => audio.addEventListener(type,reflectAudioState));
audio.addEventListener('loadedmetadata',() => { if (Number.isFinite(audio.duration)) { $('#audio-progress').max=audio.duration; $('#audio-duration').textContent=timeLabel(audio.duration); } });
audio.addEventListener('timeupdate',() => { $('#audio-current').textContent=timeLabel(audio.currentTime); $('#audio-progress').value=audio.currentTime; });
audio.addEventListener('error',() => { $('#audio-status').textContent='Audio no disponible en este momento.'; });
$('#audio-progress').addEventListener('input',event => { if (Number.isFinite(audio.duration)) audio.currentTime=Math.min(Number(event.target.value),audio.duration); });

const dialog=$('#welcome-dialog');
let introTimer;
function rememberOpened(){try{sessionStorage.setItem('donbosco-invitation-opened','1');}catch{}}
function closeInvitation(toProgram=false) {
  clearTimeout(introTimer);
  dialog.close();
  rememberOpened();
  if (toProgram) { $('#programa').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); $('#tab-day-0').focus({preventScroll:true}); }
  else $('#hero-title').focus({preventScroll:true});
}
$('#open-invitation').addEventListener('click',() => {
  $('#open-invitation').disabled=true;
  $('.envelope').classList.add('open');
  introTimer=setTimeout(()=>closeInvitation(),matchMedia('(prefers-reduced-motion: reduce)').matches?0:1050);
});
$('#skip-invitation').addEventListener('click',()=>closeInvitation(true));
dialog.addEventListener('cancel',event=>{event.preventDefault();closeInvitation();});
dialog.addEventListener('close',()=>{clearTimeout(introTimer);rememberOpened();});
function showInvitation(){ $('.envelope').classList.remove('open'); $('#open-invitation').disabled=false; if(!dialog.open)dialog.showModal(); dialog.scrollTop=0; $('#welcome-title').setAttribute('tabindex','-1'); $('#welcome-title').focus({preventScroll:true}); }
$('#reopen-invitation').addEventListener('click',showInvitation);
let alreadyOpened=false;
try{alreadyOpened=sessionStorage.getItem('donbosco-invitation-opened')==='1';}catch{}
if (!alreadyOpened && !location.hash) showInvitation();

async function loadEvent() {
  try {
    const response=await fetch('event-data.json',{cache:'no-store'});
    if(!response.ok)throw new Error('No data');
    eventData=await response.json();
    const bolivianDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/La_Paz',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    activeDay=bolivianDate==='2026-11-25'?1:0;
    selectDay(activeDay);
    renderJuries();
    renderModalities();
    $$('.whatsapp-link').forEach(link=>link.href=eventData.contact.url);
    updateCountdown();
    setInterval(updateCountdown,1000);
  } catch(error) {
    $('#timeline').innerHTML='<div class="empty-result"><p>No pudimos cargar el programa.</p><a class="text-link" href="programa.html">Abrir el programa completo</a><br><button id="retry-data">Intentar nuevamente</button></div>';
    $('#retry-data').addEventListener('click',loadEvent);
    $('#audio-status').textContent='La invitación de audio está disponible.';
  }
}
loadEvent();

function renderModalities() {
  $('#modalities-grid').innerHTML = eventData.modalities.map(modality => {
    const transcript = modality.transcript.split(/\n\s*\n/).map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('');
    const player = modality.audioFile
      ? `<audio controls preload="metadata" aria-label="Escuchar: ${escapeHTML(modality.title)}" src="${escapeHTML(modality.audioFile)}"></audio>`
      : '<p class="audio-coming"><svg class="icon" aria-hidden="true"><use href="#i-volume"/></svg>Audio próximamente · Lee la explicación</p>';
    return `<article class="soft-panel modality-card ${modality.id==='excelencia'?'excellence-mode':''}"><span class="gold-icon" aria-hidden="true"><svg class="icon"><use href="#i-${modality.id==='excelencia'?'star':modality.id==='practica'?'cap':'play'}"/></svg></span><h3>${escapeHTML(modality.title)}</h3><p class="mode-tagline">${escapeHTML(modality.tagline)}</p><p class="mode-description">${escapeHTML(modality.description)}</p>${player}<details><summary>Leer información de la modalidad</summary><div class="mode-transcript">${transcript}</div></details></article>`;
  }).join('');
  $$('audio').forEach(player => player.addEventListener('play', () => {
    $$('audio').forEach(other => { if(other !== player) other.pause(); });
  }));
}
