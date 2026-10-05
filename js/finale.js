/* Финал: пикселизация фото, письмо, «Спокойная ночь» */
G.finale=async()=>{
  const st=G.stage;G.setLvl('♥');A.stopMatrix(2.5);
  st.innerHTML='<div class="fin"><canvas width="300" height="400"></canvas></div>';
  const fin=st.firstChild,cv=fin.querySelector('canvas');
  await G.sleep(1500);A.playTsoi();
  const img=new Image();img.src='img/photo.jpg';
  await new Promise(r=>{img.onload=r;img.onerror=r});
  const ctx=cv.getContext('2d'),ar=(img.naturalHeight||4)/(img.naturalWidth||3);cv.height=Math.round(300*ar);
  const draw=s=>{const t=document.createElement('canvas');t.width=s;t.height=Math.max(1,Math.round(s*ar));t.getContext('2d').drawImage(img,0,0,t.width,t.height);ctx.imageSmoothingEnabled=false;ctx.drawImage(t,0,0,300,cv.height)};
  if(img.naturalWidth){for(const s of [4,6,9,14,22,36,60,100,160]){draw(s);await G.sleep(500)}
    const real=new Image();real.src='img/photo.jpg';cv.replaceWith(real)}
  const lines=[
    'Лена, я очень рад, что, несмотря ни на что, ты всегда рядом.',
    'Рядом с тобой мне спокойно и тепло.',
    'Я очень сильно тебя люблю.',
    'Ты делаешь мои дни светлее, даже когда мы далеко друг от друга.',
    'Спасибо, что ты у меня есть.'
  ];
  const hearts=setInterval(()=>{const h=document.createElement('div');h.className='hrt';h.textContent='♥';h.style.left=Math.random()*100+'%';h.style.fontSize=(10+Math.random()*16)+'px';h.style.animationDuration=(5+Math.random()*4)+'s';st.append(h);setTimeout(()=>h.remove(),9500)},700);
  await G.sleep(800);
  for(const l of lines){const p=document.createElement('p');fin.append(p);await G.type(p,l,55);fin.scrollTop=fin.scrollHeight;await G.sleep(1400)}
  const s=document.createElement('p');s.className='sign';fin.append(s);await G.type(s,'С любовью, твой Дима ♥',80);fin.scrollTop=fin.scrollHeight;
};
