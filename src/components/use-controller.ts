'use client';
import {useEffect,useRef} from 'react';
import {advance, PLOTS} from '@/lib/island';
export type Controller={x:number;y:number;dx:number;dy:number;moving:boolean;paused:boolean;step:(dt:number)=>void;keys:Set<string>};
export function useController(count:number, onSelect:(index:number)=>void, paused:boolean) {
  const callback=useRef(onSelect);callback.current=onSelect;
  const controller=useRef<Controller>({x:0,y:6.1,dx:0,dy:0,moving:false,paused:false,step:()=>{},keys:new Set()});
  controller.current.paused=paused;
  controller.current.step=(dt)=>{const c=controller.current; if(c.paused){c.moving=false;return;} const dx=Number(c.keys.has('d')||c.keys.has('arrowright'))-Number(c.keys.has('a')||c.keys.has('arrowleft'));const dy=Number(c.keys.has('s')||c.keys.has('arrowdown'))-Number(c.keys.has('w')||c.keys.has('arrowup'));const p=advance(c,dx,dy,dt,count);c.moving=p.x!==c.x||p.y!==c.y;if(c.moving){c.dx=dx;c.dy=dy;}c.x=p.x;c.y=p.y;};
  useEffect(()=>{const c=controller.current;
    const down=(e:KeyboardEvent)=>{if(e.target instanceof HTMLElement && (e.target.closest('input,textarea,select,dialog')||e.metaKey||e.ctrlKey||e.altKey))return;
      const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){if(!c.paused)e.preventDefault();c.keys.add(k);}
      if(k==='e'&&!c.paused){const i=PLOTS.slice(0,count).findIndex(p=>Math.hypot(p.x-c.x,p.y+1-c.y)<2.2);if(i>=0)callback.current(i);}
    };const up=(e:KeyboardEvent)=>c.keys.delete(e.key.toLowerCase());const clear=()=>c.keys.clear();
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
    return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);clear();};
  },[count]);return controller;
}
