/* Уровень 5: лазеры в стиле Geometry Dash. Тап — прыжок */
G.levels[5]=(root,api)=>{
  const W=195,H=150,GY=118,CX=40,CS=10,SP=95,GRAV=700,JV=240,LEN=3600;
  root.innerHTML='<canvas class="px"></canvas><div class="l3hud"><span>ЗАЩИТА: ЛАЗЕРЫ</span><span class="pr">0%</span></div>';
  const cv=root.querySelector('canvas');cv.width=W;cv.height=H;G.fit(cv,root,W,H);
  root.insertAdjacentHTML('beforeend','<div style="position:absolute;left:0;right:0;bottom:24px;text-align:center;font-size:9px;opacity:.7;pointer-events:none">ТАПАЙ, ЧТОБЫ ПРЫГАТЬ</div>');
  const x=cv.getContext('2d');x.imageSmoothingEnabled=false;const pr=root.querySelector('.pr');
  const obs=[];let ox=280;
  while(ox<LEN){
    const r=Math.random();
    if(r<.5)obs.push({x:ox,w:5,h:12});
    else if(r<.8){obs.push({x:ox,w:5,h:12},{x:ox+16,w:5,h:12})}
    else obs.push({x:ox,w:5,h:20});
    ox+=95+Math.random()*45+(r>=.5?30:0);
  }
  let y=0,vy=0,dist=0,state='run',raf,want=false,rot=0,parts=[],t=0;
  const air=()=>y>0;
  const jump=()=>{if(!air()&&state==='run'){vy=JV;A.sfx.jump()}};
  const down=()=>{want=true;jump()},up=()=>{want=false};
  addEventListener('pointerup',up);addEventListener('pointercancel',up);
  root.addEventListener('pointerdown',down);
  const die=async()=>{
    state='dead';A.sfx.boom();
    for(let i=0;i<28;i++)parts.push({x:CX+5,y:GY-y-5,vx:(Math.random()-.5)*160,vy:Math.random()*-160,l:1});
    await G.sleep(1000);api.fail('Лазер задел тебя!');
  };
  const win=async()=>{state='win';A.sfx.win();await G.sleep(2000);api.win()};
  const loop=now=>{
    raf=requestAnimationFrame(loop);
    const dt=Math.min(.033,(now-(loop.l||now))/1000);loop.l=now;t+=dt;
    if(state==='run'){
      dist+=SP*dt;
      if(air()||vy>0){vy-=GRAV*dt;y+=vy*dt;rot+=dt*Math.PI*2.9;if(y<=0){y=0;vy=0;rot=0;if(want)jump()}}
      for(const o of obs){
        const sx=o.x-dist+CX;
        if(sx<CX+CS-2&&sx+o.w>CX+2&&y<o.h-2){die();break}
      }
      pr.textContent=Math.min(100,Math.floor(dist/LEN*100))+'%';
      if(dist>=LEN+40)win();
    }
    x.fillStyle='#02060a';x.fillRect(0,0,W,H);
    x.fillStyle='rgba(0,255,102,.08)';for(let i=-(dist*.5%16);i<W;i+=16)x.fillRect(i,0,1,GY);for(let j=0;j<GY;j+=16)x.fillRect(0,j,W,1);
    x.fillStyle='rgba(0,255,102,.35)';for(let i=0;i<14;i++){const cx=((i*47-dist*.3)%W+W)%W;x.fillRect(cx,(i*29+t*30)%GY,1,4)}
    x.fillStyle='#00ff66';x.fillRect(0,GY,W,2);x.fillStyle='#052512';x.fillRect(0,GY+2,W,H-GY);
    x.fillStyle='#0a6b35';for(let i=-(dist%12);i<W;i+=12)x.fillRect(i,GY+4,6,1);
    for(const o of obs){
      const sx=o.x-dist+CX;if(sx<-20||sx>W+20)continue;
      x.fillStyle='#333';x.fillRect(sx-1,GY-3,o.w+2,3);x.fillStyle='#333';x.fillRect(sx-1,GY-o.h-3,o.w+2,3);
      const f=.6+Math.random()*.4;x.fillStyle=`rgba(255,42,74,${f*.35})`;x.fillRect(sx-2,GY-o.h,o.w+4,o.h-3);
      x.fillStyle='#ff2a4a';x.fillRect(sx,GY-o.h,o.w,o.h-3);x.fillStyle='#ffd0d8';x.fillRect(sx+2,GY-o.h,1,o.h-3);
    }
    if(state!=='dead'){
      x.save();x.translate(CX+CS/2,GY-y-CS/2);x.rotate(rot);
      x.fillStyle='#00ff66';x.fillRect(-CS/2,-CS/2,CS,CS);x.fillStyle='#021208';x.fillRect(-CS/2+2,-CS/2+2,CS-4,CS-4);x.fillStyle='#00ff66';x.fillRect(-1,-1,2,2);x.restore();
    }
    parts.forEach(p=>{p.vy+=500*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;x.fillStyle=`rgba(0,255,102,${Math.max(0,p.l)})`;x.fillRect(p.x,p.y,2,2)});
    x.fillStyle='#052512';x.fillRect(10,16,W-20,4);x.fillStyle='#ffd83a';x.fillRect(10,16,(W-20)*Math.min(1,dist/LEN),4);
    if(state==='win'){x.fillStyle='rgba(0,0,0,.6)';x.fillRect(0,50,W,36);x.fillStyle='#00ff66';x.font='bold 12px monospace';x.textAlign='center';x.fillText('ЗАЩИТА СНЯТА',W/2,73)}
  };
  raf=requestAnimationFrame(loop);
  return()=>{cancelAnimationFrame(raf);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);state='done'};
};
