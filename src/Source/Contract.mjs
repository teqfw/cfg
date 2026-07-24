// @ts-check
/** @namespace TeqFw_Cfg_Source_Contract @description Shared Source validation and descriptor service. */
const ID=/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/;
export default class Contract { /**
 * @param {object} deps
 * @param {object} deps.error
 */
constructor({error}){/**
 * @param {any} id
 * @returns {any}
 */
this.assertId=(id)=>{if(typeof id!=='string'||!ID.test(id))throw error.create('CFG_INVALID_SOURCE_ID');return id;};/**
 * @param {any} field
 * @returns {any}
 */
this.invalidSource=(field)=>{throw error.create('CFG_INVALID_SOURCE',{field});};/**
 * @param {any} value
 * @param {any} field
 * @returns {any}
 */
this.assertRecord=(value,field)=>{if(value===null||typeof value!=='object'||Array.isArray(value))throw error.create('CFG_INVALID_SOURCE',{field});};/**
 * @param {any} sources
 * @returns {any}
 */
this.capture=(sources)=>{if(!Array.isArray(sources)||Object.getPrototypeOf(sources)!==Array.prototype)throw error.create('CFG_INVALID_SOURCE');const result=[];const ids=new Set();for(let index=0;index<sources.length;index++){if(!Object.prototype.hasOwnProperty.call(sources,index))throw error.create('CFG_INVALID_SOURCE');const source=sources[index];if(source===null||((typeof source!=='object')&&(typeof source!=='function')))throw error.create('CFG_INVALID_SOURCE');let id,load;try{id=source.id;load=source.load;}catch{throw error.create('CFG_INVALID_SOURCE');}if(typeof load!=='function'||id===undefined)throw error.create('CFG_INVALID_SOURCE');this.assertId(id);if(ids.has(id))throw error.create('CFG_INVALID_SOURCE_ID',{sourceId:id});if(typeof load!=='function')throw error.create('CFG_INVALID_SOURCE');ids.add(id);result.push(Object.freeze({id,load:load.bind(source)}));}return Object.freeze(result);};}}
export const __deps__=Object.freeze({default:Object.freeze({error:'TeqFw_Cfg_Error$'})});
