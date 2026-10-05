/* Уровень 4: сейф с кодом 260426, диалог про 123456, сбой защиты */
G.levels[4]=(root,api)=>{
  root.innerHTML=`<div class="safe"><div class="vdoor"><div class="vscr">${'<span></span>'.repeat(6)}</div><div class="con">ВВЕДИ КОД ДОСТУПА (6 ЦИФР)</div>
  <div class="pad">${[1,2,3,4,5,6,7,8,9,'⌫',0,'OK'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div></div></div>`;
  const safe=root.querySelector('.safe'),slots=[...root.querySelectorAll('.vscr span')],con=root.querySelector('.con'),btns=[...root.querySelectorAll('.pad button')];
  let entry='',tries=0,lock=false,alive=true;
  const draw=()=>slots.forEach((s,i)=>s.textContent=entry[i]||'');
  const say=(t,bad)=>{con.textContent=t;con.classList.toggle('bad',!!bad)};
  const key=k=>btns.find(b=>b.dataset.k==k);
  const press=async d=>{const b=key(d);b.classList.add('hit');A.sfx.click();await G.sleep(130);b.classList.remove('hit')};
  const auto=async()=>{entry='';draw();for(const d of '260426'){await press(d);entry+=d;draw();await G.sleep(260)}};
  const glitch=async()=>{
    A.sfx.glitch();safe.classList.add('shk','glitchbg');say('СБОЙ... ОШИБКА... ОШИБКА!',true);
    await G.sleep(1800);A.sfx.alarm();say('ЗАЩИТА НЕ ОТКЛЮЧЕНА!',true);await G.sleep(1400);safe.classList.remove('shk','glitchbg');
    await G.sayAll('Дима',['Стоп! Я не отключил защиту!','Срочно уворачивайся от лазеров, иначе всё провалено — и мы так и не узнаем, что внутри!']);
    if(alive)api.win();
  };
  const submit=async()=>{
    if(lock)return;lock=true;
    if(entry==='260426'){say('КОД ПРИНЯТ...');A.sfx.ok();await G.sleep(700);await glitch();return}
    tries++;A.sfx.bad();say('ДОСТУП ЗАПРЕЩЁН',true);safe.classList.add('shk');await G.sleep(450);safe.classList.remove('shk');
    if(tries===1){await G.say('Дима','Хм... Подумай ещё раз ;)')}
    else if(tries===2){await G.say('Дима','Ну может, пин-код от карты подойдёт)) Шучу. Ну я думаю... попробуй 123456')}
    else{
      await G.say('Дима',entry==='123456'?'Ха-ха, не подошёл) Ладно, помогу.':'Ха, ладно, помогу.');
      say('ВВОД ИЗ ЦЕНТРА УПРАВЛЕНИЯ...');await auto();say('КОД ПРИНЯТ...');A.sfx.ok();await G.sleep(700);await glitch();return;
    }
    entry='';draw();say('ВВЕДИ КОД ДОСТУПА (6 ЦИФР)');lock=false;
  };
  btns.forEach(b=>b.onclick=()=>{
    if(lock)return;const k=b.dataset.k;A.sfx.click();
    if(k==='⌫')entry=entry.slice(0,-1);else if(k==='OK'){if(entry.length===6)submit();else{A.sfx.bad();say('НУЖНО 6 ЦИФР',true)}}
    else if(entry.length<6)entry+=k;
    draw();
  });
  return()=>{alive=false};
};
