/* Уровень 3: ловить корзиной антивирусные щиты. Вирусы ловить нельзя */
G.levels[3]=(root,api)=>{
  const W=130,H=260,TARGET=15;
  root.innerHTML='<canvas class="px"></canvas><div class="l3hud"><span class="sc">ЩИТЫ 0/15</span><span class="hp"><span>♥</span><span>♥</span></span></div>';
  const cv=root.querySelector('canvas');cv.width=W;cv.height=H;G.fit(cv,root,W,H);
  const x=cv.getContext('2d');x.imageSmoothingEnabled=false;
  const sc=root.querySelector('.sc'),hearts=[...root.querySelectorAll('.hp span')];
  const SH=['111111111','122222221','122323221','122333221','122323221','112222211','.1222221.','..12221..','...111...'];
  const VI=['..1...1..','...1.1...','.1111111.','112111211','111111111','111111111','.1111111.','.1.1.1.1.','1..1.1..1'];
  const PAL={shield:{1:'#00ff66',2:'#0a6b35',3:'#b8ffd0'},virus:{1:'#ff2a4a',2:'#ffffff'}};
  const spr=(rows,pal,px,py)=>rows.forEach((r,j)=>[...r].forEach((c,i)=>{if(c!=='.'){x.fillStyle=pal[c];x.fillRect(px+i|0,py+j|0,1,1)}}));
  let bx=W/2,items=[],score=0,lives=2,spawn=.5,state='play',t=0,raf,flash=0,popT=0;
  const BW=24,BY=H-26;
  const pos=e=>{const r=cv.getBoundingClientRect();bx=Math.max(BW/2,Math.min(W-BW/2,(e.clientX-r.left)/r.width*W))};
  const pd=e=>{if(state==='play')pos(e)};
  cv.addEventListener('pointerdown',pd);cv.addEventListener('pointermove',pd);
  const bg=()=>{
    x.fillStyle='#020a04';x.fillRect(0,0,W,H);x.fillStyle='rgba(0,255,102,.07)';
    for(let i=0;i<W;i+=13)x.fillRect(i,0,1,H);for(let j=(t*20)%13;j<H;j+=13)x.fillRect(0,j,W,1);
  };
  const basket=()=>{
    x.fillStyle='#00ff66';x.fillRect(bx-BW/2,BY,BW,2);
    for(let j=0;j<8;j++){const w=BW-2-j;x.fillStyle=j%2?'#0a6b35':'#0f9a4c';x.fillRect(bx-w/2,BY+2+j,w,1)}
    x.fillStyle='#052512';for(let i=-BW/2+4;i<BW/2-3;i+=4)x.fillRect(bx+i,BY+3,1,6);
  };
  const bin=(lid)=>{
    const cx=W/2-10,cy=H-70;x.fillStyle='#3a4a40';x.fillRect(cx,cy,20,28);x.fillStyle='#5c7266';x.fillRect(cx-2,cy-4-lid,24,4);x.fillRect(cx+7,cy-7-lid,6,3);
    x.fillStyle='#1f2a24';for(let i=3;i<18;i+=5)x.fillRect(cx+i,cy+3,2,22);
  };
  const loop=now=>{
    raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(now-(loop.l||now))/1000);loop.l=now;t+=dt;bg();
    if(state==='play'){
      spawn-=dt;
      if(spawn<=0){spawn=.5+Math.random()*.25;items.push({k:Math.random()<.7?'shield':'virus',x:6+Math.random()*(W-22),y:-10,v:62+score*1.8})}
      for(const it of items){
        it.y+=it.v*dt;
        if(it.y+9>=BY&&it.y<=BY+8&&it.x+9>bx-BW/2&&it.x<bx+BW/2){
          it.dead=true;
          if(it.k==='shield'){score++;A.sfx.catch();sc.textContent=`ЩИТЫ ${score}/${TARGET}`;if(score>=TARGET)finish()}
          else{
            A.sfx.hit();flash=.25;
            if(lives>0){lives--;hearts[lives].classList.add('off')}
            else{state='lose';lose()}
          }
        }
      }
      items=items.filter(i=>!i.dead&&i.y<H+10);
    }
    items.forEach(it=>spr(it.k==='shield'?SH:VI,PAL[it.k],it.x,it.y));
    if(state!=='win'&&state!=='done')basket();
    if(flash>0){flash-=dt;x.fillStyle='rgba(255,40,70,.35)';x.fillRect(0,0,W,H)}
    if(state==='win'||state==='done'){
      const lid=Math.min(10,Math.max(0,(t-popT-.6)*14));bin(lid);
      const rise=Math.max(0,Math.min(1,(t-popT-1)/1.2));
      if(rise>0){
        const py=H-85-rise*70;x.fillStyle='#000';x.fillRect(W/2-24,py-14,48,22);x.strokeStyle='#00ff66';x.strokeRect(W/2-24+.5,py-14+.5,47,21);
        x.fillStyle='#ffd83a';x.font='bold 16px monospace';x.textAlign='center';x.fillText('26',W/2,py+3);
      }
    }
  };
  raf=requestAnimationFrame(loop);
  const finish=async()=>{
    state='win';popT=t;items=[];A.sfx.win();
    await G.sleep(3200);state='done';await G.sleep(600);api.win();
  };
  const lose=async()=>{await G.sleep(900);api.fail('Вирусы пробрались в систему!')};
  return()=>{cancelAnimationFrame(raf);state='done'};
};
