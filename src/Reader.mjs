// @ts-check
/** @namespace TeqFw_Cfg_Reader @description Synchronous detached namespace projection over Store. */

export default class Reader { constructor({error,key,raw,store}){this.get=(namespace)=>{key.assertNamespace(namespace);const snapshot=store.getSnapshot();const fragment={};for(const name of Object.keys(snapshot)){const parsed=key.parse(name);if(parsed.namespace===namespace)Object.defineProperty(fragment,parsed.parameter,{value:raw.copy(snapshot[name]),enumerable:true,writable:true,configurable:true});}return fragment;};} }
export const __deps__=Object.freeze({default:Object.freeze({error:'TeqFw_Cfg_Error$',key:'TeqFw_Cfg_Key$',raw:'TeqFw_Cfg_Raw$',store:'TeqFw_Cfg_Store$'})});
