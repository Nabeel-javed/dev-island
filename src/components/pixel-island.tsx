'use client';
import {useEffect,useRef} from 'react';
import type PhaserType from 'phaser';
import {Island, PaletteId,AvatarId,PLOTS} from '@/lib/island';
import {H,W,paintIsland,point} from '@/lib/pixel-art';
import {Controller} from './use-controller';
export type SceneProps={island:Island;palette:PaletteId;avatar:AvatarId;controller:React.RefObject<Controller>;onSelect:(index:number)=>void;reducedMotion:boolean;onReady:()=>void};
export default function PixelIsland(props:SceneProps){const host=useRef<HTMLDivElement>(null);const latest=useRef(props);latest.current=props;
  useEffect(()=>{let cancelled=false;let game:PhaserType.Game|undefined;
    import('phaser').then(({default:Phaser})=>{if(cancelled||!host.current)return;
      class Village extends Phaser.Scene {texture!:PhaserType.Textures.CanvasTexture;
        create(){this.texture=this.textures.createCanvas('island',W,H)!;this.add.image(0,0,'island').setOrigin(0);this.input.on('pointerdown',(pointer:PhaserType.Input.Pointer)=>{const index=PLOTS.slice(0,latest.current.island.projects.length).findIndex(p=>{const q=point(p.x,p.y);return Math.abs(pointer.x-q.x)<33&&pointer.y>q.y-49&&pointer.y<q.y+43;});if(index>=0)latest.current.onSelect(index);});latest.current.onReady();}
        update(time:number,delta:number){if(!this.texture)return;const p=latest.current;p.controller.current.step(delta/1000);paintIsland(this.texture.context,p.island,p.palette,p.avatar,p.controller.current,p.reducedMotion?0:time);this.texture.refresh();}
      }
      game=new Phaser.Game({type:Phaser.AUTO,parent:host.current,width:W,height:H,backgroundColor:'#b6d8d4',pixelArt:true,antialias:false,scene:Village,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{preserveDrawingBuffer:true},audio:{noAudio:true},banner:false});
    }).catch(()=>{if(host.current)host.current.textContent='The pixel scene could not load. Your projects are available below.';});
    return()=>{cancelled=true;game?.destroy(true);};},[]);
  return <div ref={host} className="scene-render pixel-render" aria-label="Playable pixel island" role="img"/>;
}
