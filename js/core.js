/* Ядро: диалоги, перемотка времени, порядок уровней, дождь матрицы */
(()=>{
const $=s=>document.querySelector(s);
const G=window.G={levels:{},code:['__','__','__'],sleep:ms=>new Promise(r=>setTimeout(r,ms))};
const stage=G.stage=$('#stage'),dlg=$('#dlg'),fx=$('#fx');
G.setCode=(i,v)=>{G.code[i]=v;$('#code').textContent=G.code.join(' ')};
G.setLvl=t=>$('#lvl').textContent=t;
$('#mute').onclick=()=>{A.init();$('#mute').textContent=A.toggle()?'✕':'♪'};
G.type=async(el,text,sp=30)=>{el.textContent='';for(const ch of text){el.textContent+=ch;if(ch!==' ')A.tick();await G.sleep(sp)}};
G.say=(who,text)=>new Promise(res=>{
  const w=dlg.querySelector('.who'),t=dlg.querySelector('.txt'),b=dlg.querySelector('button');
  dlg.classList.remove('hidden');w.textContent=who;t.textContent='';b.style.visibility='hidden';
  let i=0,done=false;
  const fin=()=>{if(done)return;done=true;clearInterval(iv);t.textContent=text;b.style.visibility='visible'};
  const iv=setInterval(()=>{i++;t.textContent=text.slice(0,i);if(text[i-1]!==' ')A.tick();if(i>=text.length)fin()},28);
  dlg.onclick=()=>{if(!done){fin();return}dlg.onclick=null;dlg.classList.add('hidden');A.click();res()};
});
G.sayAll=async(who,arr)=>{for(const l of arr)await G.say(who,l)};
G.fit=(cv,root,W,H)=>{const s=Math.min(root.clientWidth/W,root.clientHeight/H);cv.style.width=W*s+'px';cv.style.height=H*s+'px'};
G.rewind=async why=>{
  A.sfx.rewind();fx.classList.remove('hidden');
  fx.innerHTML=`<div class="rw">◄◄ ПЕРЕМОТКА</div><div class="why">${why||''}</div><div class="rwt"></div><div class="rwc">00:00</div>`;
  const c=fx.querySelector('.rwc');let v=180,iv=setInterval(()=>{v=Math.max(0,v-9);c.textContent=String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')},100);
  await G.type(fx.querySelector('.rwt'),'Ничего страшного — я же создатель этой матрицы. Просто отмотаю время назад...',26);
  await G.sleep(900);clearInterval(iv);fx.classList.add('hidden');fx.innerHTML='';
};
G.play=async n=>{
  for(;;){
    stage.innerHTML='';let why,cleanup;
    const ok=await new Promise(res=>{
      let d=0;
      cleanup=G.levels[n](stage,{win:()=>{if(!d){d=1;res(true)}},fail:w=>{if(!d){d=1;why=w;res(false)}}});
    });
    if(cleanup)cleanup();
    if(ok)return;
    await G.rewind(why);
  }
};
/* дождь из символов на заднем плане */
(()=>{
  const cv=$('#rain'),c=cv.getContext('2d');let drops=[];
  const rs=()=>{cv.width=innerWidth;cv.height=innerHeight;drops=Array.from({length:Math.ceil(cv.width/14)},()=>Math.random()*-50)};
  rs();addEventListener('resize',rs);
  const ch='01アイウエオカキクケコサシスセソ<>/#$%';
  setInterval(()=>{
    c.fillStyle='rgba(0,0,0,.12)';c.fillRect(0,0,cv.width,cv.height);c.fillStyle='#00ff66';c.font='13px monospace';
    drops.forEach((y,i)=>{c.fillText(ch[Math.random()*ch.length|0],i*14,y*14);drops[i]=y*14>cv.height&&Math.random()>.97?0:y+1});
  },70);
})();
const sleep=G.sleep;
G.start=async()=>{
  stage.innerHTML='<div class="title"><h1>КОД В МАТРИЦЕ</h1><p>для Леночки</p><button id="go">ВОЙТИ</button><small>Включи звук ♪<br>и лучше играть ночью</small></div>';
  await new Promise(r=>$('#go').onclick=r);
  A.init();A.click();A.startMatrix();
  stage.innerHTML='<div class="pre"></div>';const pre=stage.firstChild;
  for(const l of ['Леночка,','я решил сделать тебе приятное,','чтобы ты не скучала без меня.']){
    const p=document.createElement('p');pre.append(p);await G.type(p,l,45);await sleep(500);
  }
  await sleep(1000);stage.innerHTML='';
  await G.sayAll('Дима',[
    'Привет, Лен. Это я — создатель этой матрицы.',
    'Беда: пропал секретный код. Он затерялся где-то глубоко в цифрах сервера.',
    'Без тебя мне его не найти. Поможешь?',
    'Если что-то пойдёт не так — не переживай. Я просто отмотаю время назад.'
  ]);
  const intro={
    1:['Первая зона. Сервер заминирован вирусом-шутником: на бомбе таймер — 3 минуты.','Рядом лежит книга по разминированию. Читай внимательно: провода и символы на кнопке решают всё.'],
    2:['Отлично! Первые цифры кода: 26. Идём глубже — доступ к архивному шкафу открыт.','Код спрятан на одном из предметов. Берись за них, пока сканер зелёный. Как только он замигает — замри: он реагирует на движение!'],
    3:['Есть! Вторая часть кода: 04. Дальше — мусорная зона сервера.','Сверху сыплются антивирусные щиты. Лови их корзиной, но не лови вирусов! Нужно 15 щитов — и мусорка отдаст последний кусочек.'],
    4:['Из мусорки выпал последний кусочек кода: 26!','Теперь весь код у нас. Идём к сейфу.'],
    5:[]
  };
  const win={1:'26',2:'04',3:'26'};
  for(let n=1;n<=5;n++){
    G.setLvl('УРОВЕНЬ '+n+'/5');
    if(n===1)A.setIntensity(0);if(n===3)A.setIntensity(1);if(n===5)A.setIntensity(2);
    stage.innerHTML='';
    await G.sayAll('Дима',intro[n]);
    await G.play(n);
    if(win[n])G.setCode(n-1,win[n]);
  }
  A.setIntensity(0);G.setLvl('СЕЙФ');
  await G.play(6);
  await G.finale();
};
})();
