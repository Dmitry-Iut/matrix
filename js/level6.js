/* Уровень 6 (кат-сцена): сейф открывается */
G.levels[6]=(root,api)=>{
  root.innerHTML='<div class="safe"><div class="vault"><div class="in"><span>♥</span></div><div class="door">⚙</div></div><div class="con"></div></div>';
  const v=root.querySelector('.vault'),con=root.querySelector('.con');let on=true;
  (async()=>{
    con.textContent='ЗАЩИТА СНЯТА';A.sfx.win();await G.sleep(1400);
    con.textContent='ОТКРЫВАЮ СЕЙФ...';A.sfx.unlock();await G.sleep(800);v.classList.add('open');
    await G.sleep(3200);con.textContent='СЕРДЦЕ ОТКРЫТО';con.style.color='#ff2a4a';A.sfx.ok();
    await G.sleep(2200);if(on)api.win();
  })();
  return()=>{on=false};
};
