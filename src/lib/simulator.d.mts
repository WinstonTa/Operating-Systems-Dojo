export type Scenario = {id:string;step:number;pid:number;childPid:number|null;image:string;parent:string;child:string;returnParent:number|null;returnChild:number|null;status:number|null;semaphore:number;blocked:boolean;shared:boolean;sharedValue:number;readerValue:number|null;initialized:boolean;size:number;mapped:boolean;nameExists:boolean;model:Record<string,string|number|boolean>;log:string[]}
export function createScenario(id:string):Scenario
export const availableActions: Record<string, [string,string][]>
export function transition(state:Scenario,action:string):Scenario
