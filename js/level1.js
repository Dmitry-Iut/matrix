/* Уровень 1: разминировать бомбу по книге */
G.levels[1]=(root,api)=>{
  const COL={red:'#ff2a4a',blue:'#33b5ff',yellow:'#ffd83a',green:'#33ff66',white:'#e8ffe8'};
  const NAME={red:'красный',blue:'синий',yellow:'жёлтый',green:'зелёный',white:'белый'};
  const SYM={red:'▲',blue:'●',yellow:'★',green:'◆',white:'✚'};
  const keys=Object.keys(COL),shuf=a=>[...a].sort(()=>Math.random()-.5);
  const wires=Array.from({length:5},()=>keys[Math.random()*5|0]);
  const idx=c=>wires.map((w,i)=>w===c?i:-1).filter(i=>i>=0);
  const R=idx('red'),B=idx('blue'),Y=idx('yellow');
  let cut;
  if(R.length>1)cut=R[R.length-1];else if(Y.length&&!B.length)cut=Y[0];else if(B.length>1)cut=B[1];else cut=4;
  const need=SYM[wires[cut]];
  const syms=shuf([need,...shuf(Object.values(SYM).filter(s=>s!==need)).slice(0,2)]);
  const bcols=shuf(keys);
  root.innerHTML=`<div class="l1"><div class="bomb"><div class="disp">03:00</div>
  <div class="wires">${wires.map((w,i)=>`<div class="wire" data-i="${i}" style="--c:${COL[w]}"><b>${i+1}</b><i></i></div>`).join('')}</div>
  <div class="btns">${syms.map((s,i)=>`<button class="kb" data-s="${s}" style="--c:${COL[bcols[i]]}">${s}</button>`).join('')}</div>
  <div class="msg">Сначала перережь нужный провод, потом нажми нужную кнопку.</div></div>
  <div class="book"><div class="tabs"><button class="on" data-p="0">КНИГА · ПРОВОДА</button><button data-p="1">КНИГА · КНОПКА</button></div><div class="page"></div></div></div>`;
  const $=s=>root.querySelector(s),bomb=$('.bomb'),disp=$('.disp'),msg=$('.msg'),page=$('.page');
  const pages=[
    `<h4>ПРОВОДА (счёт сверху вниз)</h4><p>1. Если красных проводов больше одного — режь ПОСЛЕДНИЙ красный.</p><p>2. Иначе, если есть жёлтый провод и нет синего — режь ПЕРВЫЙ жёлтый.</p><p>3. Иначе, если синих больше одного — режь ВТОРОЙ синий.</p><p>4. Иначе режь ПОСЛЕДНИЙ провод.</p><p>Берёшь первое подходящее правило.</p>`,
    `<h4>КНОПКА</h4><p>Нажми кнопку с символом, который соответствует цвету перерезанного провода. Цвет самой кнопки — обманка!</p>${keys.map(k=>`<div class="row"><span class="dot" style="--c:${COL[k]}"></span>${NAME[k]} → ${SYM[k]}</div>`).join('')}`
  ];
  const show=p=>{page.innerHTML=pages[p];root.querySelectorAll('.tabs button').forEach((b,i)=>b.classList.toggle('on',i===p));A.click()};
  root.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>show(+b.dataset.p));show(0);
  let left=180,over=false,cutDone=false;
  const fmt=()=>String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');
  const iv=setInterval(()=>{if(over)return;left--;disp.textContent=fmt();if(left<=30)A.sfx.tick();if(left<=0)boom('Время вышло!')},1000);
  const boom=async why=>{
    if(over)return;over=true;clearInterval(iv);A.sfx.boom();bomb.classList.add('boom');disp.textContent='BOOM';
    await G.sleep(1100);api.fail(why);
  };
  root.querySelectorAll('.wire').forEach(w=>w.onclick=()=>{
    if(over||cutDone)return;
    if(+w.dataset.i===cut){cutDone=true;w.classList.add('cut');A.sfx.snip();msg.textContent='Провод перерезан! Теперь нажми нужную кнопку.'}
    else{w.classList.add('cut');boom('Не тот провод!')}
  });
  root.querySelectorAll('.kb').forEach(k=>k.onclick=async()=>{
    if(over)return;
    if(!cutDone){A.sfx.bad();msg.textContent='Сначала перережь провод!';return}
    if(k.dataset.s===need){
      over=true;clearInterval(iv);A.sfx.win();disp.classList.add('ok');disp.textContent='ПОБЕДА';
      bomb.insertAdjacentHTML('beforeend','<div class="sidecode">26</div>');
      msg.textContent='Бомба обезврежена. Первые цифры кода: 26';
      await G.sleep(2800);api.win();
    }else boom('Не та кнопка!');
  });
  return()=>{over=true;clearInterval(iv)};
};
