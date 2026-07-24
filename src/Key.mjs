// @ts-check
/** @namespace TeqFw_Cfg_Key @description Internal key and namespace grammar service. */

const SEGMENT='[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*';const NAMESPACE=new RegExp('^'+SEGMENT+'$');const COMPLETE=new RegExp('^('+SEGMENT+')__('+SEGMENT+')$');
export default class Key { /**
 * @param {object} deps
 * @param {object} deps.error
 */
constructor({error}){/**
 * @param {any} value
 * @returns {any}
 */
this.isComplete=(value)=>typeof value==='string'&&COMPLETE.test(value);/**
 * @param {any} value
 * @param {any} context
 * @returns {any}
 */
this.parse=(value,context={})=>{if(typeof value!=='string'||!COMPLETE.test(value))throw error.create('CFG_INVALID_KEY',typeof value==='string'?{key:value,...context}:context);const boundary=value.indexOf('__');return {namespace:value.slice(0,boundary),parameter:value.slice(boundary+2)};};/**
 * @param {any} value
 * @returns {any}
 */
this.assertNamespace=(value)=>{if(typeof value!=='string'||!NAMESPACE.test(value))throw error.create('CFG_INVALID_NAMESPACE',typeof value==='string'?{namespace:value}:{});return value;};}}
export const __deps__=Object.freeze({default:Object.freeze({error:'TeqFw_Cfg_Error$'})});
