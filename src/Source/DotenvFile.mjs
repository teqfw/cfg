// @ts-check
/** @namespace TeqFw_Cfg_Source_DotenvFile @description UTF-8 dotenv-file Source factory. */

export default class DotenvFileSource { /**
 * @param {object} deps
 * @param {object} deps.contract
 * @param {object} deps.key
 * @param {object} deps.parser
 */
constructor({contract,key,parser}){/**
 * @param {any} options
 * @returns {any}
 */
this.create=(options)=>{contract.assertRecord(options,'options');if(typeof options.path!=='string'||options.path.length===0)contract.invalidSource('path');const id=options.id??'dotenv-file';contract.assertId(id);const path=options.path;return Object.freeze({id,async load(){const {readFile}=await import('node:fs/promises');const bytes=await readFile(path);const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);const parsed=parser.parse(text);const result=[];for(const [name,value] of Object.entries(parsed))if(key.isComplete(name))result.push(Object.freeze({key:name,value}));return Object.freeze(result);}});};} }
export const __deps__=Object.freeze({default:Object.freeze({contract:'TeqFw_Cfg_Source_Contract$',key:'TeqFw_Cfg_Key$',parser:'TeqFw_Cfg_Source_DotenvParser$'})});
