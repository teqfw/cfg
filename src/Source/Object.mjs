// @ts-check
/** @namespace TeqFw_Cfg_Source_Object @description Explicit programmatic Source factory. */

export default class ObjectSource { constructor({contract}){this.create=(entries,id='object')=>{contract.assertRecord(entries,'entries');contract.assertId(id);return Object.freeze({id,async load(){const result=[];for(const key of Object.keys(entries))result.push(Object.freeze({key,value:entries[key]}));return Object.freeze(result);}});};} }
export const __deps__=Object.freeze({default:Object.freeze({contract:'TeqFw_Cfg_Source_Contract$'})});
