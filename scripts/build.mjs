import { readFile, writeFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('public/event-data.json', root), 'utf8'));
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mins = time => { const [h,m]=time.split(':').map(Number); return h*60+m; };
const plus = (time, duration) => { const n=mins(time)+duration;return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; };
const people = data.days.flatMap(day => day.defenses.flatMap(item => item.students));
assert.equal(people.length,15, 'El programa debe incluir 15 estudiantes.');
assert.equal(new Set(people).size,15, 'Hay estudiantes repetidos.');
assert.equal(data.scheduleProvisional,false);
assert.equal(data.projectTitlesPending,false);
assert.equal(data.host.name,'Lic. Willy Renjifo Mamani');
assert.deepEqual(data.days.map(d=>d.juries.length),[4,3]);
assert.deepEqual(data.days.map(d=>d.defenses.reduce((n,x)=>n+x.students.length,0)),[8,7]);
assert.equal(data.days.flatMap(d=>d.defenses).filter(d=>d.modality==='Excelencia académica').length,3);
const sections=[];
for (const [index,day] of data.days.entries()) {
  let expected = day.opening ? plus(day.opening.start,day.opening.durationMinutes) : '19:00';
  const rows=[];
  const row=(start,end,content,label,excellence=false)=>`<tr${excellence?' class="excellence"':''}><td class="time">${esc(start)}<br><span>${esc(end)}</span></td><td>${content}</td><td>${esc(label)}</td></tr>`;
  if(day.opening) rows.push(row(day.opening.start,expected,`<strong>${esc(day.opening.title)}</strong>`,'15 minutos'));
  for(const [i,item] of day.defenses.entries()) {
    assert.equal(item.start,expected,`Revisar continuidad de ${day.date}, turno ${i+1}`);
    assert.equal(item.order,i+1);
    assert.ok(item.projectTitle?.trim());
    const excellence=item.modality==='Excelencia académica';
    assert.equal(item.durationMinutes,excellence?10:20);
    assert.equal(item.tutorId,excellence?'ivan':'willy');
    if(excellence)assert.equal(item.activity,'Socialización de artículo');
    expected=plus(item.start,item.durationMinutes);
    const names=item.students.map(name=>`<strong>${esc(name)}</strong>`).join('<br>');
    rows.push(row(item.start,expected,`${names}${excellence?`<p class="recognition">${esc(item.activity)}</p>`:''}<p class="project">${esc(item.projectTitle)}</p>`,item.modality,excellence));
  }
  assert.equal(expected,day.defensesEnd);
  assert.equal(day.deliberation.start,expected);
  assert.equal(day.deliberation.durationMinutes,10);
  expected=plus(expected,10);
  assert.equal(day.closing.start,expected);
  assert.equal(day.closing.durationMinutes,5);
  assert.equal(plus(expected,5),day.eventEnd);
  rows.push(row(day.deliberation.start,day.closing.start,'<strong>Deliberación del jurado</strong>','10 minutos'));
  rows.push(row(day.closing.start,day.eventEnd,'<strong>Cierre de la jornada</strong>','5 minutos'));
  const juries=day.juries.map(id=>{
    const jury=data.jury.find(j=>j.id===id);
    assert.ok(jury);
    return `<li><strong>${esc(jury.name)}</strong> · ${esc(jury.role)}<br>${esc(jury.profile)}</li>`;
  }).join('');
  sections.push(`<section><h2>${index===0?'Martes 24':'Miércoles 25'} de noviembre</h2><p class="day-meta">19:00–${esc(day.eventEnd)} · ${day.defenses.reduce((n,d)=>n+d.students.length,0)} estudiantes · Hora boliviana (UTC−4)</p><table><thead><tr><th>Inicio / fin</th><th>Participante y tema</th><th>Modalidad</th></tr></thead><tbody>${rows.join('')}</tbody></table><div class="day-notes"><h3>Jurado de la jornada</h3><ul>${juries}</ul><p><strong>Tutoría:</strong> Lic. Willy Renjifo Mamani, docente de Diseño Gráfico: Emprendimiento Productivo y Práctica Laboral Comunitaria. Lic. Ivan Delgado Avila, director del CEA Don Bosco “D”: Excelencia Académica.</p></div></section>`);
}
for (const mode of data.modalities) {
  assert.ok(mode.transcript?.trim());
  if(mode.audioFile) {
    assert.match(mode.audioFile,/^assets\/[a-z0-9-]+\.mp3$/);
    await access(new URL(`public/${mode.audioFile}`, root));
  }
}
await access(new URL(`public/${data.audio.audioFile}`, root));
const html=`<!doctype html>
<html lang="es-BO"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Programa oficial · Defensas 2026</title><link rel="icon" href="assets/favicon.png"><style>
*{box-sizing:border-box}body{font:15px/1.5 Arial,sans-serif;color:#102b46;background:#e5ebef;margin:0;padding:24px}main{max-width:1050px;margin:auto;background:#fffdf6;padding:34px;border-radius:18px}header{display:flex;gap:20px;align-items:center}header img{width:58px}h1{font-size:27px;line-height:1.2;margin:8px 0}h2{font-size:25px;margin-bottom:5px}h3{font-size:16px}p{margin:7px 0}section{margin-top:32px}.day-meta{font-size:13px;margin-bottom:15px}table{border-collapse:collapse;width:100%;font-size:13px;table-layout:fixed}td,th{text-align:left;padding:12px;border-bottom:1px solid #c7d0d7;vertical-align:top;overflow-wrap:anywhere}th{background:#102b46;color:white}th:first-child{width:85px}th:last-child{width:155px}.time{white-space:nowrap;font-weight:700}.time span{font-weight:400;color:#526577}.project{line-height:1.55;margin-top:8px}.recognition{font-size:11px;font-weight:700;color:#405888}.excellence{background:#e9e8f8}.notice{padding:14px;background:#e7ece6;border-left:4px solid #5d7f65;margin:23px 0}.day-notes{font-size:12px;line-height:1.55;margin-top:20px}.day-notes ul{padding-left:18px}.day-notes li{margin:7px 0}nav{display:flex;gap:20px;margin-bottom:20px;align-items:center}button,a{font:inherit;color:#102b46}button{padding:10px 20px;cursor:pointer}footer{margin-top:28px;font-size:12px;border-top:1px solid #c7d0d7;padding-top:18px}@media(max-width:600px){body{padding:10px}main{padding:16px}table{font-size:11px}td,th{padding:8px 5px}th:first-child{width:51px}th:last-child{width:82px}h1{font-size:22px}h2{font-size:23px}header{gap:14px}header img{width:40px}nav{font-size:13px}}@media print{body{padding:0;background:white}main{padding:0;max-width:none}nav{display:none}section+section{break-before:page}tr{break-inside:avoid}thead{display:table-header-group}table{font-size:9pt}td,th{padding:7px}h1{font-size:20pt}h2{font-size:17pt}.day-notes{font-size:9pt}.notice{font-size:10pt}.excellence,th{-webkit-print-color-adjust:exact;print-color-adjust:exact}.day-notes{break-inside:avoid}footer{font-size:9pt}@page{size:A4;margin:12mm}}
</style></head><body><main><nav><a href="index.html#programa">Volver al sitio</a><button onclick="window.print()">Imprimir programa</button></nav><header><img src="assets/logo-don-bosco.webp" alt="Logo Don Bosco El Prado"><div><p>CEA Don Bosco “D” · El Prado</p><h1>Defensas de Proyectos Finales 2026</h1><p>Diseño Gráfico · Técnico Medio II · Turno noche</p></div></header><div class="notice"><strong>PROGRAMA OFICIAL</strong><p>Orden y títulos confirmados. Los espacios de Excelencia Académica corresponden a socializaciones de artículos elaborados con la tutoría del Lic. Ivan Delgado Avila.</p></div>${sections.join('')}<footer>${esc(data.venue)} · ${esc(data.address)}<br>Consultas por WhatsApp: ${esc(data.contact.displayPhone)}<p>Sitio creado por <strong>Lic. Willy Renjifo Mamani</strong> · Docente de la Carrera de Diseño Gráfico.</p></footer></main></body></html>`;
await writeFile(new URL('public/programa.html', root),html);
console.log('Programa oficial generado: 15 estudiantes, 14 turnos, 3 socializaciones de artículos, sin solapamientos.');
