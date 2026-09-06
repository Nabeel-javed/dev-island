'use client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import {useEffect,useMemo,useRef} from 'react';
import * as THREE from 'three';
import {AVATARS,PALETTES,PLOTS,TREES,seed} from '@/lib/island';
import {SceneProps} from './pixel-island';
const V=(x:number,y:number,z:number):[number,number,number]=>[x,y,z];
function Box({position,size,color,...rest}:{position:[number,number,number];size:[number,number,number];color:string;rotation?:[number,number,number]}) {return <mesh position={position} {...rest} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.85}/></mesh>}
function Tree({x,z,index,color,motion}:{x:number;z:number;index:number;color:string;motion:boolean}){const crown=useRef<THREE.Group>(null);useFrame(({clock})=>{if(crown.current&&motion)crown.current.rotation.z=Math.sin(clock.elapsedTime*.7+index)*.018;});return <group position={[x,.22,z]}><mesh position={[0,.6,0]} castShadow><cylinderGeometry args={[.12,.17,1.2,6]}/><meshStandardMaterial color="#90704e"/></mesh><group ref={crown}><mesh position={[0,1.55,0]} castShadow><icosahedronGeometry args={[.85,1]}/><meshStandardMaterial color={color} flatShading/></mesh><mesh position={[-.28,2.13,0]} castShadow><icosahedronGeometry args={[.65,1]}/><meshStandardMaterial color="#90ae78" flatShading/></mesh><mesh position={[.48,1.75,.15]} castShadow><icosahedronGeometry args={[.58,0]}/><meshStandardMaterial color={color} flatShading/></mesh></group></group>}
function House({index,props}:{index:number;props:SceneProps}){const p=PLOTS[index],project=props.island.projects[index];const colors=[PALETTES[props.palette].roof,'#6d9893','#91a275','#c2a576','#a294b1','#849fa9'];
 const roof=useMemo(()=>{const shape=new THREE.Shape();shape.moveTo(-1.3,0);shape.lineTo(0,1.05);shape.lineTo(1.3,0);shape.closePath();return new THREE.ExtrudeGeometry(shape,{depth:2.25,bevelEnabled:false});},[]);useEffect(()=>()=>roof.dispose(),[roof]);
 return <group position={[p.x,.22,p.y]} onClick={e=>{e.stopPropagation();props.onSelect(index);}} onPointerOver={()=>{document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='';}}>
   <Box position={[0,.06,0]} size={[2.65,.14,2.3]} color="#d6c79f"/>
   <Box position={[0,.9,0]} size={[2.2,1.7,1.9]} color="#f2e8ce"/>
   <mesh geometry={roof} position={[0,1.8,-1.125]} castShadow receiveShadow><meshStandardMaterial color={colors[index]} roughness={.9}/></mesh>
   <Box position={[.68,2.3,-.42]} size={[.27,.9,.3]} color="#c0ab91"/>
   <Box position={[.68,2.78,-.42]} size={[.36,.12,.39]} color="#e3d7bc"/>
   <Box position={[0,.53,.97]} size={[.44,1.04,.07]} color="#877557"/>
   <mesh position={[.12,.52,1.02]}><sphereGeometry args={[.035,6,6]}/><meshStandardMaterial color="#e5c384"/></mesh>
   {[-.73,.73].map(x=><group key={x}><Box position={[x,1.06,.976]} size={[.5,.62,.07]} color="#9cb9b4"/><Box position={[x,1.06,1.02]} size={[.035,.64,.04]} color="#f7efd9"/><Box position={[x,1.06,1.02]} size={[.52,.035,.04]} color="#f7efd9"/><Box position={[x,.71,1.02]} size={[.64,.08,.18]} color="#bca77e"/></group>)}
   <Box position={[1.12,1.04,0]} size={[.05,.57,.6]} color="#9cb9b4"/>
   <Box position={[1.15,1.04,0]} size={[.05,.59,.035]} color="#f2e8ce"/>
   <Box position={[0,.02,1.19]} size={[.68,.14,.35]} color="#c4b68f"/>
   <mesh position={[-1,.2,1.05]} castShadow><cylinderGeometry args={[.2,.15,.35,8]}/><meshStandardMaterial color="#b68a65"/></mesh><mesh position={[-1,.44,1.05]} castShadow><icosahedronGeometry args={[.25,1]}/><meshStandardMaterial color="#6a9366"/></mesh>
   <Html position={[0,3.35,0]} center zIndexRange={[15,0]}><button className="house-label" onClick={()=>props.onSelect(index)}>{project.name}</button></Html>
 </group>}
function Explorer({props}:{props:SceneProps}){const body=useRef<THREE.Group>(null),left=useRef<THREE.Mesh>(null),right=useRef<THREE.Mesh>(null);const avatar=AVATARS.find(a=>a.id===props.avatar)!;
 useFrame(({clock},dt)=>{const c=props.controller.current;c.step(dt);if(body.current){body.current.position.set(c.x,.26,c.y);if(c.moving)body.current.rotation.y=Math.atan2(c.dx,c.dy);body.current.position.y+=!props.reducedMotion&&c.moving?Math.abs(Math.sin(clock.elapsedTime*12))*.055:0;}if(left.current&&right.current){left.current.rotation.x=c.moving?Math.sin(clock.elapsedTime*12)*.45:0;right.current.rotation.x=-left.current.rotation.x;}});
 return <group ref={body} position={[0,.26,6.1]}>
  <mesh position={[-.105,.14,0]} ref={left} castShadow><boxGeometry args={[.15,.27,.2]}/><meshStandardMaterial color="#485b56"/></mesh><mesh position={[.105,.14,0]} ref={right} castShadow><boxGeometry args={[.15,.27,.2]}/><meshStandardMaterial color="#485b56"/></mesh>
  <Box position={[0,.43,0]} size={[.4,.4,.25]} color={avatar.color}/><Box position={[-.27,.4,0]} size={[.12,.32,.15]} color={avatar.skin}/><Box position={[.27,.4,0]} size={[.12,.32,.15]} color={avatar.skin}/>
  <mesh position={[0,.83,0]} castShadow><boxGeometry args={[.38,.38,.34]}/><meshStandardMaterial color={avatar.skin}/></mesh>
  <Box position={[-.08,.84,.178]} size={[.035,.04,.02]} color="#334a42"/><Box position={[.08,.84,.178]} size={[.035,.04,.02]} color="#334a42"/>
  <mesh position={[0,1.04,0]} castShadow><cylinderGeometry args={[.28,.3,.12,10]}/><meshStandardMaterial color={props.avatar==='sailor'?'#f4eddb':props.avatar==='astronaut'?'#e5e2d6':'#c5a46e'}/></mesh>
  <mesh position={[0,1.14,0]} castShadow><cylinderGeometry args={[.18,.22,.16,10]}/><meshStandardMaterial color={props.avatar==='sailor'?'#f4eddb':props.avatar==='astronaut'?'#e5e2d6':'#d9b97b'}/></mesh>
 </group>}
function FitCamera(){const {camera,size}=useThree();useEffect(()=>{if(camera instanceof THREE.OrthographicCamera){camera.zoom=Math.min(size.width/25.5,size.height/22);camera.lookAt(0,0,1);camera.updateProjectionMatrix();}},[camera,size]);return null;}
function Boat({motion}:{motion:boolean}){const ref=useRef<THREE.Group>(null);useFrame(({clock})=>{if(ref.current&&motion){ref.current.position.y=-.5+Math.sin(clock.elapsedTime)*.05;ref.current.rotation.z=Math.sin(clock.elapsedTime*.7)*.04;}});return <group ref={ref} position={[1.5,-.5,7.9]}><mesh scale={[.4,.24,.85]} castShadow><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color="#a38258"/></mesh><Box position={[0,.15,0]} size={[.55,.1,1.1]} color="#eddbad"/><Box position={[0,.85,0]} size={[.045,1.4,.045]} color="#886e4e"/><mesh position={[.26,1,0]}><planeGeometry args={[.5,.7]}/><meshStandardMaterial color="#fff3d6" side={THREE.DoubleSide}/></mesh></group>}
function World(props:SceneProps){const p=PALETTES[props.palette];const ready=useRef(false);useFrame(()=>{if(!ready.current){ready.current=true;props.onReady();}});useEffect(()=>()=>{document.body.style.cursor='';},[]);
 return <><color attach="background" args={[p.water]}/><fog attach="fog" args={[p.water,40,85]}/><ambientLight intensity={1.3}/><hemisphereLight args={['#fff5dd','#a0bba5',1.8]}/><directionalLight position={[-9,18,10]} intensity={2.5} color="#fff1cf" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-normalBias={.04}/><FitCamera/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.6,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color={p.water} roughness={.8}/></mesh>
 <mesh position={[0,-.53,0]} scale={[1,.02,.72]}><cylinderGeometry args={[10.9,10.9,1,80]}/><meshStandardMaterial color={p.deep}/></mesh>
 <mesh position={[0,-.44,0]} scale={[1,.03,.72]}><cylinderGeometry args={[10.45,10.45,1,80]}/><meshStandardMaterial color="#d1e2cd"/></mesh>
 <mesh position={[0,-.15,0]} scale={[1,1,.72]} receiveShadow><cylinderGeometry args={[9.6,10.1,.55,64]}/><meshStandardMaterial color="#e8d5a8"/></mesh>
 <mesh position={[0,.09,-.15]} scale={[1,1,.72]} receiveShadow><cylinderGeometry args={[9.15,9.4,.3,64]}/><meshStandardMaterial color={p.grass}/></mesh>
 <Box position={[0,.25,1.5]} size={[.95,.025,10.7]} color="#e0ceaa"/>
 <Box position={[0,.252,-1.5]} size={[11,.027,.72]} color="#e0ceaa"/><Box position={[0,.252,3.15]} size={[11,.027,.72]} color="#e0ceaa"/>
 {PLOTS.slice(0,props.island.projects.length).map((plot,i)=><Box key={'lane'+i} position={[plot.x,.252,plot.y+1.55]} size={[.7,.025,1.7]} color="#e0ceaa"/>)}
 {TREES.map((t,i)=><Tree key={i} x={t.x} z={t.y} index={i} color={p.tree} motion={!props.reducedMotion}/>)}
 {props.island.projects.map((project,index)=><House key={project.id} index={index} props={props}/>)}
 <Box position={[0,.15,7.3]} size={[1.5,.18,3.7]} color="#a5865d"/>{Array.from({length:17},(_,i)=><Box key={'plank'+i} position={[0,.26,5.55+i*.21]} size={[1.47,.035,.025]} color="#785f43"/>)}
 {[5.6,7.2,8.95].flatMap(z=>[-.82,.82].map(x=><Box key={`${x},${z}`} position={[x,.4,z]} size={[.12,.7,.12]} color="#96774e"/>))}
 <Box position={[-1.6,.7,5.8]} size={[.07,1,.07]} color="#8d7454"/><Box position={[-1.6,1.1,5.8]} size={[1.3,.5,.09]} color="#e8d6aa"/>
 <Html position={[-1.6,1.15,5.85]} center zIndexRange={[14,0]}><span className="welcome-sign">WELCOME</span></Html>
 <Box position={[3.5,.27,4.65]} size={[3.6,.07,1.5]} color="#a88b60"/>
 {props.island.contributions.slice(-371).map((d,i)=><Box key={d.date} position={[1.83+Math.floor(i/7)*.064,.33+(d.count?Math.min(d.count,12)*.011:0),4.05+i%7*.18]} size={[.05,.07+(d.count?Math.min(d.count,12)*.022:0),.13]} color={d.count===0?'#c0b28c':d.count<4?'#a0b979':d.count<8?'#6e985c':'#3f7453'}/>)}
 <Html position={[3.5,.5,5.6]} center zIndexRange={[14,0]}><span className="garden-label">CONTRIBUTION GARDEN</span></Html>
 <Box position={[-3.4,.27,4.5]} size={[1.6,.035,1.1]} color="#dfbfa1"/><Box position={[-3.4,.3,4.5]} size={[.4,.06,.32]} color="#f5edcf"/>
 {Array.from({length:30},(_,i)=>{const x=(seed('flowerx'+i)%160-80)/10,z=(seed('flowerz'+i)%100-50)/10;if(Math.abs(x)<1.5||PLOTS.some(p=>Math.abs(p.x-x)<1.6&&Math.abs(p.y-z)<1.8))return null;return <group key={'fl'+i} position={[x,.27,z]}><Box position={[0,.12,0]} size={[.035,.24,.035]} color="#6b8852"/><mesh position={[0,.27,0]}><icosahedronGeometry args={[.1,0]}/><meshStandardMaterial color={i%2?'#f2d28b':'#eedfcf'}/></mesh></group>;})}
 <Boat motion={!props.reducedMotion}/><Explorer props={props}/>
 </>;
}
export default function ThreeIsland(props:SceneProps){return <div className="scene-render three-render" role="img" aria-label="Playable miniature 3D island"><Canvas shadows orthographic camera={{position:[14,18,22],zoom:28,near:.1,far:150}} dpr={[1,1.5]} gl={{antialias:true,preserveDrawingBuffer:true}} fallback={<p>3D graphics are unavailable. Choose Pixel island or explore the project list below.</p>}><World {...props}/></Canvas></div>}
