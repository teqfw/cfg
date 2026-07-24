// @ts-check
/** @namespace TeqFw_Cfg_Source_ProcessEnv @description Explicit process-environment Source factory. */

export default class ProcessEnvSource { constructor({contract,key}){this.create=(environment,id='process-env')=>{contract.assertRecord(environment,'environment');contract.assertId(id);return Object.freeze({id,async load(){const result=[];for(const name of Object.keys(environment)){if(!key.isComplete(name))continue;const value=environment[name];if(value===undefined)continue;if(typeof value!=='string')throw new Error('invalid environment value');result.push(Object.freeze({key:name,value}));}return Object.freeze(result);}});};} }
export const __deps__=Object.freeze({default:Object.freeze({contract:'TeqFw_Cfg_Source_Contract$',key:'TeqFw_Cfg_Key$'})});
