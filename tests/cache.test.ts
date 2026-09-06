import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createIslandCache,FRESH_MS,MemoryStore,STALE_MS} from '../src/lib/cache';
import {DEMO} from '../src/lib/demo';
test('coalesces simultaneous misses and normalizes username casing',async()=>{let calls=0;const load=createIslandCache(new MemoryStore(),async()=>{calls++;await new Promise(r=>setTimeout(r,5));return DEMO;});const values=await Promise.all([load('DEMO'),load('demo'),load('Demo')]);assert.equal(calls,1);assert.ok(values.every(v=>v.login==='demo'));await load('demo');assert.equal(calls,1);});
test('refreshes stale data, serves stale on outage, expires old snapshots',async()=>{let now=0,fail=false,calls=0;const load=createIslandCache(new MemoryStore(),async()=>{calls++;if(fail)throw new Error('outage');return DEMO;},()=>now);await load('demo');now=FRESH_MS+1;await load('demo');assert.equal(calls,2);fail=true;now+=FRESH_MS+1;assert.match((await load('demo')).notice!,/saved public snapshot/);now+=STALE_MS;await assert.rejects(load('demo'));});
test('does not serve a deleted profile from stale cache',async()=>{let now=0;const load=createIslandCache(new MemoryStore(),async()=>{if(now)throw Object.assign(new Error('gone'),{status:404});return DEMO;},()=>now);await load('demo');now=FRESH_MS+1;await assert.rejects(load('demo'));});
