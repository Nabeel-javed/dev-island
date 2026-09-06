import {AVATARS, AvatarId, Island, PALETTES, PaletteId, PLOTS, TREES, seed} from './island';
export const W=600,H=400;
export const point=(x:number,y:number)=>({x:300+x*25,y:175+y*20});
export function paintIsland(ctx:CanvasRenderingContext2D,island:Island,palette:PaletteId,avatar:AvatarId,player:{x:number;y:number;moving:boolean},time:number) {
  const c=ctx;const p=PALETTES[palette];const t=time/1000;
  c.imageSmoothingEnabled=false;
  const rect=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const ellipse=(x:number,y:number,rx:number,ry:number,color:string)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  const text=(s:string,x:number,y:number,size=6,color='#4b5747')=>{c.font=`${size}px monospace`;c.textAlign='center';c.fillStyle=color;c.fillText(s,x,y);};
  const coast=(rx:number,ry:number,yoff:number,color:string)=>{for(let y=-ry;y<=ry;y+=3){const w=Math.sqrt(Math.max(0,1-y*y/(ry*ry)))*rx;const wobble=Math.sin(y*.12)*3;rect(300-Math.round(w/3)*3+wobble,175+y+yoff,Math.round(w/3)*6,3,color);}};
  rect(0,0,W,H,p.water);
  for(let i=0;i<95;i++){const x=seed('wave'+i)%600,y=seed('sea'+i)%400;c.globalAlpha=.17+Math.sin(t*.7+i)*.07;rect(x+Math.sin(t*.2+i)*3,y,5+i%8,1,'#ffffff');if(i%3===0)rect(x+3,y+3,6,1,p.deep);}c.globalAlpha=1;
  coast(256,154,5,p.deep);coast(250,148,0,'#d4e5d1');coast(237,140,0,'#efe0b3');coast(223,126,-4,'#718e5c');coast(223,126,-9,p.grass);coast(214,117,-12,p.light);
  for(let i=0;i<370;i++){const x=seed('groundx'+i)%430-215,y=seed('groundy'+i)%228-114;if(x*x/46225+y*y/12996>.9)continue;rect(300+x,163+y,2,1,i%3===0?p.grass:'#bbce91');}
  // Village lanes. Paths meet the doors and the welcome dock.
  rect(289,85,22,235,'#e0cd9d');rect(160,160,280,17,'#e0cd9d');rect(160,242,280,17,'#e0cd9d');
  for(const plot of PLOTS.slice(0,island.projects.length)){const q=point(plot.x,plot.y);rect(q.x-9,q.y+16,18,(q.y<150?166:250)-q.y-16,'#e0cd9d');}
  for(let i=0;i<75;i++){const x=294+seed('path'+i)%12,y=86+seed('pathy'+i)%228;rect(x,y,2,1,'#cfbc91');}
  // Small wooden jetty, mooring posts and a boat.
  rect(282,292,36,69,'#775d45');rect(285,292,30,67,'#b18c5d');for(let y=294;y<358;y+=6){rect(285,y,30,1,'#775d45');rect(287,y+2,25,1,'#c5a475');}
  for(const y of [300,328,356]){rect(279,y,5,9,'#795f49');rect(279,y,5,2,'#dac69b');rect(316,y,5,9,'#795f49');rect(316,y,5,2,'#dac69b');}
  const boatY=342+Math.sin(t)*1.5;rect(337,boatY,13,20,'#e9d7a8');rect(340,boatY+3,7,12,'#9e7753');rect(342,boatY-11,2,24,'#725b46');rect(344,boatY-10,10,9,'#fff4d6');rect(334,boatY+6,3,9,'#e9d7a8');
  // Contribution garden. Every cell corresponds to a day in the shared model.
  rect(348,266,93,38,'#997c57');rect(350,268,89,34,'#b29465');
  island.contributions.slice(-371).forEach((day,i)=>{const week=Math.floor(i/7),row=i%7;rect(353+week*1.55,271+row*3.5,1.4,2.5,day.count===0?'#baac7d':day.count<4?'#8fa765':day.count<8?'#5f8b56':'#376b4c');});
  text(island.contributions.length?'CONTRIBUTION GARDEN':'GARDEN AT REST',394,313,5);
  // Picnic spot and a quiet campfire.
  rect(203,277,30,19,'#efe1b5');for(let x=203;x<233;x+=8)rect(x,277,4,19,'#b98870');for(let y=277;y<296;y+=8)rect(203,y,30,3,'#cbad8b');rect(211,281,7,5,'#fcf4d9');rect(220,288,5,4,'#789477');
  // Wildflowers, shells and little stones.
  for(let i=0;i<65;i++){const wx=(seed('fx'+i)%170-85)/10,wy=(seed('fy'+i)%110-55)/10;if(wx*wx/65+wy*wy/32>.95||Math.abs(wx)<.7||PLOTS.some(b=>Math.abs(b.x-wx)<1.6&&Math.abs(b.y-wy)<2))continue;const q=point(wx,wy);rect(q.x,q.y,1,4,'#6f935d');rect(q.x-1,q.y,3,2,i%3===0?'#f5d58e':i%3===1?'#f6efce':'#d8a59b');}
  function tree(x:number,y:number,i:number){const q=point(x,y),bob=Math.round(Math.sin(t*.8+i)*.5);ellipse(q.x+3,q.y+2,13,4,'#77986c');rect(q.x-2,q.y-13,5,16,'#8c7650');rect(q.x+1,q.y-11,2,13,'#6e6948');const layers=[{y:-35,w:10},{y:-31,w:19},{y:-26,w:26},{y:-18,w:23},{y:-12,w:14}];for(const l of layers){rect(q.x-l.w/2+bob,q.y+l.y,l.w,8,p.tree);rect(q.x-l.w/2+bob,q.y+l.y,l.w*.55,5,'#69966b');}rect(q.x-6+bob,q.y-29,5,2,'#8cad77');if(i%4===0){rect(q.x+5,q.y-20,3,3,'#d5a15d');rect(q.x-5,q.y-14,3,3,'#d5a15d');}}
  function house(index:number){const q=point(PLOTS[index].x,PLOTS[index].y);const x=q.x,y=q.y;const project=island.projects[index];const colors=[p.roof,'#668b86','#839465','#bf9b62','#867b96','#8a9da3'];const roof=colors[index];
    ellipse(x+5,y+20,32,7,'#829d70');rect(x-25,y-16,50,37,'#c9b589');rect(x-23,y-17,43,36,'#f2e7c5');rect(x+20,y-17,5,38,'#d1c099');
    if(index===4){rect(x-26,y-30,52,13,roof);rect(x-21,y-38,42,8,roof);rect(x-15,y-43,30,5,roof);rect(x-10,y-46,20,3,roof);}
    else {for(let i=0;i<12;i++){const w=8+i*4.4;rect(x-w/2,y-47+i*2.7,w,3,roof);if(i%3===0)rect(x-w/2,y-47+i*2.7,w,1,index===0?'#d58b68':'#a1b2a0');}}
    rect(x-29,y-17,58,4,'#6b6950');rect(x-26,y-17,52,2,roof);
    for(const wx of [-16,14]){rect(x+wx-4,y-8,9,12,'#b39870');rect(x+wx-3,y-7,7,9,'#6f9795');rect(x+wx,y-7,1,10,'#f7efcc');rect(x+wx-3,y-3,7,1,'#f7efcc');rect(x+wx-5,y+5,11,2,'#9a825c');}
    rect(x-5,y+1,10,20,'#7b7158');rect(x-4,y+2,8,17,'#967f58');rect(x+2,y+11,1,2,'#e8c681');rect(x-7,y+20,14,3,'#c4b38b');
    if(index===2){rect(x-22,y-31,44,3,'#e8ddad');rect(x-15,y-34,3,19,'#d2c794');rect(x+12,y-34,3,19,'#d2c794');}
    else {rect(x+13,y-45,6,15,'#b6a789');rect(x+12,y-46,8,3,'#d8ca9d');c.globalAlpha=.4;rect(x+14+Math.sin(t+index)*2,y-54-(t*4%8),4,4,'#fff6df');c.globalAlpha=1;}
    rect(x-28,y+29,56,13,'#f8f0d8');rect(x-28,y+41,56,1,'#c1b490');text(project.name.length>16?project.name.slice(0,14)+'…':project.name,x,y+37,5.5);
    rect(x-23,y+15,7,7,'#9c7954');rect(x-25,y+11,11,5,p.tree);rect(x-21,y+9,3,3,'#ecc57c');
  }
  const objects=[...TREES.map((tr,i)=>({y:tr.y,draw:()=>tree(tr.x,tr.y,i)})),...island.projects.map((_,i)=>({y:PLOTS[i].y,draw:()=>house(i)})),{y:player.y,draw:()=>{const q=point(player.x,player.y),a=AVATARS.find(v=>v.id===avatar)!;const bob=player.moving?Math.sin(t*16):Math.sin(t*2)*.25;ellipse(q.x,q.y+2,6,2,'#80916c');rect(q.x-4,q.y-9+bob,8,9,a.color);rect(q.x-3,q.y-15+bob,6,7,a.skin);rect(q.x-4,q.y-18+bob,8,4,avatar==='astronaut'?'#ede7cf':'#594e42');if(avatar==='explorer'){rect(q.x-5,q.y-18+bob,10,3,'#d8bb80');rect(q.x-7,q.y-16+bob,14,2,'#b69562');}if(avatar==='sailor')rect(q.x-5,q.y-17+bob,10,3,'#eee4c8');rect(q.x-2,q.y-12+bob,1,1,'#3d493f');rect(q.x+2,q.y-12+bob,1,1,'#3d493f');rect(q.x-3,q.y,2,3+(player.moving?Math.sin(t*16)*2:0),'#485e58');rect(q.x+1,q.y,2,3-(player.moving?Math.sin(t*16)*2:0),'#485e58');}}];objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
  // Welcome board and a pennant at the jetty.
  rect(258,288,2,20,'#8d7350');rect(242,282,32,13,'#8f7959');rect(244,284,28,9,'#f1e4bc');text('WELCOME',258,290,4.5);rect(327,292,2,25,'#80765b');rect(329,292,13,8,p.roof);
  // Passing gulls and a compass in the sea.
  for(let i=0;i<3;i++){const x=75+i*15+Math.sin(t*.1)*10,y=57+i%2*6;rect(x,y,3,1,'#f9f6e9');rect(x+3,y+1,3,1,'#f9f6e9');rect(x+6,y,3,1,'#f9f6e9');}
  c.globalAlpha=.6;text('N',547,300,7,'#4d827c');rect(547,307,1,20,'#639a91');rect(538,317,19,1,'#639a91');rect(545,311,5,3,'#639a91');c.globalAlpha=1;
}
