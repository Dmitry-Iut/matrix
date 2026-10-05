/* Уровень 2: 3D-шкаф (WebGL / three.js). Крутить предметы можно только пока сканер зелёный */
G.levels[2]=(root,api)=>{
  if(!window.THREE){
    root.innerHTML='<div class="err">Не загрузился three.js (WebGL).<br><br>Положи файл three.min.js (r128) в папку js/ и обнови страницу.</div>';return;
  }
  const W=root.clientWidth,H=root.clientHeight;
  root.innerHTML='<div class="l2"><div class="l2hint">Найди предмет с кодом. Тапни предмет и крути пальцем. Когда сканер МИГАЕТ — замри!</div><div class="scan"><i class="led"></i><span>СКАНЕР</span></div><div class="beam"></div></div>';
  const wrap=root.querySelector('.l2'),scan=wrap.querySelector('.scan'),beam=wrap.querySelector('.beam');
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){root.innerHTML='<div class="err">На этом устройстве не работает WebGL.</div>';return}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(W,H);wrap.prepend(renderer.domElement);
  const scene=new THREE.Scene(),fov=42,aspect=W/H,dist=5.2/(2*Math.tan(fov*Math.PI/360)*aspect);
  const cam=new THREE.PerspectiveCamera(fov,aspect,.1,60);cam.position.set(.3,.9,dist);cam.lookAt(.3,.9,0);
  scene.add(new THREE.AmbientLight(0x3aa060,1));
  const pl=new THREE.PointLight(0x88ffbb,1.3,40);pl.position.set(0,3,8);scene.add(pl);
  const mat=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.55,metalness:.25},o||{}));
  const wood=mat(0x0e3d22,{emissive:0x041a0c});
  const add=(w,h,d,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wood);m.position.set(x,y,z);scene.add(m)};
  const ys=[-2.6,-.9,.8,2.5],xs=[-1.4,0,1.4];
  add(4.6,6.9,.1,0,.8,-.75);add(.15,6.9,1.6,-2.3,.8,0);add(.15,6.9,1.6,2.3,.8,0);add(4.6,.15,1.6,0,4.25,0);
  ys.forEach(y=>add(4.6,.15,1.6,0,y-.45,0));
  const HEX=['7F','A3','E1','3C','9B','00','F4','1D','B7','62','5A','C8','2E','D9'];
  const faceTex=txt=>{
    const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
    x.fillStyle='#021208';x.fillRect(0,0,128,128);x.strokeStyle='#00ff66';x.lineWidth=6;x.strokeRect(5,5,118,118);
    for(let i=0;i<30;i++){x.fillStyle='rgba(0,255,102,.18)';x.fillRect((Math.random()*14|0)*8,(Math.random()*14|0)*8,8,8)}
    x.fillStyle='#00ff66';x.font='bold 54px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,68);
    const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;return t;
  };
  const items=[];
  const codeCube=Math.random()*5|0,codeFace=Math.random()*6|0;
  const shapes=[
    ()=>new THREE.SphereGeometry(.45,14,10),()=>new THREE.ConeGeometry(.45,.9,6),()=>new THREE.CylinderGeometry(.35,.35,.9,10),
    ()=>new THREE.TorusGeometry(.35,.14,8,14),()=>new THREE.OctahedronGeometry(.5),()=>new THREE.DodecahedronGeometry(.48),()=>new THREE.TetrahedronGeometry(.6)
  ];
  const cols=[0x00ff66,0x33b5ff,0xffd83a,0xff5577,0xaa66ff,0x66ffe0,0xff9933];
  const list=[];
  for(let i=0;i<5;i++)list.push({cube:i});
  for(let i=0;i<7;i++)list.push({shape:i});
  list.sort(()=>Math.random()-.5);
  let hexPool=[...HEX].sort(()=>Math.random()-.5),hp=0;
  list.forEach((it,k)=>{
    let mesh,h=.9;
    if(it.cube!==undefined){
      const s=.72+Math.random()*.2;h=s;
      const mats=[0,1,2,3,4,5].map(f=>new THREE.MeshStandardMaterial({map:faceTex(it.cube===codeCube&&f===codeFace?'04':hexPool[hp++%hexPool.length]),roughness:.5}));
      mesh=new THREE.Mesh(new THREE.BoxGeometry(s,s,s),mats);
      if(it.cube===codeCube)G._code2=mesh,mesh.userData.code=true;
    }else{
      mesh=new THREE.Mesh(shapes[it.shape](),mat(cols[it.shape],{emissive:cols[it.shape],emissiveIntensity:.12,flatShading:true}));
    }
    const r=Math.floor(k/3),c=k%3;
    mesh.position.set(xs[c],ys[r]+.08+h/2,0);mesh.rotation.set(Math.random()*6,Math.random()*6,0);
    const e=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.15,1.15,1.15)),new THREE.LineBasicMaterial({color:0x00ff66}));
    e.visible=false;mesh.add(e);mesh.userData.edge=e;mesh.userData.base=mesh.position.clone();
    scene.add(mesh);items.push(mesh);
  });
  const codeMesh=items.find(m=>m.userData.code);
  const NORM=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(a=>new THREE.Vector3(...a));
  let st='green',tt=3+Math.random()*2,grace=0,sel=null,down=false,lx=0,ly=0,done=false,hold=0,raf;
  const ray=new THREE.Raycaster(),mv=new THREE.Vector2();
  const select=m=>{if(sel){sel.scale.setScalar(1);sel.userData.edge.visible=false}sel=m;if(m){m.scale.setScalar(1.25);m.userData.edge.visible=true;A.sfx.click()}};
  const lose=async()=>{
    if(done)return;done=true;A.sfx.alarm();wrap.insertAdjacentHTML('beforeend','<div class="flash"></div>');
    await G.sleep(900);api.fail('Сканер засёк движение!');
  };
  const el=renderer.domElement;
  const pd=e=>{
    if(done)return;
    if(st==='scan'&&grace<=0){lose();return}
    down=true;lx=e.clientX;ly=e.clientY;
    const r=el.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);
    ray.setFromCamera(mv,cam);const h=ray.intersectObjects(items,false)[0];
    if(h)select(h.object);else if(sel&&Math.abs(e.clientX-lx)>999)select(null);
  };
  const pm=e=>{
    if(done||!down)return;
    const dx=e.clientX-lx,dy=e.clientY-ly;if(Math.abs(dx)+Math.abs(dy)<1)return;
    if(st==='scan'&&grace<=0){lose();return}
    lx=e.clientX;ly=e.clientY;
    if(sel){
      const qx=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),dx*.012);
      const qy=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),dy*.012);
      sel.quaternion.premultiply(qx).premultiply(qy);
    }
  };
  const pu=()=>{down=false};
  el.addEventListener('pointerdown',pd);addEventListener('pointermove',pm);addEventListener('pointerup',pu);addEventListener('pointercancel',pu);
  let last=performance.now();
  const loop=now=>{
    raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;
    if(!done){
      tt-=dt;
      if(st==='green'&&tt<=0){st='scan';tt=2;grace=.45;scan.classList.add('on');beam.classList.add('on');A.sfx.scan()}
      else if(st==='scan'){grace-=dt;if(tt<=0){st='green';tt=3+Math.random()*2.5;scan.classList.remove('on');beam.classList.remove('on')}}
      if(sel&&sel===codeMesh&&st==='green'){
        const n=NORM[codeFace].clone().applyQuaternion(sel.quaternion);
        hold=n.z>.93?hold+dt:0;
        if(hold>.7)found();
      }else hold=0;
    }
    renderer.render(scene,cam);
  };
  raf=requestAnimationFrame(loop);
  const found=async()=>{
    if(done)return;done=true;A.sfx.win();beam.classList.remove('on');
    wrap.insertAdjacentHTML('beforeend','<div class="big">КОД НАЙДЕН<b>04</b></div>');
    await G.sleep(1800);await G.say('Дима','Нашла! Вторая часть кода — 04.');api.win();
  };
  return()=>{done=true;cancelAnimationFrame(raf);removeEventListener('pointermove',pm);removeEventListener('pointerup',pu);removeEventListener('pointercancel',pu);renderer.dispose()};
};
