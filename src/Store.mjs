// @ts-check
/** @namespace TeqFw_Cfg_Store @description Internal immutable snapshot state owner. */

export default class Store { constructor({error,raw}){let state='empty',snapshot,failure;Object.defineProperty(this,'state',{get:()=>state});this.getState=()=>state;this.beginLoading=()=>{if(state!=='empty')throw error.create('CFG_ILLEGAL_STATE',{state});state='loading';};this.publish=(value)=>{if(state!=='loading')throw error.create('CFG_ILLEGAL_STATE',{state});snapshot=raw.copySnapshot(value);raw.deepFreeze(snapshot);state='ready';};this.fail=(value)=>{if(state!=='loading')throw error.create('CFG_ILLEGAL_STATE',{state});failure=value;state='failed';};this.getSnapshot=()=>{if(state==='empty')throw error.create('CFG_STORE_EMPTY');if(state==='loading')throw error.create('CFG_STORE_LOADING');if(state==='failed')throw failure;return snapshot;};this.getFailure=()=>failure;} }
export const __deps__=Object.freeze({default:Object.freeze({error:'TeqFw_Cfg_Error$',raw:'TeqFw_Cfg_Raw$'})});
