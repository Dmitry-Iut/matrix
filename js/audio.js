/* Музыка и звуки — всё синтезируется на лету через Web Audio */
(()=>{
const A=window.A={ctx:null,muted:false};
let master,mus,sfxg,delay,bpm=92,inten=0,running=false,iv,nextT=0,step=0,drone=[],noiseBuf,tsoiBus,tIv,tAudio;
const mid=m=>440*Math.pow(2,(m-69)/12);
A.init=()=>{
  if(A.ctx){A.ctx.resume();return}
  try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
  const c=A.ctx=new (window.AudioContext||window.webkitAudioContext)();
  master=c.createGain();master.gain.value=.9;master.connect(c.destination);
  mus=c.createGain();mus.gain.value=.55;mus.connect(master);
  sfxg=c.createGain();sfxg.gain.value=.7;sfxg.connect(master);
  tsoiBus=c.createGain();tsoiBus.gain.value=.8;tsoiBus.connect(master);
  delay=c.createDelay(1);delay.delayTime.value=.32;
  const fb=c.createGain();fb.gain.value=.4;delay.connect(fb);fb.connect(delay);
  const dg=c.createGain();dg.gain.value=.45;delay.connect(dg);dg.connect(mus);
  noiseBuf=c.createBuffer(1,c.sampleRate,c.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  c.resume();
};
A.toggle=()=>{A.muted=!A.muted;if(master)master.gain.value=A.muted?0:.9;if(tAudio)tAudio.muted=A.muted;return A.muted};
function tone(f,t,d,type,v,dest,send,f2){
  const c=A.ctx,o=c.createOscillator(),g=c.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(dest);if(send)g.connect(delay);o.start(t);o.stop(t+d+.05);
}
function noise(t,d,v,fc,dest){
  const c=A.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  s.buffer=noiseBuf;s.loop=true;f.type='lowpass';f.frequency.value=fc;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  s.connect(f);f.connect(g);g.connect(dest||sfxg);s.start(t);s.stop(t+d+.05);
}
const ok=()=>A.ctx&&!A.muted;
const b=(f,d,type='square',v=.1,dl=0,f2)=>{if(!ok())return;tone(f,A.ctx.currentTime+dl,d,type,v,sfxg,0,f2)};
const n=(d,v,fc,dl=0)=>{if(!ok())return;noise(A.ctx.currentTime+dl,d,v,fc)};
const S=A.sfx={
  click:()=>b(660,.05,'square',.07),
  tick:()=>b(1200+Math.random()*500,.02,'square',.02),
  ok:()=>{b(660,.08,'square',.09);b(990,.14,'square',.09,.08)},
  bad:()=>b(200,.3,'sawtooth',.12,0,90),
  snip:()=>{n(.08,.35,5000);b(1500,.05,'square',.08)},
  boom:()=>{n(1.2,.7,900);b(90,.8,'sine',.6,0,30);b(60,1,'sawtooth',.2,.05,25)},
  win:()=>[523,659,784,1047,1319].forEach((f,i)=>b(f,.22,'square',.09,i*.1)),
  rewind:()=>{b(2200,1.8,'sawtooth',.07,0,180);n(1.8,.12,3000);for(let i=0;i<8;i++)b(900-i*70,.08,'square',.05,i*.2)},
  scan:()=>{b(300,.9,'sawtooth',.07,0,1200);b(1200,.9,'sawtooth',.05,.9,300)},
  alarm:()=>{b(880,.18,'square',.12);b(660,.18,'square',.12,.2);b(880,.18,'square',.12,.4)},
  catch:()=>{b(880,.07,'triangle',.14);b(1320,.1,'triangle',.12,.06)},
  hit:()=>{n(.25,.4,1200);b(140,.25,'sawtooth',.14,0,60)},
  jump:()=>b(260,.18,'square',.07,0,620),
  unlock:()=>{for(let i=0;i<6;i++)b(300+i*90,.1,'square',.07,i*.12);n(.6,.3,2500,.5)},
  glitch:()=>{for(let i=0;i<14;i++)b(100+Math.random()*1800,.05,'square',.08,i*.045);n(.6,.4,6000)}
};
A.tick=S.tick;A.click=S.click;
const CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]];
const PAT=[0,1,2,1,2,1,0,2,1,2,1,0,2,1,2,1];
function sched(){
  const c=A.ctx;
  while(nextT<c.currentTime+.2){
    const bar=Math.floor(step/16)%4,s=step%16,ch=CH[bar],t=nextT;
    const nt=ch[PAT[s]]+(s%8<4?24:12);
    tone(mid(nt),t,.28,'square',.035,mus,1);
    if(s%4===0)tone(mid(ch[0]-12),t,.5,'sine',.3,mus,0);
    if(s===0||s===8)tone(mid(ch[0]-24),t,.9,'triangle',.25,mus,0,mid(ch[0]-25));
    if(inten>=1&&s%2===1)noise(t,.05,.05,9000,mus);
    if(inten>=2&&s%4===2)tone(120,t,.12,'sine',.28,mus,0,45);
    if(Math.random()<.07)tone(mid(84+(Math.random()*12|0)),t,.1,'square',.02,mus,1);
    nextT+=60/bpm/4;step++;
  }
}
A.startMatrix=()=>{
  if(running||!A.ctx)return;running=true;const c=A.ctx;
  mus.gain.cancelScheduledValues(0);mus.gain.setValueAtTime(.55,c.currentTime);
  [55,55.4,82.5].forEach((f,i)=>{
    const o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();
    o.type='sawtooth';o.frequency.value=f;lp.type='lowpass';lp.frequency.value=220;g.gain.value=i===2?.015:.03;
    const l=c.createOscillator(),lg=c.createGain();l.frequency.value=.12+i*.05;lg.gain.value=90;l.connect(lg);lg.connect(lp.frequency);l.start();
    o.connect(lp);lp.connect(g);g.connect(mus);o.start();drone.push(o,l);
  });
  nextT=c.currentTime+.1;step=0;iv=setInterval(sched,25);
};
A.setIntensity=i=>{inten=i;bpm=92+i*14};
A.stopMatrix=(sec=2)=>{
  if(!running)return;running=false;clearInterval(iv);const c=A.ctx;
  mus.gain.cancelScheduledValues(c.currentTime);mus.gain.setValueAtTime(mus.gain.value,c.currentTime);mus.gain.linearRampToValueAtTime(0,c.currentTime+sec);
  setTimeout(()=>{drone.forEach(o=>{try{o.stop()}catch(e){}});drone=[]},sec*1000+100);
};
/* «Спокойная ночь»: если рядом лежит audio/tsoi.mp3 — играет он (через JS),
   иначе — нежная синтезированная колыбельная в похожем настроении */
A.playTsoi=()=>{
  if(!A.ctx)return;
  let started=false;
  const fb=()=>{if(started)return;started=true;lullaby()};
  try{
    tAudio=new Audio('audio/tsoi.mp3');tAudio.loop=true;tAudio.volume=.85;tAudio.muted=A.muted;
    tAudio.addEventListener('error',fb);
    tAudio.addEventListener('playing',()=>{started=true});
    const p=tAudio.play();if(p&&p.catch)p.catch(fb);
  }catch(e){fb()}
};
function lullaby(){
  const c=A.ctx,q=60/64,prog=[[57,60,64,69],[55,59,62,67],[53,57,60,65],[52,56,59,64]];
  const mel=[76,72,74,72,71,67,71,74,72,69,72,76,75,71,68,71];
  let b0=c.currentTime+.2,bar=0;
  const bell=(m,t,d,v)=>{tone(mid(m),t,d,'sine',v,tsoiBus,0);tone(mid(m+12),t,d*.6,'triangle',v*.3,tsoiBus,0)};
  const play=()=>{
    while(b0<c.currentTime+1.5){
      const ch=prog[bar%4];
      tone(mid(ch[0]-24),b0,q*3.8,'triangle',.2,tsoiBus,0);
      [0,1,2,3,2,1,2,3].forEach((k,i)=>bell(ch[k],b0+i*q/2,1.4,.09));
      [0,1,2,3].forEach(i=>bell(mel[(bar%4)*4+i],b0+i*q,1.8,.12));
      b0+=q*4;bar++;
    }
  };
  play();tIv=setInterval(play,500);
}
})();
