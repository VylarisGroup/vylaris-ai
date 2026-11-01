import{c as e,f as t,s as n,t as r,u as i}from"./app-C2Onnhv6.js";var a=t(e(),1),o=e=>e?.replace(/([a-z0-9])([A-Z])/g,`$1-$2`).toLowerCase();function s(e,t,n=[]){if(t==null)throw Error(`[lucide]: iconNode is required when icon name is used`);return{name:o(e),size:24,node:t,...n.length>0?{aliases:n}:{}}}var c=e=>{let t=``,n=!1;for(let r of e)r===`-`||r===`_`||r<=` `?n=t.length>0:(t.length===0?t+=r.toLowerCase():t+=n?r.toUpperCase():r,n=!1);return t},l=e=>{let t=c(e);return t.charAt(0).toUpperCase()+t.slice(1)},u=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),d={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`};function f(e){return e!=null}function p(e,t={}){let n=t.attributeNames??{},r=e=>n[e]??e,i=e.size??e.width??d.width,a=e.size??e.height??d.height,o=e.aliases?.filter(e=>typeof e==`string`&&e.trim()!==``).map(e=>`lucide-${e}`)??[],s=[...e.name?[`lucide-${e.name}`]:[],...o],c=t.className?.split(` `).filter(Boolean)??[],l=t.includeDefaultClasses===!1?u(...c):u(`lucide`,...s,...c),p=t.absoluteStrokeWidth?Number(t.strokeWidth??d[`stroke-width`])*Number(e.size??e.width??d.width)/Number(t.size??t.width??d.width):t.strokeWidth??d[`stroke-width`];return[`svg`,{...Object.entries(d).reduce((e,[t,n])=>(e[r(t)]=n,e),{}),...`color`in t&&t.color&&{[r(`stroke`)]:t.color},...`size`in t&&f(t.size)&&{[r(`width`)]:t.size,[r(`height`)]:t.size},...`width`in t&&f(t.width)&&{[r(`width`)]:t.width},...`height`in t&&f(t.height)&&{[r(`height`)]:t.height},[r(`stroke-width`)]:p,...l&&{[r(`class`)]:l},[r(`viewBox`)]:`0 0 ${i} ${a}`,...t.hasA11yProp===!1?{[r(`aria-hidden`)]:`true`}:{},...`attributes`in t&&t.attributes},e.node.map(e=>{let[n,i,a]=e,o=t.nonScalingStroke?{[r(`vector-effect`)]:`non-scaling-stroke`,...i}:i;return a?[n,o,a]:[n,o]})]}function m(e,t={}){return p(e,{...t,attributeNames:{...t.attributeNames,class:`className`,"stroke-width":`strokeWidth`,"stroke-linecap":`strokeLinecap`,"stroke-linejoin":`strokeLinejoin`,"vector-effect":`vectorEffect`}})}var h=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0;return!1},g=(0,a.createContext)({}),_=()=>(0,a.useContext)(g),v=(0,a.forwardRef)(({color:e,size:t,width:n,height:r,strokeWidth:i,absoluteStrokeWidth:o,nonScalingStroke:s,className:c=``,children:l,iconNode:d=[],icon:f={node:d,aliases:[],size:24},...p},g)=>{let{size:v=24,strokeWidth:y=2,absoluteStrokeWidth:b=!1,nonScalingStroke:x=!1,color:S=`currentColor`,className:C=``}=_()??{},w=!!l||h(p),[T,E,D=[]]=m(f,{color:e??S,width:n??t??v,height:r??t??v,strokeWidth:i??y,absoluteStrokeWidth:o??b,nonScalingStroke:s??x,className:u(C,c),hasA11yProp:w,attributes:p});return(0,a.createElement)(T,{ref:g,...E},[...D.map(([e,t])=>(0,a.createElement)(e,t)),...Array.isArray(l)?l:[l]])});function y(e,t=[],n=[]){let r=typeof e==`string`?s(e,t,n):e,i=(0,a.forwardRef)(({className:e,...t},n)=>(0,a.createElement)(v,{ref:n,icon:r,className:e,...t}));return r.name&&(i.displayName=l(r.name)),i}var b={name:`loader-circle`,size:24,node:[[`path`,{d:`M21 12a9 9 0 1 1-6.219-8.56`,key:`13zald`}]],aliases:[`loader-2`]};b.node;var x=y(b),S={name:`x`,size:24,node:[[`path`,{d:`M18 6 6 18`,key:`1bl5f8`}],[`path`,{d:`m6 6 12 12`,key:`d8bk6v`}]]};S.node;var C=y(S),w=Object.defineProperty,T=(e,t,n)=>t in e?w(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,E=(e,t,n)=>(T(e,typeof t==`symbol`?t:t+``,n),n),D=new class{constructor(){E(this,`current`,this.detect()),E(this,`handoffState`,`pending`),E(this,`currentId`,0)}set(e){this.current!==e&&(this.handoffState=`pending`,this.currentId=0,this.current=e)}reset(){this.set(this.detect())}nextId(){return++this.currentId}get isServer(){return this.current===`server`}get isClient(){return this.current===`client`}detect(){return typeof window>`u`||typeof document>`u`?`server`:`client`}handoff(){this.handoffState===`pending`&&(this.handoffState=`complete`)}get isHandoffComplete(){return this.handoffState===`complete`}};function O(e){return D.isServer?null:e==null?document:e?.ownerDocument??document}function k(e){return D.isServer?null:e==null?document:(e?.getRootNode)?.call(e)??document}function A(e){return k(e)?.activeElement??null}function j(e){return A(e)===e}function M(e){typeof queueMicrotask==`function`?queueMicrotask(e):Promise.resolve().then(e).catch(e=>setTimeout(()=>{throw e}))}function N(){let e=[],t={addEventListener(e,n,r,i){return e.addEventListener(n,r,i),t.add(()=>e.removeEventListener(n,r,i))},requestAnimationFrame(...e){let n=requestAnimationFrame(...e);return t.add(()=>cancelAnimationFrame(n))},nextFrame(...e){return t.requestAnimationFrame(()=>t.requestAnimationFrame(...e))},setTimeout(...e){let n=setTimeout(...e);return t.add(()=>clearTimeout(n))},microTask(...e){let n={current:!0};return M(()=>{n.current&&e[0]()}),t.add(()=>{n.current=!1})},style(e,t,n){let r=e.style.getPropertyValue(t);return Object.assign(e.style,{[t]:n}),this.add(()=>{Object.assign(e.style,{[t]:r})})},group(e){let t=N();return e(t),this.add(()=>t.dispose())},add(t){return e.includes(t)||e.push(t),()=>{let n=e.indexOf(t);if(n>=0)for(let t of e.splice(n,1))t()}},dispose(){for(let t of e.splice(0))t()}};return t}function P(){let[e]=(0,a.useState)(N);return(0,a.useEffect)(()=>()=>e.dispose(),[e]),e}var F=(e,t)=>{D.isServer?(0,a.useEffect)(e,t):(0,a.useLayoutEffect)(e,t)};function I(e){let t=(0,a.useRef)(e);return F(()=>{t.current=e},[e]),t}var L=function(e){let t=I(e);return a.useCallback((...e)=>t.current(...e),[t])};function R(e){return(0,a.useMemo)(()=>e,Object.values(e))}var ee=(0,a.createContext)(void 0);function z(){return(0,a.useContext)(ee)}function te(...e){return Array.from(new Set(e.flatMap(e=>typeof e==`string`?e.split(` `):[]))).filter(Boolean).join(` `)}function B(e,t,...n){if(e in t){let r=t[e];return typeof r==`function`?r(...n):r}let r=Error(`Tried to handle "${e}" but there is no handler defined. Only defined handlers are: ${Object.keys(t).map(e=>`"${e}"`).join(`, `)}.`);throw Error.captureStackTrace&&Error.captureStackTrace(r,B),r}var ne=(e=>(e[e.None=0]=`None`,e[e.RenderStrategy=1]=`RenderStrategy`,e[e.Static=2]=`Static`,e))(ne||{}),re=(e=>(e[e.Unmount=0]=`Unmount`,e[e.Hidden=1]=`Hidden`,e))(re||{});function V(){let e=oe();return(0,a.useCallback)(t=>ie({mergeRefs:e,...t}),[e])}function ie({ourProps:e,theirProps:t,slot:n,defaultTag:r,features:i,visible:a=!0,name:o,mergeRefs:s}){s??=se;let c=ce(t,e);if(a)return ae(c,n,r,o,s);let l=i??0;if(l&2){let{static:e=!1,...t}=c;if(e)return ae(t,n,r,o,s)}if(l&1){let{unmount:e=!0,...t}=c;return B(+!e,{0(){return null},1(){return ae({...t,hidden:!0,style:{display:`none`}},n,r,o,s)}})}return ae(c,n,r,o,s)}function ae(e,t={},n,r,i){let{as:o=n,children:s,refName:c=`ref`,...l}=de(e,[`unmount`,`static`]),u=e.ref===void 0?{}:{[c]:e.ref},d=typeof s==`function`?s(t):s;d=pe(d),`className`in l&&l.className&&typeof l.className==`function`&&(l.className=l.className(t)),l[`aria-labelledby`]&&l[`aria-labelledby`]===l.id&&(l[`aria-labelledby`]=void 0);let f={};if(t){let e=!1,n=[];for(let[r,i]of Object.entries(t))typeof i==`boolean`&&(e=!0),i===!0&&n.push(r.replace(/([A-Z])/g,e=>`-${e.toLowerCase()}`));if(e){f[`data-headlessui-state`]=n.join(` `);for(let e of n)f[`data-${e}`]=``}}if(me(o)&&(Object.keys(ue(l)).length>0||Object.keys(ue(f)).length>0)){if(!(0,a.isValidElement)(d)||Array.isArray(d)&&d.length>1||he(d)){if(Object.keys(ue(l)).length>0)throw Error([`Passing props on "Fragment"!`,``,`The current component <${r} /> is rendering a "Fragment".`,`However we need to passthrough the following props:`,Object.keys(ue(l)).concat(Object.keys(ue(f))).map(e=>`  - ${e}`).join(`
`),``,`You can apply a few solutions:`,['Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".',`Render a single element as the child so that we can forward the props onto that element.`].map(e=>`  - ${e}`).join(`
`)].join(`
`))}else{let e=d.props?.className,t=typeof e==`function`?(...t)=>te(e(...t),l.className):te(e,l.className),n=t?{className:t}:{},r=ce(d.props,ue(de(l,[`ref`])));for(let e in f)e in r&&delete f[e];return(0,a.cloneElement)(d,Object.assign({},r,f,u,{ref:i(fe(d),u.ref)},n))}}return(0,a.createElement)(o,Object.assign({},de(l,[`ref`]),!me(o)&&u,!me(o)&&f),d)}function oe(){let e=(0,a.useRef)([]),t=(0,a.useCallback)(t=>{for(let n of e.current)n!=null&&(typeof n==`function`?n(t):n.current=t)},[]);return(...n)=>{if(!n.every(e=>e==null))return e.current=n,t}}function se(...e){return e.every(e=>e==null)?void 0:t=>{for(let n of e)n!=null&&(typeof n==`function`?n(t):n.current=t)}}function ce(...e){if(e.length===0)return{};if(e.length===1)return e[0];let t={},n={};for(let r of e)for(let e in r)e.startsWith(`on`)&&typeof r[e]==`function`?(n[e]??(n[e]=[]),n[e].push(r[e])):t[e]=r[e];if(t.disabled||t[`aria-disabled`])for(let e in n)/^(on(?:Click|Pointer|Mouse|Key)(?:Down|Up|Press)?)$/.test(e)&&(n[e]=[e=>(e?.preventDefault)?.call(e)]);for(let e in n)Object.assign(t,{[e](t,...r){let i=n[e];for(let e of i){if((t instanceof Event||t?.nativeEvent instanceof Event)&&t.defaultPrevented)return;e(t,...r)}}});return t}function le(...e){if(e.length===0)return{};if(e.length===1)return e[0];let t={},n={};for(let r of e)for(let e in r)e.startsWith(`on`)&&typeof r[e]==`function`?(n[e]??(n[e]=[]),n[e].push(r[e])):t[e]=r[e];for(let e in n)Object.assign(t,{[e](...t){let r=n[e];for(let e of r)e?.(...t)}});return t}function H(e){return Object.assign((0,a.forwardRef)(e),{displayName:e.displayName??e.name})}function ue(e){let t=Object.assign({},e);for(let e in t)t[e]===void 0&&delete t[e];return t}function de(e,t=[]){let n=Object.assign({},e);for(let e of t)e in n&&delete n[e];return n}function fe(e){return`18.3.1`.split(`.`)[0]>=`19`?e.props.ref:e.ref}function pe(e){if(e!=null&&e.$$typeof===Symbol.for(`react.lazy`)){let t=e._payload;if(t!=null&&t.status===`fulfilled`)return pe(t.value)}return e}function me(e){return e===a.Fragment||e===Symbol.for(`react.fragment`)}function he(e){return me(e.type)}var ge=`span`,_e=(e=>(e[e.None=1]=`None`,e[e.Focusable=2]=`Focusable`,e[e.Hidden=4]=`Hidden`,e))(_e||{});function ve(e,t){let{features:n=1,...r}=e,i={ref:t,"aria-hidden":(n&2)==2?!0:r[`aria-hidden`]??void 0,hidden:(n&4)==4||void 0,style:{position:`fixed`,top:1,left:1,width:1,height:0,padding:0,margin:-1,overflow:`hidden`,clip:`rect(0, 0, 0, 0)`,whiteSpace:`nowrap`,borderWidth:`0`,...(n&4)==4&&(n&2)!=2&&{display:`none`}}};return V()({ourProps:i,theirProps:r,slot:{},defaultTag:ge,name:`Hidden`})}var ye=H(ve);function be(e){return typeof e!=`object`||!e?!1:`nodeType`in e}function xe(e){return be(e)&&`tagName`in e}function U(e){return xe(e)&&`accessKey`in e}function Se(e){return xe(e)&&`tabIndex`in e}function Ce(e){return xe(e)&&`style`in e}function we(e){return U(e)&&e.nodeName===`IFRAME`}function Te(e){return U(e)&&e.nodeName===`INPUT`}function Ee(e){return U(e)&&e.nodeName===`LABEL`}function De(e){return U(e)&&e.nodeName===`FIELDSET`}function Oe(e){return U(e)&&e.nodeName===`LEGEND`}function ke(e){return xe(e)?e.matches(`a[href],audio[controls],button,details,embed,iframe,img[usemap],input:not([type="hidden"]),label,select,textarea,video[controls]`):!1}var Ae=Symbol();function je(e,t=!0){return Object.assign(e,{[Ae]:t})}function Me(...e){let t=(0,a.useRef)(e);(0,a.useEffect)(()=>{t.current=e},[e]);let n=L(e=>{for(let n of t.current)n!=null&&(typeof n==`function`?n(e):n.current=e)});return e.every(e=>e==null||e?.[Ae])?void 0:n}var Ne=(0,a.createContext)(null);Ne.displayName=`DescriptionContext`;function Pe(){let e=(0,a.useContext)(Ne);if(e===null){let e=Error(`You used a <Description /> component, but it is not inside a relevant parent.`);throw Error.captureStackTrace&&Error.captureStackTrace(e,Pe),e}return e}function Fe(){let[e,t]=(0,a.useState)([]);return[e.length>0?e.join(` `):void 0,(0,a.useMemo)(()=>function(e){let n=L(e=>(t(t=>[...t,e]),()=>t(t=>{let n=t.slice(),r=n.indexOf(e);return r!==-1&&n.splice(r,1),n}))),r=(0,a.useMemo)(()=>({register:n,slot:e.slot,name:e.name,props:e.props,value:e.value}),[n,e.slot,e.name,e.props,e.value]);return a.createElement(Ne.Provider,{value:r},e.children)},[t])]}var Ie=`p`;function Le(e,t){let n=(0,a.useId)(),r=z(),{id:i=`headlessui-description-${n}`,...o}=e,s=Pe(),c=Me(t);F(()=>s.register(i),[i,s.register]);let l=R({...s.slot,disabled:r||!1}),u={ref:c,...s.props,id:i};return V()({ourProps:u,theirProps:o,slot:l,defaultTag:Ie,name:s.name||`Description`})}var Re=H(Le),ze=Object.assign(Re,{}),Be=(e=>(e.Space=` `,e.Enter=`Enter`,e.Escape=`Escape`,e.Backspace=`Backspace`,e.Delete=`Delete`,e.ArrowLeft=`ArrowLeft`,e.ArrowUp=`ArrowUp`,e.ArrowRight=`ArrowRight`,e.ArrowDown=`ArrowDown`,e.Home=`Home`,e.End=`End`,e.PageUp=`PageUp`,e.PageDown=`PageDown`,e.Tab=`Tab`,e))(Be||{}),Ve=(0,a.createContext)(()=>{});function He({value:e,children:t}){return a.createElement(Ve.Provider,{value:e},t)}var Ue=class extends Map{constructor(e){super(),this.factory=e}get(e){let t=super.get(e);return t===void 0&&(t=this.factory(e),this.set(e,t)),t}},We=Object.defineProperty,Ge=(e,t,n)=>t in e?We(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Ke=(e,t,n)=>(Ge(e,typeof t==`symbol`?t:t+``,n),n),qe=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},W=(e,t,n)=>(qe(e,t,`read from private field`),n?n.call(e):t.get(e)),Je=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},Ye=(e,t,n,r)=>(qe(e,t,`write to private field`),r?r.call(e,n):t.set(e,n),n),Xe,Ze,Qe,$e=class{constructor(e){Je(this,Xe,{}),Je(this,Ze,new Ue(()=>new Set)),Je(this,Qe,new Set),Ke(this,`disposables`,N()),Ye(this,Xe,e),D.isServer&&this.disposables.microTask(()=>{this.dispose()})}dispose(){this.disposables.dispose()}get state(){return W(this,Xe)}subscribe(e,t){if(D.isServer)return()=>{};let n={selector:e,callback:t,current:e(W(this,Xe))};return W(this,Qe).add(n),this.disposables.add(()=>{W(this,Qe).delete(n)})}on(e,t){return D.isServer?()=>{}:(W(this,Ze).get(e).add(t),this.disposables.add(()=>{W(this,Ze).get(e).delete(t)}))}send(e){let t=this.reduce(W(this,Xe),e);if(t!==W(this,Xe)){Ye(this,Xe,t);for(let e of W(this,Qe)){let t=e.selector(W(this,Xe));et(e.current,t)||(e.current=t,e.callback(t))}for(let t of W(this,Ze).get(e.type))t(W(this,Xe),e)}}};Xe=new WeakMap,Ze=new WeakMap,Qe=new WeakMap;function et(e,t){return Object.is(e,t)?!0:typeof e!=`object`||!e||typeof t!=`object`||!t?!1:Array.isArray(e)&&Array.isArray(t)?e.length===t.length&&tt(e[Symbol.iterator](),t[Symbol.iterator]()):e instanceof Map&&t instanceof Map||e instanceof Set&&t instanceof Set?e.size===t.size&&tt(e.entries(),t.entries()):nt(e)&&nt(t)?tt(Object.entries(e)[Symbol.iterator](),Object.entries(t)[Symbol.iterator]()):!1}function tt(e,t){do{let n=e.next(),r=t.next();if(n.done&&r.done)return!0;if(n.done||r.done||!Object.is(n.value,r.value))return!1}while(1)}function nt(e){if(Object.prototype.toString.call(e)!==`[object Object]`)return!1;let t=Object.getPrototypeOf(e);return t===null||Object.getPrototypeOf(t)===null}function rt(e){let[t,n]=e(),r=N();return(...e)=>{t(...e),r.dispose(),r.microTask(n)}}var it=Object.defineProperty,at=(e,t,n)=>t in e?it(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,ot=(e,t,n)=>(at(e,typeof t==`symbol`?t:t+``,n),n),st=(e=>(e[e.Push=0]=`Push`,e[e.Pop=1]=`Pop`,e))(st||{}),ct={0(e,t){let n=t.id,r=e.stack,i=e.stack.indexOf(n);if(i!==-1){let t=e.stack.slice();return t.splice(i,1),t.push(n),r=t,{...e,stack:r}}return{...e,stack:[...e.stack,n]}},1(e,t){let n=t.id,r=e.stack.indexOf(n);if(r===-1)return e;let i=e.stack.slice();return i.splice(r,1),{...e,stack:i}}},lt=class e extends $e{constructor(){super(...arguments),ot(this,`actions`,{push:e=>this.send({type:0,id:e}),pop:e=>this.send({type:1,id:e})}),ot(this,`selectors`,{isTop:(e,t)=>e.stack[e.stack.length-1]===t,inStack:(e,t)=>e.stack.includes(t)})}static new(){return new e({stack:[]})}reduce(e,t){return B(t.type,ct,e,t)}},ut=new Ue(()=>lt.new()),dt=i((t=>{var n=e();function r(e,t){return e===t&&(e!==0||1/e==1/t)||e!==e&&t!==t}var i=typeof Object.is==`function`?Object.is:r,a=n.useSyncExternalStore,o=n.useRef,s=n.useEffect,c=n.useMemo,l=n.useDebugValue;t.useSyncExternalStoreWithSelector=function(e,t,n,r,u){var d=o(null);if(d.current===null){var f={hasValue:!1,value:null};d.current=f}else f=d.current;d=c(function(){function e(e){if(!a){if(a=!0,o=e,e=r(e),u!==void 0&&f.hasValue){var t=f.value;if(u(t,e))return s=t}return s=e}if(t=s,i(o,e))return t;var n=r(e);return u!==void 0&&u(t,n)?(o=e,t):(o=e,s=n)}var a=!1,o,s,c=n===void 0?null:n;return[function(){return e(t())},c===null?void 0:function(){return e(c())}]},[t,n,r,u]);var p=a(e,d[0],d[1]);return s(function(){f.hasValue=!0,f.value=p},[p]),l(p),p}})),ft=i(((e,t)=>{t.exports=dt()}))();function pt(e,t,n=et){return(0,ft.useSyncExternalStoreWithSelector)(L(t=>e.subscribe(mt,t)),L(()=>e.state),L(()=>e.state),L(t),n)}function mt(e){return e}function ht(e,t){let n=(0,a.useId)(),r=ut.get(t),[i,o]=pt(r,(0,a.useCallback)(e=>[r.selectors.isTop(e,n),r.selectors.inStack(e,n)],[r,n]));return F(()=>{if(e)return r.actions.push(n),()=>r.actions.pop(n)},[r,e,n]),e?!o||i:!1}var gt=new Map,_t=new Map;function vt(e){let t=_t.get(e)??0;return _t.set(e,t+1),t===0&&(gt.set(e,{"aria-hidden":e.getAttribute(`aria-hidden`),inert:e.inert}),e.setAttribute(`aria-hidden`,`true`),e.inert=!0),()=>yt(e)}function yt(e){let t=_t.get(e)??1;if(t===1?_t.delete(e):_t.set(e,t-1),t!==1)return;let n=gt.get(e);n&&(n[`aria-hidden`]===null?e.removeAttribute(`aria-hidden`):e.setAttribute(`aria-hidden`,n[`aria-hidden`]),e.inert=n.inert,gt.delete(e))}function bt(e,{allowed:t,disallowed:n}={}){let r=ht(e,`inert-others`);F(()=>{if(!r)return;let e=N();for(let t of n?.()??[])t&&e.add(vt(t));let i=t?.()??[];for(let t of i){if(!t)continue;let n=O(t);if(!n)continue;let r=t.parentElement;for(;r&&r!==n.body;){for(let t of r.children)i.some(e=>t.contains(e))||e.add(vt(t));r=r.parentElement}}return e.dispose},[r,t,n])}function xt(e,t,n){let r=I(e=>{let t=e.getBoundingClientRect();t.x===0&&t.y===0&&t.width===0&&t.height===0&&n()});(0,a.useEffect)(()=>{if(!e)return;let n=t===null?null:U(t)?t:t.current;if(!n)return;let i=N();if(typeof ResizeObserver<`u`){let e=new ResizeObserver(()=>r.current(n));e.observe(n),i.add(()=>e.disconnect())}if(typeof IntersectionObserver<`u`){let e=new IntersectionObserver(()=>r.current(n));e.observe(n),i.add(()=>e.disconnect())}return()=>i.dispose()},[t,r,e])}var St=[`[contentEditable=true]`,`[tabindex]`,`a[href]`,`area[href]`,`button:not([disabled])`,`iframe`,`input:not([disabled])`,`select:not([disabled])`,`details>summary`,`textarea:not([disabled])`].map(e=>`${e}:not([tabindex='-1'])`).join(`,`),Ct=[`[data-autofocus]`].map(e=>`${e}:not([tabindex='-1'])`).join(`,`),wt=(e=>(e[e.First=1]=`First`,e[e.Previous=2]=`Previous`,e[e.Next=4]=`Next`,e[e.Last=8]=`Last`,e[e.WrapAround=16]=`WrapAround`,e[e.NoScroll=32]=`NoScroll`,e[e.AutoFocus=64]=`AutoFocus`,e))(wt||{}),Tt=(e=>(e[e.Error=0]=`Error`,e[e.Overflow=1]=`Overflow`,e[e.Success=2]=`Success`,e[e.Underflow=3]=`Underflow`,e))(Tt||{}),Et=(e=>(e[e.Previous=-1]=`Previous`,e[e.Next=1]=`Next`,e))(Et||{});function Dt(e=document.body){return e==null?[]:Array.from(e.querySelectorAll(St)).sort((e,t)=>Math.sign((e.tabIndex||2**53-1)-(t.tabIndex||2**53-1)))}function Ot(e=document.body){return e==null?[]:Array.from(e.querySelectorAll(Ct)).sort((e,t)=>Math.sign((e.tabIndex||2**53-1)-(t.tabIndex||2**53-1)))}var kt=(e=>(e[e.Strict=0]=`Strict`,e[e.Loose=1]=`Loose`,e))(kt||{});function At(e,t=0){return e!==O(e)?.body&&B(t,{0(){return e.matches(St)},1(){let t=e;for(;t!==null;){if(t.matches(St))return!0;t=t.parentElement}return!1}})}function jt(e){N().nextFrame(()=>{let t=A(e);t&&Se(t)&&!At(t,0)&&Nt(e)})}var Mt=(e=>(e[e.Keyboard=0]=`Keyboard`,e[e.Mouse=1]=`Mouse`,e))(Mt||{});typeof window<`u`&&typeof document<`u`&&(document.addEventListener(`keydown`,e=>{e.metaKey||e.altKey||e.ctrlKey||(document.documentElement.dataset.headlessuiFocusVisible=``)},!0),document.addEventListener(`click`,e=>{e.detail===1?delete document.documentElement.dataset.headlessuiFocusVisible:e.detail===0&&(document.documentElement.dataset.headlessuiFocusVisible=``)},!0));function Nt(e){e?.focus({preventScroll:!0})}var Pt=`textarea,input`;function Ft(e){return(e?.matches)?.call(e,Pt)??!1}function It(e,t=e=>e){return e.slice().sort((e,n)=>{let r=t(e),i=t(n);if(r===null||i===null)return 0;let a=r.compareDocumentPosition(i);return a&Node.DOCUMENT_POSITION_FOLLOWING?-1:a&Node.DOCUMENT_POSITION_PRECEDING?1:0})}function Lt(e,t,n=e===null?document.body:k(e)){return Rt(Dt(n),t,{relativeTo:e})}function Rt(e,t,{sorted:n=!0,relativeTo:r=null,skipElements:i=[]}={}){let a=Array.isArray(e)?e.length>0?k(e[0]):document:k(e),o=Array.isArray(e)?n?It(e):e:t&64?Ot(e):Dt(e);i.length>0&&o.length>1&&(o=o.filter(e=>!i.some(t=>t!=null&&`current`in t?t?.current===e:t===e))),r??=a?.activeElement;let s=(()=>{if(t&5)return 1;if(t&10)return-1;throw Error(`Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last`)})(),c=(()=>{if(t&1)return 0;if(t&2)return Math.max(0,o.indexOf(r))-1;if(t&4)return Math.max(0,o.indexOf(r))+1;if(t&8)return o.length-1;throw Error(`Missing Focus.First, Focus.Previous, Focus.Next or Focus.Last`)})(),l=t&32?{preventScroll:!0}:{},u=0,d=o.length,f;do{if(u>=d||u+d<=0)return 0;let e=c+u;if(t&16)e=(e+d)%d;else{if(e<0)return 3;if(e>=d)return 1}f=o[e],f?.focus(l),u+=s}while(f!==A(f));return t&6&&Ft(f)&&f.select(),2}function zt(){return/iPhone/gi.test(window.navigator.platform)||/Mac/gi.test(window.navigator.platform)&&window.navigator.maxTouchPoints>0}function Bt(){return/Android/gi.test(window.navigator.userAgent)}function Vt(){return zt()||Bt()}function Ht(e,t,n,r){let i=I(n);(0,a.useEffect)(()=>{if(!e)return;function n(e){i.current(e)}return document.addEventListener(t,n,r),()=>document.removeEventListener(t,n,r)},[e,t,r])}function Ut(e,t,n,r){let i=I(n);(0,a.useEffect)(()=>{if(!e)return;function n(e){i.current(e)}return window.addEventListener(t,n,r),()=>window.removeEventListener(t,n,r)},[e,t,r])}var Wt=30;function Gt(e,t,n){let r=I(n),i=(0,a.useCallback)(function(e,n){if(e.defaultPrevented)return;let i=n(e);if(i===null||!i.getRootNode().contains(i)||!i.isConnected)return;let a=function e(t){return typeof t==`function`?e(t()):Array.isArray(t)||t instanceof Set?t:[t]}(t);for(let t of a)if(t!==null&&(t.contains(i)||e.composed&&e.composedPath().includes(t)))return;return!At(i,kt.Loose)&&i.tabIndex!==-1&&e.preventDefault(),r.current(e,i)},[r,t]),o=(0,a.useRef)(null);Ht(e,`pointerdown`,e=>{Vt()||(o.current=e.composedPath?.call(e)?.[0]||e.target)},!0),Ht(e,`pointerup`,e=>{if(Vt()||!o.current)return;let t=o.current;return o.current=null,i(e,()=>t)},!0);let s=(0,a.useRef)({x:0,y:0});Ht(e,`touchstart`,e=>{s.current.x=e.touches[0].clientX,s.current.y=e.touches[0].clientY},!0),Ht(e,`touchend`,e=>{let t={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};if(!(Math.abs(t.x-s.current.x)>=Wt||Math.abs(t.y-s.current.y)>=Wt))return i(e,()=>Se(e.target)?e.target:null)},!0),Ut(e,`blur`,e=>i(e,()=>we(window.document.activeElement)?window.document.activeElement:null),!0)}function Kt(...e){return(0,a.useMemo)(()=>O(...e),[...e])}function qt(e,t,n,r){let i=I(n);(0,a.useEffect)(()=>{e??=window;function n(e){i.current(e)}return e.addEventListener(t,n,r),()=>e.removeEventListener(t,n,r)},[e,t,r])}function Jt(e){return(0,a.useSyncExternalStore)(e.subscribe,e.getSnapshot,e.getSnapshot)}function Yt(e,t){let n=e(),r=new Set;return{getSnapshot(){return n},subscribe(e){return r.add(e),()=>r.delete(e)},dispatch(e,...i){let a=t[e].call(n,...i);a&&(n=a,r.forEach(e=>e()))}}}function Xt(){let e;return{before({doc:t}){let n=t.documentElement,r=t.defaultView??window;e=Math.max(0,r.innerWidth-n.clientWidth)},after({doc:t,d:n}){let r=t.documentElement,i=Math.max(0,r.clientWidth-r.offsetWidth),a=Math.max(0,e-i);n.style(r,`paddingRight`,`${a}px`)}}}function Zt(){return zt()?{before({doc:e,d:t,meta:n}){function r(e){for(let t of n().containers)for(let n of t())if(n.contains(e))return!0;return!1}t.microTask(()=>{if(window.getComputedStyle(e.documentElement).scrollBehavior!==`auto`){let n=N();n.style(e.documentElement,`scrollBehavior`,`auto`),t.add(()=>t.microTask(()=>n.dispose()))}let n=window.scrollY??window.pageYOffset,i=null;t.addEventListener(e,`click`,t=>{if(Se(t.target))try{let n=t.target.closest(`a`);if(!n)return;let{hash:a}=new URL(n.href),o=e.querySelector(a);Se(o)&&!r(o)&&(i=o)}catch{}},!0),t.group(n=>{t.addEventListener(e,`touchstart`,e=>{if(n.dispose(),Se(e.target)&&Ce(e.target)){if(r(e.target)){let t=e.target;for(;t.parentElement&&r(t.parentElement);)t=t.parentElement;n.style(t,`overscrollBehavior`,`contain`)}else n.style(e.target,`touchAction`,`none`)}})}),t.addEventListener(e,`touchmove`,e=>{if(Se(e.target)){if(Te(e.target))return;if(r(e.target)){let t=e.target;for(;t.parentElement&&t.dataset.headlessuiPortal!==``&&!(t.scrollHeight>t.clientHeight||t.scrollWidth>t.clientWidth);)t=t.parentElement;t.dataset.headlessuiPortal===``&&e.preventDefault()}else e.preventDefault()}},{passive:!1}),t.add(()=>{let e=window.scrollY??window.pageYOffset;n!==e&&window.scrollTo(0,n),i&&i.isConnected&&(i.scrollIntoView({block:`nearest`}),i=null)})})}}:{}}function Qt(){return{before({doc:e,d:t}){t.style(e.documentElement,`overflow`,`hidden`)}}}function $t(e){let t={};for(let n of e)Object.assign(t,n(t));return t}var en=Yt(()=>new Map,{PUSH(e,t){let n=this.get(e)??{doc:e,count:0,d:N(),meta:new Set,computedMeta:{}};return n.count++,n.meta.add(t),n.computedMeta=$t(n.meta),this.set(e,n),this},POP(e,t){let n=this.get(e);return n&&(n.count--,n.meta.delete(t),n.computedMeta=$t(n.meta)),this},SCROLL_PREVENT(e){let t={doc:e.doc,d:e.d,meta(){return e.computedMeta}},n=[Zt(),Xt(),Qt()];n.forEach(({before:e})=>e?.(t)),n.forEach(({after:e})=>e?.(t))},SCROLL_ALLOW({d:e}){e.dispose()},TEARDOWN({doc:e}){this.delete(e)}});en.subscribe(()=>{let e=en.getSnapshot(),t=new Map;for(let[n]of e)t.set(n,n.documentElement.style.overflow);for(let n of e.values()){let e=t.get(n.doc)===`hidden`,r=n.count!==0;(r&&!e||!r&&e)&&en.dispatch(n.count>0?`SCROLL_PREVENT`:`SCROLL_ALLOW`,n),n.count===0&&en.dispatch(`TEARDOWN`,n)}});function tn(e,t,n=()=>({containers:[]})){let r=Jt(en),i=t?r.get(t):void 0,a=i?i.count>0:!1;return F(()=>{if(t&&e)return en.dispatch(`PUSH`,t,n),()=>en.dispatch(`POP`,t,n)},[e,t]),a}function nn(e,t,n=()=>[document.body]){tn(ht(e,`scroll-lock`),t,e=>({containers:[...e.containers??[],n]}))}var rn=t(n(),1);function an(e=0){let[t,n]=(0,a.useState)(e);return{flags:t,setFlag:(0,a.useCallback)(e=>n(e),[]),addFlag:(0,a.useCallback)(e=>n(t=>t|e),[]),hasFlag:(0,a.useCallback)(e=>(t&e)===e,[t]),removeFlag:(0,a.useCallback)(e=>n(t=>t&~e),[]),toggleFlag:(0,a.useCallback)(e=>n(t=>t^e),[])}}typeof process<`u`&&typeof globalThis<`u`&&typeof Element<`u`&&(process==null?void 0:{})?.NODE_ENV===`test`&&(Element==null?void 0:Element.prototype)?.getAnimations===void 0&&(Element.prototype.getAnimations=function(){return console.warn("Headless UI has polyfilled `Element.prototype.getAnimations` for your tests.\nPlease install a proper polyfill e.g. `jsdom-testing-mocks`, to silence these warnings.\n\nExample usage:\n```js\nimport { mockAnimationsApi } from 'jsdom-testing-mocks'\nmockAnimationsApi()\n```"),[]});var on=(e=>(e[e.None=0]=`None`,e[e.Closed=1]=`Closed`,e[e.Enter=2]=`Enter`,e[e.Leave=4]=`Leave`,e))(on||{});function sn(e){let t={};for(let n in e)e[n]===!0&&(t[`data-${n}`]=``);return t}function cn(e,t,n,r){let[i,o]=(0,a.useState)(n),{hasFlag:s,addFlag:c,removeFlag:l}=an(e&&i?3:0),u=(0,a.useRef)(!1),d=(0,a.useRef)(!1);return F(()=>{var i;if(e){if(n&&o(!0),!t){n&&c(3);return}return(i=r?.start)==null||i.call(r,n),ln(t,{inFlight:u,prepare(){d.current?d.current=!1:d.current=u.current,u.current=!0,!d.current&&(n?(c(3),l(4)):(c(4),l(2)))},run(){d.current?n?(l(3),c(4)):(l(4),c(3)):n?l(1):c(1)},done(){var e;d.current&&fn(t)||(u.current=!1,l(7),n||o(!1),(e=r?.end)==null||e.call(r,n))}})}},[e,n,t,P()]),e?[i,{closed:s(1),enter:s(2),leave:s(4),transition:s(2)||s(4)}]:[n,{closed:void 0,enter:void 0,leave:void 0,transition:void 0}]}function ln(e,{prepare:t,run:n,done:r,inFlight:i}){let a=N();return dn(e,{prepare:t,inFlight:i}),a.nextFrame(()=>{n(),a.requestAnimationFrame(()=>{a.add(un(e,r))})}),a.dispose}function un(e,t){let n=N();if(!e)return n.dispose;let r=!1;n.add(()=>{r=!0});let i=e.getAnimations?.call(e).filter(e=>e instanceof CSSTransition)??[];return i.length===0?(t(),n.dispose):(Promise.allSettled(i.map(e=>e.finished)).then(()=>{r||t()}),n.dispose)}function dn(e,{inFlight:t,prepare:n}){if(t!=null&&t.current){n();return}let r=e.style.transition;e.style.transition=`none`,n(),e.offsetHeight,e.style.transition=r}function fn(e){return(e.getAnimations?.call(e)??[]).some(e=>e instanceof CSSTransition&&e.playState!==`finished`)}function pn(e,t){let n=(0,a.useRef)([]),r=L(e);(0,a.useEffect)(()=>{let e=[...n.current];for(let[i,a]of t.entries())if(n.current[i]!==a){let i=r(t,e);return n.current=t,i}},[r,...t])}var mn=(0,a.createContext)(null);mn.displayName=`OpenClosedContext`;var G=(e=>(e[e.Open=1]=`Open`,e[e.Closed=2]=`Closed`,e[e.Closing=4]=`Closing`,e[e.Opening=8]=`Opening`,e))(G||{});function hn(){return(0,a.useContext)(mn)}function gn({value:e,children:t}){return a.createElement(mn.Provider,{value:e},t)}function _n({children:e}){return a.createElement(mn.Provider,{value:null},e)}function vn(e){function t(){document.readyState!==`loading`&&(e(),document.removeEventListener(`DOMContentLoaded`,t))}typeof window<`u`&&typeof document<`u`&&(document.addEventListener(`DOMContentLoaded`,t),t())}var yn=[];vn(()=>{function e(e){if(!Se(e.target)||e.target===document.body||yn[0]===e.target)return;let t=e.target;t=t.closest(St),yn.unshift(t??e.target),yn=yn.filter(e=>e!=null&&e.isConnected),yn.splice(10)}window.addEventListener(`click`,e,{capture:!0}),window.addEventListener(`mousedown`,e,{capture:!0}),window.addEventListener(`focus`,e,{capture:!0}),document.body.addEventListener(`click`,e,{capture:!0}),document.body.addEventListener(`mousedown`,e,{capture:!0}),document.body.addEventListener(`focus`,e,{capture:!0})});function bn(e){let t=L(e),n=(0,a.useRef)(!1);(0,a.useEffect)(()=>(n.current=!1,()=>{n.current=!0,M(()=>{n.current&&t()})}),[t])}function xn(){let e=typeof document>`u`;return`useSyncExternalStore`in a&&(e=>e.useSyncExternalStore)(a)(()=>()=>{},()=>!1,()=>!e)}function Sn(){let e=xn(),[t,n]=a.useState(D.isHandoffComplete);return t&&D.isHandoffComplete===!1&&n(!1),a.useEffect(()=>{t!==!0&&n(!0)},[t]),a.useEffect(()=>D.handoff(),[]),!e&&t}var Cn=(0,a.createContext)(!1);function wn(){return(0,a.useContext)(Cn)}function Tn(e){return a.createElement(Cn.Provider,{value:e.force},e.children)}function En(e){let t=wn(),n=(0,a.useContext)(jn),[r,i]=(0,a.useState)(()=>{if(!t&&n!==null)return n.current??null;if(D.isServer)return null;let r=e?.getElementById(`headlessui-portal-root`);if(r)return r;if(e===null)return null;let i=e.createElement(`div`);return i.setAttribute(`id`,`headlessui-portal-root`),e.body.appendChild(i)});return(0,a.useEffect)(()=>{r!==null&&(e!=null&&e.body.contains(r)||e==null||e.body.appendChild(r))},[r,e]),(0,a.useEffect)(()=>{t||n!==null&&i(n.current)},[n,i,t]),r}var Dn=a.Fragment,On=H(function(e,t){let{ownerDocument:n=null,...r}=e,i=(0,a.useRef)(null),o=Me(je(e=>{i.current=e}),t),s=Kt(i.current),c=En(n??s),l=(0,a.useContext)(Nn),u=P(),d=Sn(),f=V();return bn(()=>{var e;c&&c.childNodes.length<=0&&((e=c.parentElement)==null||e.removeChild(c))}),!c||!d?null:(0,rn.createPortal)(a.createElement(`div`,{"data-headlessui-portal":``,ref:e=>{u.dispose(),l&&e&&u.add(l.register(e))}},f({ourProps:{ref:o},theirProps:r,slot:{},defaultTag:Dn,name:`Portal`})),c)});function kn(e,t){let n=Me(t),{enabled:r=!0,ownerDocument:i,...o}=e,s=V();return r?a.createElement(On,{...o,ownerDocument:i,ref:n}):s({ourProps:{ref:n},theirProps:o,slot:{},defaultTag:Dn,name:`Portal`})}var An=a.Fragment,jn=(0,a.createContext)(null);function Mn(e,t){let{target:n,...r}=e,i={ref:Me(t)},o=V();return a.createElement(jn.Provider,{value:n},o({ourProps:i,theirProps:r,defaultTag:An,name:`Popover.Group`}))}var Nn=(0,a.createContext)(null);function Pn(){let e=(0,a.useContext)(Nn),t=(0,a.useRef)([]),n=L(n=>(t.current.push(n),e&&e.register(n),()=>r(n))),r=L(n=>{let r=t.current.indexOf(n);r!==-1&&t.current.splice(r,1),e&&e.unregister(n)}),i=(0,a.useMemo)(()=>({register:n,unregister:r,portals:t}),[n,r,t]);return[t,(0,a.useMemo)(()=>function({children:e}){return a.createElement(Nn.Provider,{value:i},e)},[i])]}var Fn=H(kn),In=H(Mn),Ln=Object.assign(Fn,{Group:In});function Rn(e,t=typeof document<`u`?document.defaultView:null,n){let r=ht(e,`escape`);qt(t,`keydown`,e=>{r&&(e.defaultPrevented||e.key===Be.Escape&&n(e))})}function zn(){let[e]=(0,a.useState)(()=>typeof window<`u`&&typeof window.matchMedia==`function`?window.matchMedia(`(pointer: coarse)`):null),[t,n]=(0,a.useState)(e?.matches??!1);return F(()=>{if(!e)return;function t(e){n(e.matches)}return e.addEventListener(`change`,t),()=>e.removeEventListener(`change`,t)},[e]),t}function Bn({defaultContainers:e=[],portals:t,mainTreeNode:n}={}){let r=L(()=>{let r=O(n),i=[];for(let t of e)t!==null&&(xe(t)?i.push(t):`current`in t&&xe(t.current)&&i.push(t.current));if(t!=null&&t.current)for(let e of t.current)i.push(e);for(let e of r?.querySelectorAll(`html > *, body > *`)??[])e!==document.body&&e!==document.head&&xe(e)&&e.id!==`headlessui-portal-root`&&(n&&(e.contains(n)||e.contains(n?.getRootNode()?.host))||i.some(t=>e.contains(t))||i.push(e));return i});return{resolveContainers:r,contains:L(e=>r().some(t=>t.contains(e)))}}var Vn=(0,a.createContext)(null);function Hn({children:e,node:t}){let[n,r]=(0,a.useState)(null),i=Un(t??n);return a.createElement(Vn.Provider,{value:i},e,i===null&&a.createElement(ye,{features:_e.Hidden,ref:e=>{if(e){for(let t of O(e)?.querySelectorAll(`html > *, body > *`)??[])if(t!==document.body&&t!==document.head&&xe(t)&&t!=null&&t.contains(e)){r(t);break}}}}))}function Un(e=null){return(0,a.useContext)(Vn)??e}function Wn(){let e=(0,a.useRef)(!1);return F(()=>(e.current=!0,()=>{e.current=!1}),[]),e}var Gn=(e=>(e[e.Forwards=0]=`Forwards`,e[e.Backwards=1]=`Backwards`,e))(Gn||{});function Kn(){let e=(0,a.useRef)(0);return Ut(!0,`keydown`,t=>{t.key===`Tab`&&(e.current=+!!t.shiftKey)},!0),e}function qn(e){if(!e)return new Set;if(typeof e==`function`)return new Set(e());let t=new Set;for(let n of e.current)xe(n.current)&&t.add(n.current);return t}var Jn=`div`,Yn=(e=>(e[e.None=0]=`None`,e[e.InitialFocus=1]=`InitialFocus`,e[e.TabLock=2]=`TabLock`,e[e.FocusLock=4]=`FocusLock`,e[e.RestoreFocus=8]=`RestoreFocus`,e[e.AutoFocus=16]=`AutoFocus`,e))(Yn||{});function Xn(e,t){let n=(0,a.useRef)(null),r=Me(n,t),{initialFocus:i,initialFocusFallback:o,containers:s,features:c=15,...l}=e;Sn()||(c=0);let u=Kt(n.current);er(c,{ownerDocument:u});let d=tr(c,{ownerDocument:u,container:n,initialFocus:i,initialFocusFallback:o});nr(c,{ownerDocument:u,container:n,containers:s,previousActiveElement:d});let f=Kn(),p=L(e=>{if(!U(n.current))return;let t=n.current;(e=>e())(()=>{B(f.current,{[Gn.Forwards]:()=>{Rt(t,wt.First,{skipElements:[e.relatedTarget,o]})},[Gn.Backwards]:()=>{Rt(t,wt.Last,{skipElements:[e.relatedTarget,o]})}})})}),m=ht(!!(c&2),`focus-trap#tab-lock`),h=P(),g=(0,a.useRef)(!1),_={ref:r,onKeyDown(e){e.key==`Tab`&&(g.current=!0,h.requestAnimationFrame(()=>{g.current=!1}))},onBlur(e){if(!(c&4))return;let t=qn(s);U(n.current)&&t.add(n.current);let r=e.relatedTarget;Se(r)&&r.dataset.headlessuiFocusGuard!==`true`&&(rr(t,r)||(g.current?Rt(n.current,B(f.current,{[Gn.Forwards]:()=>wt.Next,[Gn.Backwards]:()=>wt.Previous})|wt.WrapAround,{relativeTo:e.target}):Se(e.target)&&Nt(e.target)))}},v=V();return a.createElement(a.Fragment,null,m&&a.createElement(ye,{as:`button`,type:`button`,"data-headlessui-focus-guard":!0,onFocus:p,features:_e.Focusable}),v({ourProps:_,theirProps:l,defaultTag:Jn,name:`FocusTrap`}),m&&a.createElement(ye,{as:`button`,type:`button`,"data-headlessui-focus-guard":!0,onFocus:p,features:_e.Focusable}))}var Zn=H(Xn),Qn=Object.assign(Zn,{features:Yn});function $n(e=!0){let t=(0,a.useRef)(yn.slice());return pn(([e],[n])=>{n===!0&&e===!1&&M(()=>{t.current.splice(0)}),n===!1&&e===!0&&(t.current=yn.slice())},[e,yn,t]),L(()=>t.current.find(e=>e!=null&&e.isConnected)??null)}function er(e,{ownerDocument:t}){let n=!!(e&8),r=$n(n);pn(()=>{n||j(t?.body)&&Nt(r())},[n]),bn(()=>{n&&Nt(r())})}function tr(e,{ownerDocument:t,container:n,initialFocus:r,initialFocusFallback:i}){let o=(0,a.useRef)(null),s=ht(!!(e&1),`focus-trap#initial-focus`),c=Wn();return pn(()=>{if(e===0)return;if(!s){i!=null&&i.current&&Nt(i.current);return}let a=n.current;a&&M(()=>{if(!c.current)return;let n=t?.activeElement;if(r!=null&&r.current){if(r?.current===n){o.current=n;return}}else if(a.contains(n)){o.current=n;return}if(r!=null&&r.current)Nt(r.current);else{if(e&16){if(Rt(a,wt.First|wt.AutoFocus)!==Tt.Error)return}else if(Rt(a,wt.First)!==Tt.Error)return;if(i!=null&&i.current&&(Nt(i.current),t?.activeElement===i.current))return;console.warn(`There are no focusable elements inside the <FocusTrap />`)}o.current=t?.activeElement})},[i,s,e]),o}function nr(e,{ownerDocument:t,container:n,containers:r,previousActiveElement:i}){let a=Wn(),o=!!(e&4);qt(t?.defaultView,`focus`,e=>{if(!o||!a.current)return;let t=qn(r);U(n.current)&&t.add(n.current);let s=i.current;if(!s)return;let c=e.target;U(c)?rr(t,c)?(i.current=c,Nt(c)):(e.preventDefault(),e.stopPropagation(),Nt(s)):Nt(i.current)},!0)}function rr(e,t){for(let n of e)if(n.contains(t))return!0;return!1}function ir(e){return!!(e.enter||e.enterFrom||e.enterTo||e.leave||e.leaveFrom||e.leaveTo)||!me(e.as??fr)||a.Children.count(e.children)===1}var ar=(0,a.createContext)(null);ar.displayName=`TransitionContext`;var or=(e=>(e.Visible=`visible`,e.Hidden=`hidden`,e))(or||{});function sr(){let e=(0,a.useContext)(ar);if(e===null)throw Error(`A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.`);return e}function cr(){let e=(0,a.useContext)(lr);if(e===null)throw Error(`A <Transition.Child /> is used but it is missing a parent <Transition /> or <Transition.Root />.`);return e}var lr=(0,a.createContext)(null);lr.displayName=`NestingContext`;function ur(e){return`children`in e?ur(e.children):e.current.filter(({el:e})=>e.current!==null).filter(({state:e})=>e===`visible`).length>0}function dr(e,t){let n=I(e),r=(0,a.useRef)([]),i=Wn(),o=P(),s=L((e,t=re.Hidden)=>{let a=r.current.findIndex(({el:t})=>t===e);a!==-1&&(B(t,{[re.Unmount](){r.current.splice(a,1)},[re.Hidden](){r.current[a].state=`hidden`}}),o.microTask(()=>{var e;!ur(r)&&i.current&&((e=n.current)==null||e.call(n))}))}),c=L(e=>{let t=r.current.find(({el:t})=>t===e);return t?t.state!==`visible`&&(t.state=`visible`):r.current.push({el:e,state:`visible`}),()=>s(e,re.Unmount)}),l=(0,a.useRef)([]),u=(0,a.useRef)(Promise.resolve()),d=(0,a.useRef)({enter:[],leave:[]}),f=L((e,n,r)=>{l.current.splice(0),t&&(t.chains.current[n]=t.chains.current[n].filter(([t])=>t!==e)),t?.chains.current[n].push([e,new Promise(e=>{l.current.push(e)})]),t?.chains.current[n].push([e,new Promise(e=>{Promise.all(d.current[n].map(([e,t])=>t)).then(()=>e())})]),n===`enter`?u.current=u.current.then(()=>t?.wait.current).then(()=>r(n)):r(n)}),p=L((e,t,n)=>{Promise.all(d.current[t].splice(0).map(([e,t])=>t)).then(()=>{var e;(e=l.current.shift())==null||e()}).then(()=>n(t))});return(0,a.useMemo)(()=>({children:r,register:c,unregister:s,onStart:f,onStop:p,wait:u,chains:d}),[c,s,r,f,p,d,u])}var fr=a.Fragment,pr=ne.RenderStrategy;function mr(e,t){var n;let{transition:r=!0,beforeEnter:i,afterEnter:o,beforeLeave:s,afterLeave:c,enter:l,enterFrom:u,enterTo:d,entered:f,leave:p,leaveFrom:m,leaveTo:h,...g}=e,[_,v]=(0,a.useState)(null),y=(0,a.useRef)(null),b=ir(e),x=Me(...b?[y,t,v]:t===null?[]:[t]),S=(n=g.unmount)==null||n?re.Unmount:re.Hidden,{show:C,appear:w,initial:T}=sr(),[E,D]=(0,a.useState)(C?`visible`:`hidden`),O=cr(),{register:k,unregister:A}=O;F(()=>k(y),[k,y]),F(()=>{if(S===re.Hidden&&y.current){if(C&&E!==`visible`){D(`visible`);return}return B(E,{hidden:()=>A(y),visible:()=>k(y)})}},[E,y,k,A,C,S]);let j=Sn();F(()=>{if(b&&j&&E===`visible`&&y.current===null)throw Error("Did you forget to passthrough the `ref` to the actual DOM node?")},[y,E,j,b]);let M=T&&!w,N=w&&C&&T,P=(0,a.useRef)(!1),I=dr(()=>{P.current||(D(`hidden`),A(y))},O),R=L(e=>{P.current=!0;let t=e?`enter`:`leave`;I.onStart(y,t,e=>{e===`enter`?i?.():e===`leave`&&s?.()})}),ee=L(e=>{let t=e?`enter`:`leave`;P.current=!1,I.onStop(y,t,e=>{e===`enter`?o?.():e===`leave`&&c?.()}),t===`leave`&&!ur(I)&&(D(`hidden`),A(y))});(0,a.useEffect)(()=>{b&&r||(R(C),ee(C))},[C,b,r]);let[,z]=cn(!(!r||!b||!j||M),_,C,{start:R,end:ee}),ne=ue({ref:x,className:te(g.className,N&&l,N&&u,z.enter&&l,z.enter&&z.closed&&u,z.enter&&!z.closed&&d,z.leave&&p,z.leave&&!z.closed&&m,z.leave&&z.closed&&h,!z.transition&&C&&f)?.trim()||void 0,...sn(z)}),ie=0;E===`visible`&&(ie|=G.Open),E===`hidden`&&(ie|=G.Closed),C&&E===`hidden`&&(ie|=G.Opening),!C&&E===`visible`&&(ie|=G.Closing);let ae=V();return a.createElement(lr.Provider,{value:I},a.createElement(gn,{value:ie},ae({ourProps:ne,theirProps:g,defaultTag:fr,features:pr,visible:E===`visible`,name:`Transition.Child`})))}function hr(e,t){let{show:n,appear:r=!1,unmount:i=!0,...o}=e,s=(0,a.useRef)(null),c=Me(...ir(e)?[s,t]:t===null?[]:[t]);Sn();let l=hn();if(n===void 0&&l!==null&&(n=(l&G.Open)===G.Open),n===void 0)throw Error("A <Transition /> is used but it is missing a `show={true | false}` prop.");let[u,d]=(0,a.useState)(n?`visible`:`hidden`),f=dr(()=>{n||d(`hidden`)}),[p,m]=(0,a.useState)(!0),h=(0,a.useRef)([n]);F(()=>{p!==!1&&h.current[h.current.length-1]!==n&&(h.current.push(n),m(!1))},[h,n]);let g=(0,a.useMemo)(()=>({show:n,appear:r,initial:p}),[n,r,p]);F(()=>{n?d(`visible`):!ur(f)&&s.current!==null&&d(`hidden`)},[n,f]);let _={unmount:i},v=L(()=>{var t;p&&m(!1),(t=e.beforeEnter)==null||t.call(e)}),y=L(()=>{var t;p&&m(!1),(t=e.beforeLeave)==null||t.call(e)}),b=V();return a.createElement(lr.Provider,{value:f},a.createElement(ar.Provider,{value:g},b({ourProps:{..._,as:a.Fragment,children:a.createElement(vr,{ref:c,..._,...o,beforeEnter:v,beforeLeave:y})},theirProps:{},defaultTag:a.Fragment,features:pr,visible:u===`visible`,name:`Transition`})))}function gr(e,t){let n=(0,a.useContext)(ar)!==null,r=hn()!==null;return a.createElement(a.Fragment,null,!n&&r?a.createElement(_r,{ref:t,...e}):a.createElement(vr,{ref:t,...e}))}var _r=H(hr),vr=H(mr),yr=H(gr),br=Object.assign(_r,{Child:yr,Root:_r}),xr=(e=>(e[e.Open=0]=`Open`,e[e.Closed=1]=`Closed`,e))(xr||{}),Sr=(e=>(e[e.SetTitleId=0]=`SetTitleId`,e))(Sr||{}),Cr={0(e,t){return e.titleId===t.id?e:{...e,titleId:t.id}}},wr=(0,a.createContext)(null);wr.displayName=`DialogContext`;function Tr(e){let t=(0,a.useContext)(wr);if(t===null){let t=Error(`<${e} /> is missing a parent <Dialog /> component.`);throw Error.captureStackTrace&&Error.captureStackTrace(t,Tr),t}return t}function Er(e,t){return B(t.type,Cr,e,t)}var Dr=H(function(e,t){let n=(0,a.useId)(),{id:r=`headlessui-dialog-${n}`,open:i,onClose:o,initialFocus:s,role:c=`dialog`,autoFocus:l=!0,__demoMode:u=!1,unmount:d=!1,...f}=e,p=(0,a.useRef)(!1);c=function(){return c===`dialog`||c===`alertdialog`?c:(p.current||(p.current=!0,console.warn(`Invalid role [${c}] passed to <Dialog />. Only \`dialog\` and and \`alertdialog\` are supported. Using \`dialog\` instead.`)),`dialog`)}();let m=hn();i===void 0&&m!==null&&(i=(m&G.Open)===G.Open);let h=(0,a.useRef)(null),g=Me(h,t),_=Kt(h.current),v=+!i,[y,b]=(0,a.useReducer)(Er,{titleId:null,descriptionId:null,panelRef:(0,a.createRef)()}),x=L(()=>o(!1)),S=L(e=>b({type:0,id:e})),C=Sn()?v===0:!1,[w,T]=Pn(),E={get current(){return y.panelRef.current??h.current}},D=Un(),{resolveContainers:O}=Bn({mainTreeNode:D,portals:w,defaultContainers:[E]}),k=m!==null&&(m&G.Closing)===G.Closing;bt(u||k?!1:C,{allowed:L(()=>[h.current?.closest(`[data-headlessui-portal]`)??null]),disallowed:L(()=>[D?.closest(`body > *:not(#headlessui-portal-root)`)??null])});let A=ut.get(null);F(()=>{if(C)return A.actions.push(r),()=>A.actions.pop(r)},[A,r,C]);let j=pt(A,(0,a.useCallback)(e=>A.selectors.isTop(e,r),[A,r]));Gt(j,O,e=>{e.preventDefault(),x()}),Rn(j,_?.defaultView,e=>{e.preventDefault(),e.stopPropagation(),document.activeElement&&`blur`in document.activeElement&&typeof document.activeElement.blur==`function`&&document.activeElement.blur(),x()}),nn(u||k?!1:C,_,O),xt(C,h,x);let[M,N]=Fe(),P=(0,a.useMemo)(()=>[{dialogState:v,close:x,setTitleId:S,unmount:d},y],[v,x,S,d,y]),I=R({open:v===0}),ee={ref:g,id:r,role:c,tabIndex:-1,"aria-modal":u?void 0:v===0||void 0,"aria-labelledby":y.titleId,"aria-describedby":M,unmount:d},z=!zn(),te=Yn.None;C&&!u&&(te|=Yn.RestoreFocus,te|=Yn.TabLock,l&&(te|=Yn.AutoFocus),z&&(te|=Yn.InitialFocus));let B=V();return a.createElement(_n,null,a.createElement(Tn,{force:!0},a.createElement(Ln,null,a.createElement(wr.Provider,{value:P},a.createElement(In,{target:h},a.createElement(Tn,{force:!1},a.createElement(N,{slot:I},a.createElement(T,null,a.createElement(Qn,{initialFocus:s,initialFocusFallback:h,containers:O,features:te},a.createElement(He,{value:x},B({ourProps:ee,theirProps:f,slot:I,defaultTag:Or,features:kr,visible:v===0,name:`Dialog`})))))))))))}),Or=`div`,kr=ne.RenderStrategy|ne.Static;function Ar(e,t){let{transition:n=!1,open:r,...i}=e,o=hn(),s=e.hasOwnProperty(`open`)||o!==null,c=e.hasOwnProperty(`onClose`);if(!s&&!c)throw Error("You have to provide an `open` and an `onClose` prop to the `Dialog` component.");if(!s)throw Error("You provided an `onClose` prop to the `Dialog`, but forgot an `open` prop.");if(!c)throw Error("You provided an `open` prop to the `Dialog`, but forgot an `onClose` prop.");if(!o&&typeof e.open!=`boolean`)throw Error(`You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${e.open}`);if(typeof e.onClose!=`function`)throw Error(`You provided an \`onClose\` prop to the \`Dialog\`, but the value is not a function. Received: ${e.onClose}`);return(r!==void 0||n)&&!i.static?a.createElement(Hn,null,a.createElement(br,{show:r,transition:n,unmount:i.unmount},a.createElement(Dr,{ref:t,...i}))):a.createElement(Hn,null,a.createElement(Dr,{ref:t,open:r,...i}))}var jr=`div`;function Mr(e,t){let n=(0,a.useId)(),{id:r=`headlessui-dialog-panel-${n}`,transition:i=!1,...o}=e,[{dialogState:s,unmount:c},l]=Tr(`Dialog.Panel`),u=Me(t,l.panelRef),d=R({open:s===0}),f={ref:u,id:r,onClick:L(e=>{e.stopPropagation()})},p=i?yr:a.Fragment,m=i?{unmount:c}:{},h=V();return a.createElement(p,{...m},h({ourProps:f,theirProps:o,slot:d,defaultTag:jr,name:`Dialog.Panel`}))}var Nr=`div`;function Pr(e,t){let{transition:n=!1,...r}=e,[{dialogState:i,unmount:o}]=Tr(`Dialog.Backdrop`),s=R({open:i===0}),c={ref:t,"aria-hidden":!0},l=n?yr:a.Fragment,u=n?{unmount:o}:{},d=V();return a.createElement(l,{...u},d({ourProps:c,theirProps:r,slot:s,defaultTag:Nr,name:`Dialog.Backdrop`}))}var Fr=`h2`;function Ir(e,t){let n=(0,a.useId)(),{id:r=`headlessui-dialog-title-${n}`,...i}=e,[{dialogState:o,setTitleId:s}]=Tr(`Dialog.Title`),c=Me(t);(0,a.useEffect)(()=>(s(r),()=>s(null)),[r,s]);let l=R({open:o===0}),u={ref:c,id:r};return V()({ourProps:u,theirProps:i,slot:l,defaultTag:Fr,name:`Dialog.Title`})}var Lr=H(Ar),Rr=H(Mr),zr=H(Pr),Br=H(Ir),Vr=Object.assign(Lr,{Panel:Rr,Title:Br,Description:ze}),K=r();function Hr(e){let t=e.replace(`#`,``);(t.length===3||t.length===4)&&(t=t.split(``).map(e=>e+e).join(``));let n=t.length>=8?parseInt(t.slice(6,8),16)/255:1;return[parseInt(t.slice(0,2),16)/255,parseInt(t.slice(2,4),16)/255,parseInt(t.slice(4,6),16)/255,n]}function Ur(e,t,n){e/=255,t/=255,n/=255;let r=Math.max(e,t,n),i=r-Math.min(e,t,n),a=0,o=r===0?0:i/r;return i!==0&&(a=r===e?((t-n)/i+6)%6:r===t?(n-e)/i+2:(e-t)/i+4,a/=6),[a,o,r]}function Wr(e,t,n){let r=Math.floor(e*6),i=e*6-r,a=n*(1-t),o=n*(1-i*t),s=n*(1-(1-i)*t),c=0,l=0,u=0;switch(r%6){case 0:c=n,l=s,u=a;break;case 1:c=o,l=n,u=a;break;case 2:c=a,l=n,u=s;break;case 3:c=a,l=o,u=n;break;case 4:c=s,l=a,u=n;break;case 5:c=n,l=a,u=o}return[Math.round(c*255),Math.round(l*255),Math.round(u*255)]}var Gr=66,Kr=66,qr=1500,Jr=1,Yr=16,Xr=96,Zr=2,Qr={colorBack:`#00000000`,speed:1,repetition:1.5,softness:.05,shiftRed:.3,shiftBlue:.3,distortion:.1,contour:.4,angle:90,shape:0,scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0,fit:1},$r={chromatic:{name:`chromatic`,modes:{dark:{...Qr,colorTint:`#88ccff2e`,shiftRed:.75,shiftBlue:.75,repetition:2,softness:.09,shaderOpacity:1},light:{...Qr,colorTint:`#66b0ff99`,shiftRed:.6,shiftBlue:.6,shaderOpacity:1}}},silver:{name:`silver`,modes:{dark:{...Qr,colorTint:`#ffffff66`,shaderOpacity:.88},light:{...Qr,colorTint:`#ffffff40`,shaderOpacity:1}}},gold:{name:`gold`,modes:{dark:{...Qr,colorTint:`#ffcc55cc`,speed:.85,shaderOpacity:.92},light:{...Qr,colorTint:`#f7d488aa`,shaderOpacity:1}}}},ei=`#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorTint;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;

uniform float u_shape;
uniform bool u_isImage;

in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_imageUV;

out vec4 fragColor;


#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846


vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}


vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}


float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {

  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  if (u_isImage == true) {
    bump = smoothstep(.2, .8, bump);
  }
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));

  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 2.8;
  float t = .3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  if (u_isImage == false) {
    uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
  }

  float cycleWidth = u_repetition;
  float edge = 0.;
  float contOffset = 1.;

  vec2 rotatedUV = uv - vec2(.5);
  float angle = (-u_angle + 70.) * PI / 180.;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(
  rotatedUV.x * cosA - rotatedUV.y * sinA,
  rotatedUV.x * sinA + rotatedUV.y * cosA
  ) + vec2(.5);

  if (u_isImage == true) {
    float edgeRaw = img.r;
    edge = blurEdge3x3(u_image, uv, dudx, dudy, 6., edgeRaw);
    edge = pow(edge, 1.6);
    edge *= mix(0.0, 1.0, smoothstep(0.0, 0.4, u_contour));
  } else {
    if (u_shape < 1.) {
      // full-fill on canvas
      vec2 borderUV = v_responsiveUV + .5;
      float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = min(250. / v_responsiveBoxGivenSize, vec2(.5));
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);

      uv = v_responsiveUV;
      if (ratio > 1.) {
        uv.y /= ratio;
      } else {
        uv.x *= ratio;
      }
      uv += .5;
      uv.y = 1. - uv.y;

      cycleWidth *= 2.;
      contOffset = 1.5;

    } else if (u_shape < 2.) {
      // circle
      vec2 shapeUV = uv - .5;
      shapeUV *= .67;
      edge = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
    } else if (u_shape < 3.) {
      // daisy
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.68;

      float r = length(shapeUV) * 2.;
      float a = atan(shapeUV.y, shapeUV.x) + .2;
      r *= (1. + .05 * sin(3. * a + 2. * t));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;

      uv *= .8;
      cycleWidth *= 1.6;

    } else if (u_shape < 4.) {
      // diamond
      vec2 shapeUV = uv - .5;
      shapeUV = rotate(shapeUV, .25 * PI);
      shapeUV *= 1.42;
      shapeUV += .5;
      vec2 mask = min(shapeUV, 1. - shapeUV);
      vec2 pixel_thickness = vec2(.15);
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 5.) {
      // metaballs
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.3;
      edge = 0.;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 1.5 + 2./3. * sin(fi * 12.345);
        float angle = -fi * 1.5;
        vec2 dir1 = vec2(cos(angle), sin(angle));
        vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
        vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    edge = mix(smoothstep(.9 - 2. * fwidth(edge), .9, edge), edge, smoothstep(0.0, 0.4, u_contour));

  }

  float opacity = 0.;
  if (u_isImage == true) {
    opacity = img.g;
    float frame = getImgFrame(v_imageUV, 0.);
    opacity *= frame;
  } else {
    opacity = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    if (u_shape < 2.) {
      edge = 1.2 * edge;
    } else if (u_shape < 5.) {
      edge = 1.8 * pow(edge, 1.5);
    }
  }

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  edge += (1. - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  float contour = 0.;
  direction -= 2. * noise * diagBLtoTR * (smoothstep(0., 1., edge) * (1.0 - smoothstep(0., 1., edge)));
  direction *= mix(1., 1. - edge, smoothstep(.5, 1., u_contour));
  direction -= 1.7 * edge * smoothstep(.5, 1., u_contour);
  direction += .2 * pow(u_contour, 4.) * (1.0 - smoothstep(0., 1., edge));

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - edge) * bump);

  direction *= (.4 + .6 * (1.0 - smoothstep(.5, 1., edge)));
  direction += .18 * (smoothstep(.1, .2, uv.y) * (1.0 - smoothstep(.2, .4, uv.y)));
  direction += .03 * (smoothstep(.1, .2, 1. - uv.y) * (1.0 - smoothstep(.2, .4, 1. - uv.y)));

  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);
  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  dispersionRed += 5. * (smoothstep(-.1, .2, uv.y) * (1.0 - smoothstep(.1, .5, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, 1., bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion;
  dispersionBlue *= 1.3;
  dispersionBlue += (smoothstep(0., .4, uv.y) * (1.0 - smoothstep(.1, .8, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, .8, bump)));
  dispersionBlue -= .2 * edge;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = 0.;
  float rExtraBlur = 0.;
  float gExtraBlur = 0.;
  if (u_isImage == true) {
    float softness = 0.05 * u_softness;
    blur = softness + .5 * smoothstep(1., 10., u_repetition) * smoothstep(.0, 1., edge);
    float smallCanvasT = 1.0 - smoothstep(100., 500., min(u_resolution.x, u_resolution.y));
    blur += smallCanvasT * smoothstep(.0, 1., edge);
    rExtraBlur = softness * (0.05 + .1 * (u_shiftRed / 20.) * bump);
    gExtraBlur = softness * 0.05 / max(0.001, abs(1. - diagBLtoTR));
  } else {
    blur = u_softness / 15. + .3 * contour;
  }

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bump);
  float stripe_r = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r) + rExtraBlur, bump, u_colorTint.r);
  float stripe_g = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g) + gExtraBlur, bump, u_colorTint.g);
  float stripe_b = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);


  fragColor = vec4(color, opacity);
}
`,ti=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`,ni=ei;function ri(e,t,n){let r=e.createShader(t);if(!r)throw Error(`metal-fx: gl.createShader returned null`);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r);throw e.deleteShader(r),Error(`metal-fx: shader compile failed: ${t??`(no info log)`}`)}return r}function ii(e,t,n){let r=e.createProgram();if(!r)throw Error(`metal-fx: gl.createProgram returned null`);if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS)){let t=e.getProgramInfoLog(r);throw e.deleteProgram(r),Error(`metal-fx: program link failed: ${t??`(no info log)`}`)}return r}var ai=140,oi=40,si=1.6,ci=1.3,q=null,li=null;function ui(){var e;if(li!==null)return li;if(typeof document>`u`)return li=!1;try{let t=document.createElement(`canvas`).getContext(`webgl2`);li=!!t,(e=t?.getExtension(`WEBGL_lose_context`))==null||e.loseContext()}catch{li=!1}return li}var di=null;function fi(e){di=e}var pi=[`u_resolution`,`u_time`,`u_pixelRatio`,`u_colorBack`,`u_colorTint`,`u_repetition`,`u_softness`,`u_shiftRed`,`u_shiftBlue`,`u_distortion`,`u_contour`,`u_angle`,`u_shape`,`u_isImage`,`u_image`,`u_originX`,`u_originY`,`u_worldWidth`,`u_worldHeight`,`u_fit`,`u_scale`,`u_rotation`,`u_offsetX`,`u_offsetY`,`u_imageAspectRatio`];function mi(e){e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA);let t=ii(e,ri(e,e.VERTEX_SHADER,ti),ri(e,e.FRAGMENT_SHADER,ni));e.useProgram(t);let n=e.createBuffer();if(!n)throw Error(`metal-fx: gl.createBuffer returned null`);e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),e.STATIC_DRAW);let r=e.getAttribLocation(t,`a_position`);e.enableVertexAttribArray(r),e.vertexAttribPointer(r,2,e.FLOAT,!1,0,0);let i={};for(let n of pi)i[n]=e.getUniformLocation(t,n);let a=e.createTexture();return a&&(e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,a),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),i.u_image&&e.uniform1i(i.u_image,0)),{program:t,buffer:n,uniforms:i,dummyTexture:a}}function hi(){if(q)return q;let e=Math.min(Zr,typeof window<`u`&&window.devicePixelRatio||1),t=Math.round(Xr*e),n=typeof OffscreenCanvas<`u`,r,i;if(n)r=new OffscreenCanvas(t,t),i=r.getContext(`webgl2`,{alpha:!0,premultipliedAlpha:!0,antialias:!1});else{let e=document.createElement(`canvas`);e.width=t,e.height=t,i=e.getContext(`webgl2`,{alpha:!0,premultipliedAlpha:!0,antialias:!1,preserveDrawingBuffer:!0}),r=e}if(!i)throw Error(`metal-fx: WebGL2 not supported`);let{program:a,buffer:o,uniforms:s,dummyTexture:c}=mi(i);return r.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),q&&(q.contextLost=!0)},!1),r.addEventListener(`webglcontextrestored`,()=>{if(!q)return;let e=mi(q.gl);q.program=e.program,q.buffer=e.buffer,q.uniforms=e.uniforms,q.dummyTexture=e.dummyTexture,q.presetDirty=!0,q.contextLost=!1,di?.()},!1),q={glCanvas:r,gl:i,program:a,buffer:o,uniforms:s,dummyTexture:c,preset:$r.chromatic.modes.dark,presetDirty:!0,contextLost:!1,useOffscreen:n,frameBitmap:null,startMs:performance.now(),pausedMs:0,pausedAtMs:null,rafId:0,dpr:e,instances:new Set,frameCount:0,glowQueue:[],glowIdx:0,glowSkip:0,glowPixels:new Uint8Array(t*t*4),glowPixelsW:t,glowPixelsH:t},q}function gi(){var e;if(!q)return;let{gl:t,program:n,buffer:r,frameBitmap:i,dummyTexture:a}=q;try{i?.close(),t.deleteBuffer(r),t.deleteProgram(n),a&&t.deleteTexture(a),(e=t.getExtension(`WEBGL_lose_context`))==null||e.loseContext()}catch{}q=null}var _i=0;function vi(){if(!q)return;let e=performance.now();if(e-_i<qr)return;_i=e;let{gl:t,glCanvas:n}=q,r=n.width,i=n.height;(q.glowPixelsW!==r||q.glowPixelsH!==i)&&(q.glowPixelsW=r,q.glowPixelsH=i,q.glowPixels=new Uint8Array(r*i*4)),t.readPixels(0,0,r,i,t.RGBA,t.UNSIGNED_BYTE,q.glowPixels)}var yi={bx:0,by:0};function bi(e,t,n){if(!q)return yi.bx=0,yi.by=0,yi;let{glCanvas:r}=q,i=r.width,a=r.height,o=e.dpr,s=e.cssWidth*o,c=e.cssHeight*o,l=ai*o,u=oi*o,d=i/l*s/e.shaderScale,f=a/u*c/e.shaderScale;d>i&&(d=i),f>a&&(f=a);let p=(i-d)/2,m=(a-f)/2,h=p+t/e.cssWidth*d,g=m+n/e.cssHeight*f;return yi.bx=Math.round(h),yi.by=Math.round(a-1-g),yi}var xi={r:0,g:0,b:0,lum:0,count:0};function Si(e,t,n,r,i,a){let o=Math.max(1,a|0),s=Math.max(0,r-o),c=Math.min(t,r+o+1),l=Math.max(0,i-o),u=Math.min(n,i+o+1);xi.r=0,xi.g=0,xi.b=0,xi.lum=0,xi.count=0;for(let n=l;n<u;n++){let r=n*t;for(let t=s;t<c;t++){let n=(r+t)*4;xi.r+=e[n],xi.g+=e[n+1],xi.b+=e[n+2],xi.lum+=(.2126*e[n]+.7152*e[n+1]+.0722*e[n+2])/255,xi.count++}}return xi}var J={r:255,g:255,b:255};function Ci(e,t,n,r){if(!q)return 0;let i=bi(e,t,n),a=Si(q.glowPixels,q.glowPixelsW,q.glowPixelsH,i.bx,i.by,r);return a.count>0?a.lum/a.count:0}function wi(e,t,n,r){if(!q)return J.r=255,J.g=255,J.b=255,J;let i=bi(e,t,n),a=Si(q.glowPixels,q.glowPixelsW,q.glowPixelsH,i.bx,i.by,r);return a.count===0?(J.r=255,J.g=255,J.b=255,J):(J.r=a.r/a.count,J.g=a.g/a.count,J.b=a.b/a.count,J)}function Ti(e,t,n,r){if(!q)return J.r=255,J.g=255,J.b=255,J;let i=bi(e,t,n),{glowPixels:a,glowPixelsW:o,glowPixelsH:s}=q,c=Math.max(1,r|0),l=Math.max(0,i.bx-c),u=Math.min(o,i.bx+c+1),d=Math.max(0,i.by-c),f=Math.min(s,i.by+c+1),p=-1;J.r=255,J.g=255,J.b=255;for(let e=d;e<f;e++){let t=e*o;for(let e=l;e<u;e++){let n=(t+e)*4,r=a[n],i=a[n+1],o=a[n+2],s=Math.max(r,i,o),c=(s>0?(s-Math.min(r,i,o))/s:0)*(.35+s/255*.65);c>p&&(p=c,J.r=r,J.g=i,J.b=o)}}return J}var Ei=14,Di=1.5,Oi={x:0,y:0};function ki(e=512){return{xy:new Float32Array(e*2),n:0}}function Ai(e,t,n,r,i,a,o=ki()){i=Math.max(0,Math.min(i,Math.min(n,r)/2));let s=60+Math.ceil(2*(n+r)/Di)+8;o.xy.length<s*2&&(o.xy=new Float32Array(s*2));let c=o.xy,l=0,u=(e,t)=>{a?(a(e,t,Oi),c[l*2]=Oi.x,c[l*2+1]=Oi.y):(c[l*2]=e,c[l*2+1]=t),l++},d=(e,t,n,r)=>{let i=Math.hypot(n-e,r-t),a=Math.max(1,Math.ceil(i/Di));for(let i=0;i<a;i++){let o=i/a;u(e+(n-e)*o,t+(r-t)*o)}},f=(e,t,n,r)=>{for(let a=0;a<=Ei;a++){let o=n+(r-n)*(a/Ei);u(e+i*Math.cos(o),t+i*Math.sin(o))}};return d(e+i,t,e+n-i,t),f(e+n-i,t+i,-Math.PI/2,0),d(e+n,t+i,e+n,t+r-i),f(e+n-i,t+r-i,0,Math.PI/2),d(e+n-i,t+r,e+i,t+r),f(e+i,t+r-i,Math.PI/2,Math.PI),d(e,t+r-i,e,t+i),f(e+i,t+i,Math.PI,1.5*Math.PI),o.n=l,o}fi(()=>{q&&q.instances.size>0&&q.pausedAtMs===null&&$i()}),typeof document<`u`&&document.addEventListener(`visibilitychange`,()=>{!q||q.pausedAtMs!==null||q.contextLost||(document.hidden?ea():q.instances.size>0&&$i())});function ji(e){let t=hi(),n=e.hostCanvas.getContext(`2d`,{alpha:!0});if(!n)throw Error(`metal-fx: canvas 2D context unavailable`);let r=e.scale??1,i={canvas:e.hostCanvas,ctx:n,cssWidth:e.cssWidth,cssHeight:e.cssHeight,cornerRadius:e.cornerRadius,kind:e.kind,ringCssPx:e.ringCssPx??(e.kind===`circle`?2:1)*r,shaderScale:e.shaderScale??(e.kind===`circle`?ci:si)*r,opacityMul:e.opacityMul??1,glowGain:e.glowGain??1,visible:!0,paused:e.paused??!1,everCopied:!1,frozen:null,dpr:typeof window<`u`&&window.devicePixelRatio||1,scale:r,onAfterFrame:e.onAfterFrame,onComposite:e.onComposite,onFirstCopy:e.onFirstCopy,mask:e.mask??null,deform:null,deformLayers:null,overscan:0,cursorLight:null,glowFast:!1,rawCanvas:null,wantRaw:!1,ringCanvas:null,wantRing:!1};return Ui(i),t.instances.add(i),t.rafId===0&&t.pausedAtMs===null&&$i(),i}function Mi(e){if(!q)return;q.instances.delete(e);let t=q.glowQueue.indexOf(e);t!==-1&&q.glowQueue.splice(t,1),q.instances.size===0&&(ea(),gi())}function Ni(e){q&&(q.glowQueue.includes(e)||q.glowQueue.push(e))}function Pi(e){if(!q)return;let t=q.glowQueue.indexOf(e);t!==-1&&q.glowQueue.splice(t,1)}function Fi(e,t){let n=!1;t.mask!==void 0&&(e.mask=t.mask),t.cssWidth!==void 0&&t.cssWidth!==e.cssWidth&&(e.cssWidth=t.cssWidth,n=!0),t.cssHeight!==void 0&&t.cssHeight!==e.cssHeight&&(e.cssHeight=t.cssHeight,n=!0),t.cornerRadius!==void 0&&(e.cornerRadius=t.cornerRadius),t.scale!==void 0&&(e.scale=t.scale),t.kind!==void 0&&t.kind!==e.kind&&(e.kind=t.kind,t.shaderScale===void 0&&(e.shaderScale=(t.kind===`circle`?ci:si)*e.scale),t.ringCssPx===void 0&&(e.ringCssPx=(t.kind===`circle`?2:1)*e.scale)),t.shaderScale!==void 0&&(e.shaderScale=t.shaderScale),t.ringCssPx!==void 0&&(e.ringCssPx=t.ringCssPx),t.opacityMul!==void 0&&(e.opacityMul=t.opacityMul),t.glowGain!==void 0&&(e.glowGain=t.glowGain),t.paused!==void 0&&t.paused!==e.paused&&(e.paused=t.paused,t.paused?qi(e):e.frozen=null,!t.paused&&q&&q.rafId===0&&q.pausedAtMs===null&&!q.contextLost&&$i()),n&&Ui(e)}function Ii(e,t){e.visible=t,t&&q&&q.rafId===0&&q.pausedAtMs===null&&!q.contextLost&&$i()}function Li(e){return(typeof window<`u`&&window.devicePixelRatio||1)!==e.dpr&&(Ui(e),Ji(e),!0)}var Ri=null;function zi(e,t){let n=hi();n.preset=Ri??$r[e].modes[t],n.presetDirty=!0}var Bi=null;function Vi(e){Bi=e}function Hi(e,t){!Bi||!q||!e.visible||e.paused||q.glowQueue.includes(e)&&(e.glowFast=!!Bi(e,t))}function Ui(e){e.dpr=typeof window<`u`&&window.devicePixelRatio||1;let t=e.overscan,n=Math.max(1,Math.round((e.cssWidth+2*t)*e.dpr)),r=Math.max(1,Math.round((e.cssHeight+2*t)*e.dpr));e.canvas.width!==n&&(e.canvas.width=n),e.canvas.height!==r&&(e.canvas.height=r);let i=e.canvas.style;t>0?(i.left=`${-t}px`,i.top=`${-t}px`,i.width=`calc(100% + ${2*t}px)`,i.height=`calc(100% + ${2*t}px)`,i.borderRadius=`0`):i.left!==``&&(i.left=``,i.top=``,i.width=`100%`,i.height=`100%`,i.borderRadius=``)}function Wi(e){let{ctx:t,dpr:n,canvas:r}=e,i=e.ringCssPx*n,a=r.width,o=r.height,s=Math.max(0,(e.cornerRadius-e.ringCssPx)*n);t.save(),t.globalCompositeOperation=`destination-out`,t.fillStyle=`#000`,t.beginPath(),t.roundRect(i,i,a-2*i,o-2*i,s),t.fill(),t.restore()}var Gi=ki();function Ki(e,t,n,r,i,a,o,s){let{xy:c,n:l}=Ai(t,n,r,i,a,o,Gi);e.beginPath();for(let t=0;t<l;t++)t===0?e.moveTo(c[0]*s,c[1]*s):e.lineTo(c[t*2]*s,c[t*2+1]*s);e.closePath()}function qi(e){if(!q)return null;let t=q.frameBitmap??q.glCanvas,n=q.glCanvas.width,r=q.glCanvas.height;if(n<1||r<1)return null;let i=e.frozen;i||(i=document.createElement(`canvas`),e.frozen=i),(i.width!==n||i.height!==r)&&(i.width=n,i.height=r);let a=i.getContext(`2d`);return a?(a.clearRect(0,0,n,r),a.drawImage(t,0,0),i):(e.frozen=null,null)}function Ji(e){var t,n;if(!q)return;let r=(e.paused?e.frozen??qi(e):null)??q.frameBitmap??q.glCanvas,i=e.dpr,a=e.canvas.width,o=e.canvas.height;if(a<1||o<1)return;let s=Math.max(1,Math.round(e.cssWidth*i)),c=Math.max(1,Math.round(e.cssHeight*i)),l=e.overscan*i,u=r.width,d=r.height,f=ai*i,p=oi*i,m=u/f*s/e.shaderScale,h=d/p*c/e.shaderScale;m>u&&(m=u),h>d&&(h=d);let g=Math.max(0,(u-m)/2),_=Math.max(0,(d-h)/2),v=e.opacityMul*q.preset.shaderOpacity,y=e.ctx;y.clearRect(0,0,a,o);let b=e.deform;if(e.mask){if(v<1&&(y.globalAlpha=v),y.drawImage(r,g,_,m,h,0,0,a,o),v<1&&(y.globalAlpha=1),e.wantRaw){let t=e.rawCanvas;t||(t=document.createElement(`canvas`),e.rawCanvas=t),(t.width!==a||t.height!==o)&&(t.width=a,t.height=o);let n=t.getContext(`2d`);n&&(n.clearRect(0,0,a,o),n.drawImage(e.canvas,0,0))}y.save(),y.globalCompositeOperation=`destination-in`,y.fillStyle=`#000`,e.mask(y,a,o,i),y.restore(),y.globalCompositeOperation=`source-over`}else if(!b)v<1&&(y.globalAlpha=v),y.drawImage(r,g,_,m,h,0,0,a,o),v<1&&(y.globalAlpha=1),Wi(e);else{let t=e.cssWidth,n=e.cssHeight,f=e.cornerRadius,p=e.ringCssPx,g=e.deformLayers;y.save(),y.translate(l,l);let _=s/m,x=c/h,S=Math.min(u,m*(s+2*l)/s),C=Math.min(d,h*(c+2*l)/c),w=Math.max(0,(u-S)/2),T=Math.max(0,(d-C)/2),E=S*_,D=C*x;if(v<1&&(y.globalAlpha=v),y.drawImage(r,w,T,S,C,s/2-E/2,c/2-D/2,E,D),v<1&&(y.globalAlpha=1),y.globalCompositeOperation=`destination-in`,Ki(y,0,0,t,n,f,b,i),y.fillStyle=`#000`,y.fill(),y.globalCompositeOperation=`destination-out`,Ki(y,p,p,t-2*p,n-2*p,Math.max(0,f-p),b,i),y.fill(),e.wantRing){let u=e.ringCanvas;u||(u=document.createElement(`canvas`),e.ringCanvas=u),(u.width!==a||u.height!==o)&&(u.width=a,u.height=o);let d=u.getContext(`2d`);d&&(d.setTransform(1,0,0,1,0,0),d.globalCompositeOperation=`source-over`,d.clearRect(0,0,a,o),d.translate(l,l),v<1&&(d.globalAlpha=v),d.drawImage(r,w,T,S,C,s/2-E/2,c/2-D/2,E,D),d.globalAlpha=1,d.globalCompositeOperation=`destination-out`,Ki(d,p,p,t-2*p,n-2*p,Math.max(0,f-p),b,i),d.fillStyle=`#000`,d.fill(),d.globalCompositeOperation=`source-over`,d.setTransform(1,0,0,1,0,0))}if(g!=null&&g.hairline){let e=g.hairline;y.globalCompositeOperation=`destination-over`,Ki(y,e.inset,e.inset,t-2*e.inset,n-2*e.inset,Math.max(0,f-e.inset),b,i),y.lineWidth=e.width*i,y.strokeStyle=e.color,y.stroke()}if(g!=null&&g.fill&&(y.globalCompositeOperation=`destination-over`,Ki(y,0,0,t,n,f,b,i),y.fillStyle=g.fill,y.fill()),g!=null&&g.rim){let e=g.rim;y.globalCompositeOperation=`source-over`,y.save(),Ki(y,0,0,t,n,f,b,i),y.clip();let r=e.inset+e.width/2;Ki(y,r,r,t-2*r,n-2*r,Math.max(0,f-r),b,i),y.lineWidth=e.width*i,y.strokeStyle=e.color,y.stroke(),y.restore()}y.restore(),y.globalCompositeOperation=`source-over`}if((t=e.onComposite)==null||t.call(e),e.onFirstCopy){let t=e.onFirstCopy;e.onFirstCopy=void 0,t()}(n=e.onAfterFrame)==null||n.call(e)}function Yi(){if(!q)return;let{gl:e,uniforms:t,preset:n,glCanvas:r,dpr:i}=q;t.u_resolution&&e.uniform2f(t.u_resolution,r.width,r.height),t.u_pixelRatio&&e.uniform1f(t.u_pixelRatio,i),t.u_colorBack&&e.uniform4fv(t.u_colorBack,Hr(n.colorBack)),t.u_colorTint&&e.uniform4fv(t.u_colorTint,Hr(n.colorTint)),t.u_repetition&&e.uniform1f(t.u_repetition,n.repetition),t.u_softness&&e.uniform1f(t.u_softness,n.softness),t.u_shiftRed&&e.uniform1f(t.u_shiftRed,n.shiftRed),t.u_shiftBlue&&e.uniform1f(t.u_shiftBlue,n.shiftBlue),t.u_distortion&&e.uniform1f(t.u_distortion,n.distortion),t.u_contour&&e.uniform1f(t.u_contour,n.contour),t.u_angle&&e.uniform1f(t.u_angle,n.angle),t.u_shape&&e.uniform1f(t.u_shape,n.shape),t.u_isImage&&e.uniform1i(t.u_isImage,0),t.u_imageAspectRatio&&e.uniform1f(t.u_imageAspectRatio,1),t.u_originX&&e.uniform1f(t.u_originX,n.originX),t.u_originY&&e.uniform1f(t.u_originY,n.originY),t.u_worldWidth&&e.uniform1f(t.u_worldWidth,n.worldWidth),t.u_worldHeight&&e.uniform1f(t.u_worldHeight,n.worldHeight),t.u_fit&&e.uniform1f(t.u_fit,n.fit),t.u_scale&&e.uniform1f(t.u_scale,n.scale),t.u_rotation&&e.uniform1f(t.u_rotation,n.rotation),t.u_offsetX&&e.uniform1f(t.u_offsetX,n.offsetX),t.u_offsetY&&e.uniform1f(t.u_offsetY,n.offsetY),q.presetDirty=!1}function Xi(e){if(!q)return;let{gl:t,uniforms:n,preset:r,glCanvas:i}=q,a=(e-q.startMs-q.pausedMs)/1e3*r.speed;t.viewport(0,0,i.width,i.height),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT),q.presetDirty&&Yi(),n.u_time&&t.uniform1f(n.u_time,a),t.drawArrays(t.TRIANGLES,0,6),q.frameCount++}var Zi=0;function Qi(e){var t;if(!q)return;if(q.contextLost){q.rafId=0;return}let n=!1;for(let e of q.instances)if(e.visible&&(!e.paused||!e.everCopied)){n=!0;break}if(!n)q.rafId=0;else if(q.rafId=requestAnimationFrame(Qi),e-Zi<Gr){if(Bi)for(let t of q.glowQueue)t.glowFast&&t.visible&&!t.paused&&(t.glowFast=!!Bi(t,e))}else{Zi=e,Xi(e),vi(),q.useOffscreen&&((t=q.frameBitmap)==null||t.close(),q.frameBitmap=q.glCanvas.transferToImageBitmap());for(let e of q.instances)e.visible&&(e.paused&&e.everCopied||(Ji(e),e.everCopied=!0));if(Bi&&q.glowQueue.length>0&&++q.glowSkip%Jr===0)for(let t of q.glowQueue)t.visible&&!t.paused&&(t.glowFast=!!Bi(t,e))}}function $i(){!q||q.rafId!==0||(q.rafId=requestAnimationFrame(Qi))}function ea(){q&&(q.rafId!==0&&cancelAnimationFrame(q.rafId),q.rafId=0)}var ta={linear:e=>e,smoothstep:e=>e*e*(3-2*e)};function na(e,t,n,r=ta.linear){return{from:e,to:t,dur:n,ease:r,startMs:-1,val:e,done:!1}}function ra(e,t){e.startMs=t,e.val=e.from,e.done=!1}function ia(e,t){if(e.done||e.startMs<0)return e.val;let n=Math.min(1,(t-e.startMs)/e.dur);return e.val=e.from+(e.to-e.from)*e.ease(n),n>=1&&(e.done=!0),e.val}var Y={...Object.freeze({haloOpMul:2,extraIntensity:3.51,peakOp:.85,baseOp:.34,inset:1.5,extraOutward:1,wanderRange:15,wanderLerp:.0075,fadeRate:.00875,lumLo:.08,lumHi:.32,minDwellMs:1500,relocFadeMs:300,relocFadeOutMs:450,pointGain:2.5,haloHalfLen:7.8,extraHalfLen:9.13952/3,haloStrokeXl:26.4,haloStrokeLg:15.6,haloStrokeMd:7.2,haloStrokeSm:3,haloBlurXl:8.4,haloBlurLg:4.8,haloBlurMd:2.1,haloBlurSm:.9,haloOpXl:.385,haloOpLg:.595,haloOpMd:.7,haloOpSm:.7,extraStrokeOuter:4/3,extraStrokeCore:2/3,extraBlurOuter:2/3,extraBlurCore:1.35/3,extraFadeR:13/3,extraOpOuter:.85})},aa=new Set;function oa(e){return aa.add(e),()=>{aa.delete(e)}}var sa={...Object.freeze({enabled:!0,reach:56,fadeMs:200,cursor:!0,cursorDistance:186,cursorStrength:3.35,cursorDiffuse:1.4,cursorFalloff:37,cursorDepth:.4,cursorEdge:0,cursorReach:11.5,cursorBlur:.5,cursorZoom:3,spill:!1,spillRadius:48,spillStrength:.55,spillOffset:.35,spillLumGain:.7,spillSaturation:1.3,spillInside:.5,spillBlur:0,catchLight:!1,catchFollow:.25,catchGain:1})},ca=!1,la=0,ua=0,da=0,fa=!1,pa=0,ma=0,ha=NaN,ga=NaN,_a=0,va=0,ya=0,ba=0,X=null,Z={d:0,nx:0,ny:0,k:1,left:0,top:0},xa={x:0,y:0},Sa={r:255,g:255,b:255},Ca=null,wa=``,Ta=-1,Ea=-1,Da=!1;function Oa(){da++,Ma()}function ka(){da=Math.max(0,da-1),da===0&&Na()}var Aa=e=>typeof window.matchMedia==`function`&&window.matchMedia(e).matches;function ja(){if(ca||performance.now()<la||1)return!1;let e=window.visualViewport;return!(e&&Math.abs(e.scale-1)>.001)}function Ma(){fa||da===0||typeof document>`u`||Aa(`(pointer: fine)`)&&(fa=!0,document.addEventListener(`pointermove`,Ia,{passive:!0}),document.addEventListener(`pointerleave`,Ra),document.addEventListener(`pointercancel`,Ra),document.addEventListener(`keydown`,La,{passive:!0}),document.addEventListener(`visibilitychange`,Ra),window.addEventListener(`blur`,Ra))}function Na(){fa&&(fa=!1,document.removeEventListener(`pointermove`,Ia),document.removeEventListener(`pointerleave`,Ra),document.removeEventListener(`pointercancel`,Ra),document.removeEventListener(`keydown`,La),document.removeEventListener(`visibilitychange`,Ra),window.removeEventListener(`blur`,Ra),pa!==0&&(cancelAnimationFrame(pa),pa=0),X&&=(X.cursorLight=null,null),ya=0,ba=0,Ca&&(Ca.remove(),Ca=null,wa=``,Ta=-1,Ea=-1,Da=!1),to(),Va&&=(Va.remove(),null))}var Pa=!0,Fa=!1;function Ia(e){Pa=e.pointerType===`mouse`||e.pointerType===``,Fa=!1,ha=_a=e.clientX,ga=va=e.clientY,Ha&&Va&&(Pa&&$a(ha,ga)||to()),za()}function La(){Fa=!0,to()}function Ra(){ha=ga=NaN,za()}function za(){!fa||pa!==0||(ma=performance.now(),pa=requestAnimationFrame(io))}function Ba(e,t,n,r,i,a,o){let s=a===`circle`?Math.min(n,r)/2:Math.max(0,Math.min(i,Math.min(n,r)/2)),c=n/2,l=r/2,u=Math.max(0,n/2-s),d=Math.max(0,r/2-s),f=Math.max(-u,Math.min(u,e-c)),p=Math.max(-d,Math.min(d,t-l)),m=e-c-f,h=t-l-p,g=Math.hypot(m,h);if(g>1e-6)return o.x=c+f+m/g*s,o.y=l+p+h/g*s,g-s;let _=e,v=n-e,y=t,b=r-t,x=Math.min(_,v,y,b);return x===_?(o.x=0,o.y=t):x===v?(o.x=n,o.y=t):x===y?(o.x=e,o.y=0):(o.x=e,o.y=r),-x}var Va=null,Ha=!1,Ua=!1,Wa=``,Ga=null,Ka=``,qa=/^(INPUT|TEXTAREA|SELECT)$/,Ja=new WeakMap,Ya=0,Xa=null;function Za(e){let t=e;for(;t&&t!==document.body;){if(qa.test(t.tagName)||t.isContentEditable)return!0;t=t.parentElement}return!1}function Qa(){if(Va)return!0;let e=document.createElement(`div`);e.className=`metal-fx-cursor`,e.setAttribute(`aria-hidden`,`true`),e.style.cssText=`position:fixed;left:0;top:0;pointer-events:none;z-index:2147483001;will-change:transform;transform-origin:0 0;display:none`;let t=document.createElement(`canvas`);t.style.display=`block`,e.appendChild(t),document.body.appendChild(e);let n=t.getContext(`2d`),r=document.createElement(`canvas`).getContext(`2d`);return!n||!r?(e.remove(),!1):(Va=e,!0)}function $a(e,t,n=!1){let r=performance.now();if(!n&&Ua&&r-Ya<12)return!0;Ya=r;let i=document.elementFromPoint(e,t);if(!i)return eo(),!1;if(i===Xa&&Ua)return!0;Xa=i;let a=Ja.get(i);if(a===void 0){if(a=!Za(i),a){let e=getComputedStyle(i).cursor;a=e===`auto`||e==="default"||e===`none`}Ja.set(i,a)}if(!a)return eo(),!1;if(!Ua){let e=document.documentElement;Wa=e.style.cursor,e.style.cursor=`none`,Ua=!0}return i!==Ga&&(Ga&&(Ga.style.cursor=Ka,Ga=null,Ka=``),getComputedStyle(i).cursor!==`none`&&(Ga=i,Ka=i.style.cursor,i.style.cursor=`none`)),!0}function eo(){Ga&&(Ga.isConnected&&(Ga.style.cursor=Ka),Ga=null,Ka=``),Ua&&(document.documentElement.style.cursor=Wa,Ua=!1,Wa=``),Xa=null,Ja=new WeakMap}function to(){eo(),Va&&Ha&&(Va.style.display=`none`,Ha=!1)}function no(){if(Ca)return Ca;let e=document.createElement(`div`);return e.className=`metal-fx-cursor-spill`,e.setAttribute(`aria-hidden`,`true`),e.style.cssText=`position:fixed;left:0;top:0;pointer-events:none;z-index:2147483000;border-radius:50%;mix-blend-mode:plus-lighter;will-change:transform,opacity;opacity:0;display:none`,document.body.appendChild(e),Ca=e,e}function ro(){!Ca||!Da||(Ca.style.display=`none`,Ca.style.opacity=`0`,Da=!1)}function io(e){if(pa=0,!fa)return;let t=performance.now();try{ao(e)}catch(e){ca=!0,to(),ro(),X&&=(X.cursorLight=null,null),typeof console<`u`&&console.warn(`metal-fx: cursor light disabled after error`,e);return}performance.now()-t>6?++ua>=20&&(ua=0,la=performance.now()+5e3,to()):ua>0&&ua--}function ao(e){let t=sa,n=Math.min(.05,Math.max(.001,(e-ma)/1e3));ma=e;let r=null,i=0,a=0;if(t.enabled&&q&&!Number.isNaN(ha)){let e=1/0,n=Math.max(1,t.reach),o=t.cursor&&ja()?Math.max(1,t.cursorDistance):0,s=Math.max(n,o);for(let t of q.instances){if(!t.visible||!t.canvas.isConnected)continue;let n=t.canvas.getBoundingClientRect();if(n.width<=0)continue;let i=t.overscan,a=n.width/(t.cssWidth+2*i),o=n.left+i*a,c=n.top+i*a,l=s*a;if(ha<o-l||ha>o+t.cssWidth*a+l||ga<c-l||ga>c+t.cssHeight*a+l)continue;let u=Ba((ha-o)/a,(ga-c)/a,t.cssWidth,t.cssHeight,t.cornerRadius,t.kind,xa),d=Math.abs(u);d<=s&&d<e&&(e=d,r=t,Z.d=u,Z.nx=xa.x,Z.ny=xa.y,Z.k=a,Z.left=o,Z.top=c)}if(r){if(e<=n){let t=1-e/n;i=t*t*(3-2*t)}e<=o&&(a=Math.min(1,(1-e/o)*3)),r.mask&&(Z.nx=r.cssWidth/2,Z.ny=r.cssHeight/2,r.wantRaw=!0)}}let o=1-Math.exp(-(n*1e3)/(Math.max(1,t.fadeMs)/3));if(ya+=(i-ya)*o,ba+=(a-ba)*o,r&&r!==X&&(X&&(X.cursorLight=null,Hi(X,e)),X=r),!r&&ya<.002&&ba<.002)ya=0,ba=0,X&&=(X.cursorLight=null,Hi(X,e),null),ro(),to();else if(X){if(t.catchLight){let e=X.cursorLight??(X.cursorLight={x:0,y:0,w:0});e.x=Z.nx,e.y=Z.ny,e.w=ya}else X.cursorLight&&(X.cursorLight=null);if(Hi(X,e),t.cursor&&ba>.002&&Pa&&!Fa&&!Number.isNaN(ha)&&ja()&&Qa()&&$a(ha,ga)||to(),t.spill){let e=no(),n=wi(X,Z.nx,Z.ny,2),r=Ci(X,Z.nx,Z.ny,3),i=Math.max(n.r,n.g,n.b)||1,a=Ur(n.r*255/i,n.g*255/i,n.b*255/i),[o,s,c]=Wr(a[0],Math.min(1,a[1]*t.spillSaturation),1);Sa.r+=(o-Sa.r)*.15,Sa.g+=(s-Sa.g)*.15,Sa.b+=(c-Sa.b)*.15;let l=Math.round(Sa.r/6)*6,u=Math.round(Sa.g/6)*6,d=Math.round(Sa.b/6)*6,f=`radial-gradient(closest-side, rgba(${l},${u},${d},1) 0%, rgba(${l},${u},${d},0.35) 45%, rgba(${l},${u},${d},0) 100%)`;f!==wa&&(wa=f,e.style.background=f);let p=Math.max(1,t.spillRadius*Z.k);p!==Ta&&(Ta=p,e.style.width=`${(2*p).toFixed(1)}px`,e.style.height=`${(2*p).toFixed(1)}px`),t.spillBlur!==Ea&&(Ea=t.spillBlur,e.style.filter=t.spillBlur>0?`blur(${t.spillBlur}px)`:``);let m=Z.left+Z.nx*Z.k,h=Z.top+Z.ny*Z.k,g=_a+(m-_a)*t.spillOffset,_=va+(h-va)*t.spillOffset;e.style.transform=`translate3d(${(g-p).toFixed(2)}px,${(_-p).toFixed(2)}px,0)`;let v=Math.min(1,Math.max(0,r/.3)),y=1-t.spillLumGain+t.spillLumGain*v,b=Z.d<0?t.spillInside:1,x=Math.max(0,Math.min(1,t.spillStrength*ya*y*b));Da||=(e.style.display=``,!0),e.style.opacity=x.toFixed(3)}else ro();pa=requestAnimationFrame(io)}}var oo=new Map;function so(e,t){let n=Math.sqrt(12*e*e/t+1),r=Math.floor(n);r%2==0&&r--;let i=r+2,a=(12*e*e-t*r*r-4*t*r-3*t)/(-4*r-4),o=Math.round(a),s=[];for(let e=0;e<t;e++)s.push(e<o?r:i);return s}function co(e,t,n,r,i){let a=1/(i+i+1);for(let o=0;o<r;o++){let r=o*n,s=0;for(let t=-i;t<=i;t++)s+=e[r+Math.min(n-1,Math.max(0,t))];for(let o=0;o<n;o++){t[r+o]=s*a;let c=r+Math.max(0,o-i),l=r+Math.min(n-1,o+i+1);s+=e[l]-e[c]}}}function lo(e,t,n,r,i){let a=1/(i+i+1);for(let o=0;o<n;o++){let s=0;for(let t=-i;t<=i;t++)s+=e[Math.min(r-1,Math.max(0,t))*n+o];for(let c=0;c<r;c++){t[c*n+o]=s*a;let l=Math.max(0,c-i)*n+o,u=Math.min(r-1,c+i+1)*n+o;s+=e[u]-e[l]}}}function uo(e,t,n,r){if(r<=.05)return e;let i=new Float32Array(e.length),a=e;for(let e of so(r,3)){let r=(e-1)/2;co(a,i,t,n,r),lo(i,a,t,n,r)}return a}function fo(e,t,n,r,i,a,o){let s=document.createElement(`canvas`);s.width=n,s.height=r;let c=s.getContext(`2d`,{willReadFrequently:!0}),l=new Float32Array(n*r);if(!c)return l;c.scale(i,i),c.strokeStyle=`#fff`,c.lineCap=`round`,c.lineJoin=`round`,c.lineWidth=t,c.beginPath(),c.moveTo(a-e,o),c.lineTo(a+e,o),c.stroke();let u=c.getImageData(0,0,n,r).data;for(let e=0,t=3;e<l.length;e++,t+=4)l[e]=u[t]/255;return l}function po(e,t,n,r,i){let a=0;for(let t of e)a=Math.max(a,(t.stroke/2+3*t.blur)*n);let o=Math.ceil(a)+1,s=2*t+2*o,c=2*o,l=Math.ceil(s*r),u=Math.ceil(c*r),d=new Float32Array(l*u);for(let i of e){let e=fo(t,i.stroke*n,l,u,r,o,o);e=uo(e,l,u,i.blur*n*r);let a=i.opacity;for(let t=0;t<d.length;t++){let n=e[t]*a;d[t]=d[t]+n*(1-d[t])}}if(i>0){let e=o*r,t=o*r,a=i*n*r;for(let n=0;n<u;n++)for(let r=0;r<l;r++){let i=Math.hypot(r+.5-e,n+.5-t)/a,o;o=i<=.3?1:i<=.65?1-(i-.3)/.35*.75:i<1?.25*(1-(i-.65)/.35):0,d[n*l+r]*=o}}let f=document.createElement(`canvas`);f.width=l,f.height=u;let p=f.getContext(`2d`),m=new Uint8ClampedArray(l*u);for(let e=0;e<d.length;e++)m[e]=Math.round(Math.min(1,d[e])*255);if(p){let e=p.createImageData(l,u),t=e.data;for(let e=0,n=0;e<d.length;e++,n+=4)t[n]=255,t[n+1]=255,t[n+2]=255,t[n+3]=m[e];p.putImageData(e,0,0)}return{canvas:f,alpha:m,w:s,h:c,ax:o,ay:o}}function mo(){return[Y.haloStrokeXl,Y.haloStrokeLg,Y.haloStrokeMd,Y.haloStrokeSm,Y.haloBlurXl,Y.haloBlurLg,Y.haloBlurMd,Y.haloBlurSm,Y.haloOpXl,Y.haloOpLg,Y.haloOpMd,Y.haloOpSm,Y.extraStrokeOuter,Y.extraStrokeCore,Y.extraBlurOuter,Y.extraBlurCore,Y.extraFadeR,Y.extraOpOuter].join(`,`)}function ho(e,t,n){let r=`h|${e.toFixed(2)}|${t}|${n}|${mo()}`,i=oo.get(r);return i||(i=po([{stroke:Y.haloStrokeXl,blur:Y.haloBlurXl,opacity:Y.haloOpXl},{stroke:Y.haloStrokeLg,blur:Y.haloBlurLg,opacity:Y.haloOpLg},{stroke:Y.haloStrokeMd,blur:Y.haloBlurMd,opacity:Y.haloOpMd},{stroke:Y.haloStrokeSm,blur:Y.haloBlurSm,opacity:Y.haloOpSm}],e,t,n,0),oo.set(r,i)),i}function go(e,t,n){let r=`e|${e.toFixed(2)}|${t}|${n}|${mo()}`,i=oo.get(r);return i||(i=po([{stroke:Y.extraStrokeOuter,blur:Y.extraBlurOuter,opacity:Y.extraOpOuter},{stroke:Y.extraStrokeCore,blur:Y.extraBlurCore,opacity:1}],e,t,n,Y.extraFadeR),oo.set(r,i)),i}function _o(e,t,n,r,i){let a=t<<16|n<<8|r;if(i.canvas&&i.tint===a&&i.src===e)return i.canvas;let o=i.canvas,s=i.img;o&&s&&i.src===e||(o=document.createElement(`canvas`),o.width=e.canvas.width,o.height=e.canvas.height,s=o.getContext(`2d`)?.createImageData(o.width,o.height)??null);let c=o.getContext(`2d`);if(c&&s){let i=s.data,a=e.alpha;for(let e=0,o=0;e<a.length;e++,o+=4)i[o]=t,i[o+1]=n,i[o+2]=r,i[o+3]=a[e];c.putImageData(s,0,0)}return i.canvas=o,i.img=s,i.tint=a,i.src=e,o}function vo(e,t,n){let r=Math.max(0,Math.min(n,Math.min(e,t)/2));return 2*Math.max(0,e-2*r)+2*Math.max(0,t-2*r)+2*Math.PI*r}function yo(e,t,n,r){return r===`circle`?2*Math.PI*Math.max(0,Math.min(n,Math.min(e,t)/2)):vo(e,t,n)}function bo(e,t,n,r,i,a,o,s){let c=s||{x:0,y:0},l=Math.max(0,Math.min(r,Math.min(t,n)/2));if(o===`circle`){let r=2*Math.PI*l;if(r<=1e-4)return c.x=t*.5,c.y=n*.5,c;e=(e%r+r)%r;let o=-Math.PI/2+e/r*Math.PI*2,s=Math.max(0,l-i+a);return c.x=t*.5+s*Math.cos(o),c.y=n*.5+s*Math.sin(o),c}let u=Math.max(0,t-2*l),d=Math.max(0,n-2*l),f=Math.PI*l/2,p=2*(u+d)+4*f;e=(e%p+p)%p;let m=Math.max(0,l-i+a),h=e;if(h<u)return c.x=l+h,c.y=i-a,c;if(h-=u,h<f){let e=-Math.PI/2+(f>0?h/f:0)*(Math.PI/2);return c.x=t-l+m*Math.cos(e),c.y=l+m*Math.sin(e),c}if(h-=f,h<d)return c.x=t-i+a,c.y=l+h,c;if(h-=d,h<f){let e=(f>0?h/f:0)*(Math.PI/2);return c.x=t-l+m*Math.cos(e),c.y=n-l+m*Math.sin(e),c}if(h-=f,h<u)return c.x=t-l-h,c.y=n-i+a,c;if(h-=u,h<f){let e=Math.PI/2+(f>0?h/f:0)*(Math.PI/2);return c.x=l+m*Math.cos(e),c.y=n-l+m*Math.sin(e),c}if(h-=f,h<d)return c.x=i-a,c.y=n-l-h,c;h-=d;let g=Math.PI+(f>0?h/f:0)*(Math.PI/2);return c.x=l+m*Math.cos(g),c.y=l+m*Math.sin(g),c}function xo(e,t,n,r,i,a){let o=Math.max(0,Math.min(i,Math.min(n,r)/2));if(a===`circle`){let i=2*Math.PI*o;return i<=1e-4?0:((Math.atan2(t-r/2,e-n/2)+Math.PI/2)/(2*Math.PI)*i%i+i)%i}let s=Math.max(0,n-2*o),c=Math.max(0,r-2*o),l=Math.PI*o/2,u=Math.PI/2,d=s,f=d+l,p=f+c,m=p+l,h=m+s,g=h+l,_=g+c,v=e>=o&&e<=n-o,y=t>=o&&t<=r-o;if(v&&y){let i=e,a=n-e,s=t,c=r-t,l=Math.min(i,a,s,c);return l===s?e-o:l===a?f+(t-o):l===c?m+(n-o-e):g+(r-o-t)}return v?t<r/2?e-o:m+(n-o-e):y?e>n/2?f+(t-o):g+(r-o-t):e>n/2&&t<r/2?d+(Math.atan2(t-o,e-(n-o))+u)/u*l:e>n/2?p+Math.atan2(t-(r-o),e-(n-o))/u*l:t>r/2?h+(Math.atan2(t-(r-o),e-o)-u)/u*l:_+(Math.atan2(t-o,e-o)+Math.PI)/u*l}var So={x:0,y:0},Co={x:0,y:0};function wo(e,t,n,r,i,a){return bo(e-.1,t,n,r,i,0,a,So),bo(e+.1,t,n,r,i,0,a,Co),Math.atan2(Co.y-So.y,Co.x-So.x)}function To(e,t,n){if(e===t)return n<e?0:1;let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)}function Eo(e){if(e.samplePoints&&e.samplePoints.length>0)return e.samplePoints.map((e,t)=>({x:e.x,y:e.y,arc:t}));let t=yo(e.width,e.height,e.cornerRadius,e.kind),n=Y.inset*(e.scale??1),r=[];for(let i=0;i<Yr;i++){let a=i/Yr*t,o=bo(a,e.width,e.height,e.cornerRadius,n,0,e.kind);r.push({x:o.x,y:o.y,arc:a})}return r}var Do=.05,Oo=1e3/15*120,ko=1e3/15,Ao=2e3,jo=400,Mo=2.625,No=1.008,Po=.31,Fo=140,Io=40,Lo=20,Ro=34,zo=.25,Bo=.01,Vo=.004,Ho=.5,Uo=3.5,Q={x:0,y:0};function Wo(e,t){let{width:n,height:r}=t,i=t.scale??1,a=Math.min(3,typeof window<`u`&&window.devicePixelRatio||1),o=yo(n,r,t.cornerRadius,t.kind)/vo(Fo,Io,Lo),s=Math.max(1,Y.haloHalfLen*o),c=Math.max(.6,Y.extraHalfLen*o),l=ho(s,i,a),u=go(c,i,a),d=Math.ceil(Math.max(l.ay,u.ay)+Y.extraOutward*o*i+2),f=document.createElement(`div`);f.className=`metal-fx-glow-svg`,f.setAttribute(`aria-hidden`,`true`);let p=document.createElement(`div`);p.className=`metal-fx-glow-env`,p.style.cssText=`position:absolute;inset:0;pointer-events:none;opacity:0`;let m=document.createElement(`canvas`);m.className=`metal-fx-glow-canvas`;let h=n+2*d,g=r+2*d;m.width=Math.ceil(h*a),m.height=Math.ceil(g*a),m.style.cssText=`position:absolute;left:${-d}px;top:${-d}px;width:${h}px;height:${g}px;pointer-events:none`,p.appendChild(m),f.appendChild(p),e.appendChild(f);let _=m.getContext(`2d`,{willReadFrequently:!!t.maskDataUrl});if(!_)throw Error(`metal-fx: glow canvas 2D context unavailable`);let v={wrap:f,env:p,canvas:m,ctx:_,surroundPath:null,bandPath:null,maskAlpha:null,maskReady:!1,margin:d,dpr:a,halo:l,extra:u,haloTint:{canvas:null,img:null,tint:-1,src:null},extraTint:{canvas:null,img:null,tint:-1,src:null},mO:ki(),mI:ki(),maskSum:NaN,maskDeformed:!1,deform:null,width:n,height:r,cornerRadius:t.cornerRadius,kind:t.kind,scale:i,perim:Eo(t),pointMode:!!(t.samplePoints&&t.samplePoints.length>0),currentIdx:0,appearedAt:0,glowOpacity:0,relocTween:null,relocNextIdx:-1,relocMul:0,envClock:0,cursorMode:!1,cursorArc:0,cursorTargetArc:0,lastTickMs:0,wanderS:0,wanderTargetS:0,wanderFrames:0,tintFrom:{r:255,g:255,b:255},tintTarget:{r:255,g:255,b:255},tintTween:null,tintHoldUntil:0,dX:NaN,dY:NaN,dAng:NaN,dEX:NaN,dEY:NaN,dHOp:NaN,dEOp:NaN,dHaloTint:``,dExtraTint:``,dirty:!0,dEnv:-1};if(t.maskDataUrl){let e=new Image;e.onload=()=>{let t=document.createElement(`canvas`);t.width=m.width,t.height=m.height;let i=t.getContext(`2d`,{willReadFrequently:!0});if(!i)return;i.scale(a,a),i.drawImage(e,d,d,n,r);let o=i.getImageData(0,0,t.width,t.height).data,s=t.width*t.height,c=new Float32Array(s);for(let e=0,t=3;e<s;e++,t+=4)c[e]=o[t]/255;let l=uo(Float32Array.from(c),t.width,t.height,Uo*a),u=0;for(let e=0;e<s;e++)l[e]>u&&(u=l[e]);let f=u>0?Ho/u:0,p=new Uint8ClampedArray(s);for(let e=0;e<s;e++)p[e]=Math.round(Math.max(c[e],l[e]*f)*255);v.maskAlpha=p,v.maskReady=!0,v.dirty=!0},e.src=t.maskDataUrl}else Go(v,null);return v}function Go(e,t){if(e.pointMode)return;let{margin:n,width:r,height:i,cornerRadius:a}=e,o=e.kind===`circle`?2:1;Ai(0,0,r,i,a,t,e.mO),Ai(o,o,r-2*o,i-2*o,Math.max(0,a-o),t,e.mI);let s=new Path2D;Ko(s,e.mO,n);let c=new Path2D;Ko(c,e.mO,n),Ko(c,e.mI,n);let l=new Path2D;l.rect(0,0,r+2*n,i+2*n),l.addPath(s),e.surroundPath=l,e.bandPath=c,e.maskReady=!0}function Ko(e,t,n){let r=t.xy;for(let i=0;i<t.n;i++){let t=r[i*2]+n,a=r[i*2+1]+n;i===0?e.moveTo(t,a):e.lineTo(t,a)}e.closePath()}function qo(e,t){if(!e)return 0;Ai(0,0,t.width,t.height,t.cornerRadius,e,t.mO);let n=0,r=t.mO.xy;for(let e=0;e<t.mO.n;e+=4)n+=r[e*2]*1.37+r[e*2+1];return n}function Jo(e,t){if(e.deform=t,!e.pointMode){if(t){let n=qo(t,e);n!==e.maskSum&&(e.maskSum=n,Go(e,t),e.maskDeformed=!0,e.dirty=!0)}else e.maskDeformed&&(e.maskSum=NaN,Go(e,null),e.maskDeformed=!1,e.dirty=!0)}}function Yo(e,t,n,r,i=`dark`){var a;let{width:o,height:s,cornerRadius:c,perim:l}=e;if(l.length===0)return!1;let u=-1,d=e.currentIdx,f=0;for(let n=0;n<l.length;n++){let r=l[n],i=Ci(t,r.x,r.y,2);i>u&&(u=i,d=n),n===e.currentIdx&&(f=i)}let p=e.appearedAt>0&&n-e.appearedAt<Y.minDwellMs,m=Y.baseOp+(Y.peakOp-Y.baseOp)*To(Y.lumLo,Y.lumHi,f),h=!p&&u-f>Do,g=t.cursorLight,_=sa.enabled&&sa.catchLight&&!e.pointMode&&!!g&&g.w>.02,v=yo(o,s,c,e.kind);_&&(e.cursorTargetArc=xo(g.x,g.y,o,s,c,e.kind));let y=_?Math.min(1,Y.peakOp*sa.catchGain*g.w):0,b=e.lastTickMs>0?Math.min(200,Math.max(.5,n-e.lastTickMs)):ko;e.lastTickMs=n,e.envClock+=Math.min(b,Ro);let x=e=>1-(1-e)**(b/ko),S=Math.max(1,Y.relocFadeMs),C=Math.max(1,Y.relocFadeOutMs),w=()=>{e.appearedAt=n,e.wanderS=0,e.wanderTargetS=0,e.wanderFrames=0,e.relocTween=na(0,1,S,ta.smoothstep),ra(e.relocTween,e.envClock)},T=t=>{e.relocNextIdx=t,e.relocTween=na(1,0,C,ta.smoothstep),ra(e.relocTween,e.envClock)};if((a=e.relocTween)!=null&&a.done&&e.relocTween.to===0){let n=e.relocNextIdx;if(n===-2&&!_&&(n=-3),n===-3)e.cursorMode=!1,e.appearedAt=0,e.relocTween=null;else if(n===-2)e.cursorMode=!0,e.cursorArc=e.cursorTargetArc,e.glowOpacity=y,w();else{e.currentIdx=n;let r=l[e.currentIdx],i=Ci(t,r.x,r.y,2);e.glowOpacity=Y.baseOp+(Y.peakOp-Y.baseOp)*To(Y.lumLo,Y.lumHi,i),w()}}if((!e.relocTween||e.relocTween.done)&&(e.appearedAt===0?(_?(e.cursorMode=!0,e.cursorArc=e.cursorTargetArc,e.glowOpacity=y):(e.cursorMode=!1,e.currentIdx=d,e.glowOpacity=m),w()):_===e.cursorMode?!e.cursorMode&&h&&T(d):T(_?-2:-3)),e.cursorMode){_&&(e.glowOpacity=y);let t=1-(1-Math.max(.01,Math.min(1,sa.catchFollow)))**(b/(1e3/60)),n=e.cursorTargetArc-e.cursorArc;n=(n%v+v*1.5)%v-v/2,e.cursorArc+=n*t}else e.glowOpacity+=(m-e.glowOpacity)*x(Y.fadeRate);e.glowOpacity=Math.max(0,Math.min(1,e.glowOpacity)),e.relocMul=e.relocTween?ia(e.relocTween,e.envClock):1;let E=yo(o,s,c,e.kind)/vo(Fo,Io,Lo),D=Y.wanderRange*E;e.wanderFrames+=b,e.wanderFrames>=Oo&&(e.wanderTargetS=(Math.random()*2-1)*D,e.wanderFrames=0),e.wanderS+=(e.wanderTargetS-e.wanderS)*x(Y.wanderLerp);let O,k,A,j,M;if(e.pointMode){let t=l[e.currentIdx];O=t.x+e.wanderS,k=t.y,A=0,j=O,M=k}else{let t=e.cursorMode?e.cursorArc:l[e.currentIdx].arc+e.wanderS,n=Y.inset*e.scale;bo(t,o,s,c,n,0,e.kind,Q),O=Q.x,k=Q.y,A=wo(t,o,s,c,n,e.kind),bo(t,o,s,c,n,Y.extraOutward*E*e.scale,e.kind,Q),j=Q.x,M=Q.y}e.deform&&(e.deform(O,k,Q),O=Q.x,k=Q.y,e.deform(j,M,Q),j=Q.x,M=Q.y);let N=i===`light`,P=N?Ti(t,O,k,2):wi(t,O,k,2);e.tintTween?e.tintTween.done&&(N?(e.tintFrom={r:e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*e.tintTween.val,g:e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*e.tintTween.val,b:e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*e.tintTween.val},e.tintTarget={...P},e.tintTween=na(0,1,jo),ra(e.tintTween,n)):n>=e.tintHoldUntil&&(e.tintFrom={...e.tintTarget},e.tintTarget={...P},e.tintTween=na(0,1,jo),ra(e.tintTween,n),e.tintHoldUntil=n+Ao)):(e.tintFrom={...P},e.tintTarget={...P},e.tintTween=na(0,1,jo),ra(e.tintTween,n),e.tintHoldUntil=N?0:n+Ao),ia(e.tintTween,n);let F=e.tintTween.val,I,L,R;if(N)I=Math.round(e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*F),L=Math.round(e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*F),R=Math.round(e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*F);else{let t=e.tintFrom.r+(e.tintTarget.r-e.tintFrom.r)*F,n=e.tintFrom.g+(e.tintTarget.g-e.tintFrom.g)*F,r=e.tintFrom.b+(e.tintTarget.b-e.tintFrom.b)*F,i=Math.max(t,n,r)||1;I=Math.round(t/i*255),L=Math.round(n/i*255),R=Math.round(r/i*255)}let ee=`rgb(${I},${L},${R})`,z=`#ffffff`;if(N){let e=Ur(I,L,R),[t,n,r]=Wr(e[0],Math.min(1,e[1]*Mo),Math.max(Po,e[2]*No));z=`rgb(${t},${n},${r})`}let te=Math.max(0,Math.min(1,r))*(e.pointMode?Y.pointGain:1),B=Math.min(1,e.glowOpacity*Y.haloOpMul*te),ne=Math.min(1,e.glowOpacity*Y.extraIntensity*te);if(Math.abs(e.relocMul-e.dEnv)>.002){let t=e.relocMul>=.998&&e.dEnv<.998;e.dEnv=e.relocMul,e.env.style.opacity=e.relocMul.toFixed(3),t&&(e.dirty=!0)}let re=!(!e.relocTween||e.relocTween.done)||e.cursorMode,V=!(Math.abs(O-e.dX)<zo&&Math.abs(k-e.dY)<zo&&Math.abs(A-e.dAng)<Bo&&Math.abs(j-e.dEX)<zo&&Math.abs(M-e.dEY)<zo),ie=!(Math.abs(B-e.dHOp)<Vo&&Math.abs(ne-e.dEOp)<Vo),ae=ee!==e.dHaloTint||z!==e.dExtraTint;return(e.dirty||V||ie||ae)&&(e.dX=O,e.dY=k,e.dAng=A,e.dEX=j,e.dEY=M,e.dHOp=B,e.dEOp=ne,e.dHaloTint=ee,e.dExtraTint=z,e.dirty=!1,Xo(e,O,k,A,j,M,B,ne,ee,z)),re}function Xo(e,t,n,r,i,a,o,s,c,l){let{ctx:u,canvas:d,dpr:f,margin:p}=e;if(u.setTransform(1,0,0,1,0,0),u.globalCompositeOperation=`source-over`,u.globalAlpha=1,u.clearRect(0,0,d.width,d.height),o<=.002&&s<=.002||!e.maskReady)return;let m=o>.002?_o(e.halo,...Qo(c),e.haloTint):null,h=s>.002?l===`#ffffff`?e.extra.canvas:_o(e.extra,...Qo(l),e.extraTint):null,g=c=>{m&&(u.save(),u.translate(t+p,n+p),u.rotate(r),u.globalAlpha=o*c,u.drawImage(m,-e.halo.ax,-e.halo.ay,e.halo.w,e.halo.h),u.restore()),h&&(u.save(),u.translate(i+p,a+p),u.rotate(r),u.globalAlpha=s*c,u.drawImage(h,-e.extra.ax,-e.extra.ay,e.extra.w,e.extra.h),u.restore())};if(!e.pointMode&&e.surroundPath&&e.bandPath){u.save(),u.scale(f,f),u.clip(e.surroundPath,`evenodd`),g(.5),u.restore(),u.save(),u.scale(f,f),u.clip(e.bandPath,`evenodd`),g(1),u.restore();return}u.save(),u.scale(f,f),g(1),u.restore();let _=e.maskAlpha;if(!_)return;let v=u.getImageData(0,0,d.width,d.height),y=v.data;for(let e=0,t=3;e<_.length;e++,t+=4){let n=_[e];if(n!==255){if(n===0){y[t]=0;continue}y[t]=(y[t]*n+127)/255}}u.putImageData(v,0,0)}var Zo=[255,255,255];function Qo(e){if(e[0]===`#`)return Zo[0]=parseInt(e.slice(1,3),16),Zo[1]=parseInt(e.slice(3,5),16),Zo[2]=parseInt(e.slice(5,7),16),Zo;let t=4,n=0,r=0;for(;t<e.length&&r<3;){let i=e.charCodeAt(t++);i>=48&&i<=57?n=n*10+(i-48):(i===44||i===41)&&(Zo[r++]=n,n=0)}return Zo}function $o(e,t){e.pointMode===t.pointMode&&(t.currentIdx=Math.min(e.currentIdx,Math.max(0,t.perim.length-1)),t.appearedAt=e.appearedAt,t.glowOpacity=e.glowOpacity,t.relocTween=e.relocTween,t.relocNextIdx=e.relocNextIdx,t.relocMul=e.relocMul,t.envClock=e.envClock,t.cursorMode=e.cursorMode,t.cursorArc=e.cursorArc,t.cursorTargetArc=e.cursorTargetArc,t.lastTickMs=e.lastTickMs,t.wanderS=e.wanderS,t.wanderTargetS=e.wanderTargetS,t.wanderFrames=e.wanderFrames,t.tintFrom=e.tintFrom,t.tintTarget=e.tintTarget,t.tintTween=e.tintTween,t.tintHoldUntil=e.tintHoldUntil,t.dEnv=e.relocMul,t.env.style.opacity=e.relocMul.toFixed(3))}var es=Object.freeze({offsetY:1,blur:.5,alpha:.9,color:`#ffffff`});function ts(e,t,n){let r=Math.min(3,typeof window<`u`&&window.devicePixelRatio||1),i=Math.ceil(3*n.blur+Math.abs(n.offsetY)+1),a=t.width+2*i,o=t.height+2*i,s=document.createElement(`canvas`);s.className=`metal-fx-rim-canvas`,s.setAttribute(`aria-hidden`,`true`),s.width=Math.ceil(a*r),s.height=Math.ceil(o*r),s.style.cssText=`position:absolute;left:${-i}px;top:${-i}px;width:${a}px;height:${o}px;pointer-events:none`;let c=s.getContext(`2d`),l=document.createElement(`canvas`);l.width=s.width,l.height=s.height;let u=l.getContext(`2d`,{willReadFrequently:!0});if(!c||!u)return null;e.appendChild(s);let d={canvas:s,ctx:c,scratch:l,sctx:u,width:t.width,height:t.height,cornerRadius:t.cornerRadius,kind:t.kind,ring:t.ring,margin:i,dpr:r,opts:n,mO:ki(),mI:ki(),sum:NaN};return rs(d,null,!0),d}function ns(e,t,n){let r=t.xy;for(let i=0;i<t.n;i++){let t=r[i*2]+n,a=r[i*2+1]+n;i===0?e.moveTo(t,a):e.lineTo(t,a)}e.closePath()}function rs(e,t,n=!1){let{width:r,height:i,cornerRadius:a,ring:o,margin:s,dpr:c}=e;Ai(0,0,r,i,a,t,e.mO),Ai(o,o,r-2*o,i-2*o,Math.max(0,a-o),t,e.mI);let l=0,u=e.mO.xy;for(let t=0;t<e.mO.n;t+=4)l+=u[t*2]*1.37+u[t*2+1];if(!n&&l===e.sum)return;e.sum=l;let{sctx:d,scratch:f,ctx:p,canvas:m,opts:h}=e,g=f.width,_=f.height;d.setTransform(1,0,0,1,0,0),d.clearRect(0,0,g,_),d.scale(c,c),d.fillStyle=`#fff`,d.beginPath(),ns(d,e.mO,s),ns(d,e.mI,s),d.fill(`evenodd`);let v=d.getImageData(0,0,g,_).data,y=g*_,b=new Float32Array(y);for(let e=0,t=3;e<y;e++,t+=4)b[e]=v[t]/255;let x=Math.round(h.offsetY*c)*g,S=new Float32Array(y);if(x>=0)for(let e=0;e<y;e++)S[e]=Math.max(0,b[e]-(e>=x?b[e-x]:0));else for(let e=0;e<y;e++)S[e]=Math.max(0,b[e]-(e-x<y?b[e-x]:0));let C=uo(S,g,_,h.blur*c),w=parseInt(h.color.slice(1,3),16),T=parseInt(h.color.slice(3,5),16),E=parseInt(h.color.slice(5,7),16),D=p.createImageData(g,_),O=D.data;for(let e=0,t=0;e<y;e++,t+=4)O[t]=w,O[t+1]=T,O[t+2]=E,O[t+3]=Math.round(Math.min(1,C[e]*b[e]*h.alpha)*255);p.setTransform(1,0,0,1,0,0),p.putImageData(D,0,0)}function is(e){e&&e.canvas.remove()}var as=12,os=32,ss=1,cs=.55,ls=1,us=.85,ds=0,fs=1.3,ps=3.6,ms=.7,hs=1,gs=.52,_s=1,vs=.044,ys=235,bs=2.535,xs=.7,Ss=.5,Cs=new Set([`INPUT`,`TEXTAREA`,`SELECT`,`OPTION`]);function ws(e,t){let n=Math.max(e.left-t.right,t.left-e.right,0),r=Math.max(e.top-t.bottom,t.top-e.bottom,0);return Math.sqrt(n*n+r*r)}function Ts(e,t,n,r){return!(Math.min(e.bottom,t.bottom)-Math.max(e.top,t.top)<n||Math.max(e.left-t.right,t.left-e.right,0)>r)}function Es(e,t,n,r){return Math.min(e.right,t.right)-Math.max(e.left,t.left)<n?!1:Math.max(e.top-t.bottom,t.top-e.bottom,0)<=r}function Ds(e,t,n,r,i,a){let o=Math.max(0,Math.min(a,r*.5,i*.5)),s=e.roundRect;typeof s==`function`?s.call(e,t,n,r,i,o):(e.moveTo(t+o,n),e.lineTo(t+r-o,n),e.quadraticCurveTo(t+r,n,t+r,n+o),e.lineTo(t+r,n+i-o),e.quadraticCurveTo(t+r,n+i,t+r-o,n+i),e.lineTo(t+o,n+i),e.quadraticCurveTo(t,n+i,t,n+i-o),e.lineTo(t,n+o),e.quadraticCurveTo(t,n,t+o,n))}function Os(e,t,n,r,i){!i.flipX&&!i.flipY?e.drawImage(t,i.sx??0,i.sy??0,n,r,i.x,i.y,i.w,i.h):(e.save(),i.flipX&&(e.translate(i.x+i.w,0),e.scale(-1,1)),i.flipY&&(e.translate(0,i.y+i.h),e.scale(1,-1)),e.drawImage(t,i.sx??0,i.sy??0,n,r,i.flipX?0:i.x,i.flipY?0:i.y,i.w,i.h),e.restore())}function ks(e,t,n,r,i,a,o){r<=2*o||i<=2*o?(e.beginPath(),Ds(e,t,n,r,i,a),e.clip()):(e.beginPath(),Ds(e,t,n,r,i,a),Ds(e,t+o,n+o,r-2*o,i-2*o,Math.max(0,a-o)),e.clip(`evenodd`))}function As(e,t,n,r,i,a,o,s,c,l,u,d){let f=d??Math.max(1,Math.round(24*u)),p=Math.max(0,o),m=!0;for(let o=0;o<3&&p>1e-4;o++){let o=Math.min(1,p);e.save(),ks(e,l.x,l.y,l.w,l.h,l.r,f),e.globalCompositeOperation=m?`source-over`:`lighter`,m=!1,e.globalAlpha=o,Os(e,t,n,r,c),e.globalAlpha=1,e.globalCompositeOperation=`destination-in`,e.fillStyle=s,e.fillRect(0,0,i,a),e.restore(),p-=o}}function js(e,t,n,r,i,a,o){let s=o|0;s<1||r<=2*s||i<=2*s?(e.beginPath(),Ds(e,t,n,r,i,a),e.clip()):(e.beginPath(),Ds(e,t,n,r,i,a),Ds(e,t+s,n+s,r-2*s,i-2*s,Math.max(0,a-s)),e.clip(`evenodd`))}function Ms(e,t,n,r,i,a,o,s,c,l,u,d){let f=s*u,p=!0;for(let s=0;s<3&&f>1e-4;s++){let s=Math.min(1,f);e.save(),js(e,o.x,o.y,o.w,o.h,o.r,c),e.globalCompositeOperation=p?`source-over`:`lighter`,p=!1,e.globalAlpha=s,Os(e,t,n,r,d),e.globalAlpha=1,e.globalCompositeOperation=`destination-in`,e.fillStyle=l,e.fillRect(0,0,i,a),e.restore(),f-=s}}function Ns(e,t,n,r,i,a,o,s){let c=e.createLinearGradient(r,i,a,o);c.addColorStop(0,`rgba(255,255,255,${s.toFixed(3)})`),c.addColorStop(.5,`rgba(255,255,255,${(s*.45).toFixed(3)})`),c.addColorStop(1,`rgba(255,255,255,0)`),e.save(),js(e,t.x,t.y,t.w,t.h,t.r,n),e.globalCompositeOperation=`lighter`,e.lineWidth=n*2,e.strokeStyle=c,e.beginPath(),Ds(e,t.x,t.y,t.w,t.h,t.r),e.stroke(),e.restore()}function Ps(e){let t=getComputedStyle(e),n=[parseFloat(t.borderTopLeftRadius)||0,parseFloat(t.borderTopRightRadius)||0,parseFloat(t.borderBottomRightRadius)||0,parseFloat(t.borderBottomLeftRadius)||0].filter(e=>e>0);return n.length?Math.min.apply(null,n):0}function Fs(e){let t=getComputedStyle(e),n=Math.max(parseFloat(t.borderTopWidth)||0,parseFloat(t.borderRightWidth)||0,parseFloat(t.borderBottomWidth)||0,parseFloat(t.borderLeftWidth)||0),r=0,i=0,a=t.boxShadow;if(a&&a!==`none`){let e=a.replace(/rgba?\([^)]*\)/g,e=>e.replace(/,/g,`\0`)).split(/,\s*/),t=1/0,n=1/0;for(let r of e){let e=r.match(/-?\d+(?:\.\d+)?px/g);if(!e||e.length<4)continue;let i=parseFloat(e[3]);i>0&&(/\binset\b/.test(r)?i<t&&(t=i):i<n&&(n=i))}Number.isFinite(t)&&(r=t),Number.isFinite(n)&&(i=n)}return{width:Math.max(n,r,i)||1,outerCssPx:Math.max(n,i)}}function Is(e){e.cornerRadius=Ps(e.el);let t=Fs(e.el);e.hairlineWidth=t.width,e.hairlineOuterCssPx=t.outerCssPx}function Ls(e){typeof ResizeObserver<`u`&&(e.resizeObserver=new ResizeObserver(()=>Is(e)),e.resizeObserver.observe(e.el)),typeof MutationObserver<`u`&&(e.mutationObserver=new MutationObserver(()=>Is(e)),e.mutationObserver.observe(e.el,{attributes:!0,attributeFilter:[`style`,`class`]}))}function Rs(e){var t,n;(t=e.resizeObserver)==null||t.disconnect(),e.resizeObserver=null,(n=e.mutationObserver)==null||n.disconnect(),e.mutationObserver=null}var zs=new Set,Bs={...Object.freeze({enabled:!0,radius:11.5,strength:.57,penumbra:.55,falloff:.21,edgeFade:.7,softness:.24,repaintMs:36})},Vs=null,Hs=0,Us=0,Ws=!1;function Gs(){Hs!==0||typeof requestAnimationFrame>`u`||(Hs=requestAnimationFrame(e=>{Hs=0,e-Us<Bs.repaintMs?Gs():(Us=e,oc())}))}var Ks=!1;function qs(e,t){let n=Bs.radius;for(let r of zs){let i=r.anchorEl.getBoundingClientRect(),a=r.el.getBoundingClientRect(),o=Math.min(i.left,a.left)-n,s=Math.max(i.right,a.right)+n,c=Math.min(i.top,a.top)-n,l=Math.max(i.bottom,a.bottom)+n;if(e>=o&&e<=s&&t>=c&&t<=l)return!0}return!1}function Js(e){if(Vs={x:e.clientX,y:e.clientY},!Bs.enabled)return;let t=qs(e.clientX,e.clientY);(t||Ks)&&Gs(),Ks=t}function Ys(){Vs=null,Ks&&Gs(),Ks=!1}function Xs(e){typeof document>`u`||e===Ws||(Ws=e,e?(document.addEventListener(`pointermove`,Js,{passive:!0}),document.addEventListener(`pointerleave`,Ys),window.addEventListener(`blur`,Ys)):(document.removeEventListener(`pointermove`,Js),document.removeEventListener(`pointerleave`,Ys),window.removeEventListener(`blur`,Ys),Vs=null))}function Zs(e,t,n,r,i,a,o,s,c){if(!Vs)return;let l=Bs;if(!l.enabled||l.strength<=0)return;let u=l.radius,d,f,p,m,h,g;if(i){let e=n.left>=r.right;d=e?r.right:n.right,f=e?n.left:r.left,p=Vs.x,m=Vs.y,h=Math.max(n.top,r.top),g=Math.min(n.bottom,r.bottom)}else{let e=n.top>=r.bottom;d=e?r.bottom:n.bottom,f=e?n.top:r.top,p=Vs.y,m=Vs.x,h=Math.max(n.left,r.left),g=Math.min(n.right,r.right)}let _=Math.min(d,f),v=Math.max(d,f),y=Math.max(1,v-_);if(p<_-u||p>v+u||m<h-u||m>g+u)return;let b=Math.max(0,Math.min(1,Math.abs(p-d)/y)),x=Math.max(.5,u*l.edgeFade),S=Math.min(1,Math.min(p-(_-u),v+u-p)/x),C=Math.min(1,Math.min(m-(h-u),g+u-m)/x),w=l.strength*(1-l.falloff*b)*S*C;if(w<=.001)return;let T=u*c*(1+l.penumbra*b),E=i?(m-r.top+s)*c:(m-r.left+s)*c,D=Math.max(0,Math.min(.5,(1-l.softness)*.5)),O=Math.max(.001,.5-D),k=i?o:a,A=Math.max(0,Math.floor(E-T)),j=Math.min(k,Math.ceil(E+T));if(j<=A)return;let M=new Float32Array(j-A);for(let e=A;e<j;e++){let t=(e+.5-(E-T))/(2*T),n=t<O?t/O:t>1-O?(1-t)/O:1;M[e-A]=1-w*Math.max(0,Math.min(1,n))}for(let n of[e,t]){let e=i?0:A,t=i?A:0,r=i?a:j-A,s=i?j-A:o,c=n.getImageData(e,t,r,s),l=c.data;if(i)for(let e=0;e<s;e++){let t=M[e];if(!(t>=.999))for(let n=e*r*4+3,i=(e+1)*r*4;n<i;n+=4)l[n]=l[n]*t}else for(let e=0;e<s;e++)for(let t=0;t<r;t++){let n=M[t];if(n>=.999)continue;let i=(e*r+t)*4+3;l[i]=l[i]*n}n.putImageData(c,e,t)}}var Qs=null,$s=null,ec=null,tc=null;function nc(e,t){return Qs||(Qs=document.createElement(`canvas`),$s=document.createElement(`canvas`),ec=Qs.getContext(`2d`,{alpha:!0}),tc=$s.getContext(`2d`,{alpha:!0})),!ec||!tc||!Qs||!$s?!1:(Qs.width!==e&&(Qs.width=e,$s.width=e),Qs.height!==t&&(Qs.height=t,$s.height=t),ec.setTransform(1,0,0,1,0,0),tc.setTransform(1,0,0,1,0,0),ec.globalCompositeOperation=`source-over`,tc.globalCompositeOperation=`source-over`,ec.clearRect(0,0,e,t),tc.clearRect(0,0,e,t),!0)}function rc(e,t,n,r=1){if(typeof document>`u`||Cs.has(e.tagName))return null;for(let t of zs)if(t.el===e)return t.strength=r,t;let i=document.createElement(`div`);i.setAttribute(`data-metal-fx-reflection`,``),i.setAttribute(`aria-hidden`,`true`);let a=document.createElement(`canvas`);a.className=`metal-fx-reflection-canvas`;let o=a.getContext(`2d`,{alpha:!0,willReadFrequently:!0});if(!o)return null;let s=document.createElement(`canvas`);s.className=`metal-fx-reflection-stroke-canvas`;let c=s.getContext(`2d`,{alpha:!0,willReadFrequently:!0});if(!c)return null;i.appendChild(a),i.appendChild(s);let l=getComputedStyle(e),u=!1;l.position===`static`&&(e.style.position=`relative`,u=!0);let d=!1;l.isolation!==`isolate`&&(e.style.isolation=`isolate`,d=!0),e.setAttribute(`data-metal-fx-reflect-host`,``),e.insertBefore(i,e.firstChild);let f=Fs(e),p={el:e,anchor:t,anchorEl:n,strength:r,wrap:i,canvas:a,ctx:o,strokeCanvas:s,strokeCtx:c,cornerRadius:Ps(e),hairlineWidth:f.width,hairlineOuterCssPx:f.outerCssPx,appliedPositionRelative:u,appliedIsolation:d,resizeObserver:null,mutationObserver:null};return Ls(p),zs.add(p),Xs(!0),p}function ic(e){for(let t of zs)if(t.el===e){Rs(t),t.canvas.width=0,t.canvas.height=0,t.strokeCanvas.width=0,t.strokeCanvas.height=0,t.wrap.parentNode===t.el&&t.el.removeChild(t.wrap),t.el.removeAttribute(`data-metal-fx-reflect-host`),t.appliedPositionRelative&&(t.el.style.position=``),t.appliedIsolation&&(t.el.style.isolation=``),zs.delete(t),zs.size===0&&Xs(!1);return}}function ac(e,t,n,r,i){if(r<1||i<1)return null;let a=e.getContext(`2d`);if(!a)return null;let o=a.getImageData(t,n,r,i).data,s=r,c=i,l=-1,u=-1;for(let e=0;e<i;e++){let t=e*r;for(let n=0;n<r;n++)o[(t+n)*4+3]>8&&(n<s&&(s=n),n>l&&(l=n),e<c&&(c=e),e>u&&(u=e))}return l<0?null:{x:t+s,y:n+c,w:l-s+1,h:u-c+1}}function oc(){if(zs.size===0)return;let e=typeof window<`u`&&window.devicePixelRatio||1,t=new Map;for(let n of zs){let r=n.el.getBoundingClientRect(),i=t.get(n.anchorEl);if(i||(i=n.anchorEl.getBoundingClientRect(),t.set(n.anchorEl,i)),r.width<1||r.height<1||i.width<1||i.height<1)continue;let a=n.el.hasAttribute(`data-metal-fx-text`);if(a&&!n.glyphStyled&&(n.canvas.style.filter=`blur(0.4px) saturate(1.35) brightness(1.2)`,n.glyphStyled=!0),!Ts(i,r,ss,os)&&!Es(i,r,ss,os)){n.canvas.width!==1&&(n.canvas.width=1,n.canvas.height=1),n.strokeCanvas.width!==1&&(n.strokeCanvas.width=1,n.strokeCanvas.height=1);continue}let o=a&&!!n.anchor.mask;o&&!n.anchor.wantRaw&&(n.anchor.wantRaw=!0),n.anchor.wantRing||(n.anchor.wantRing=!0);let s=!!n.anchor.deform&&!!n.anchor.ringCanvas,c=o&&n.anchor.rawCanvas?n.anchor.rawCanvas:s?n.anchor.ringCanvas:n.anchor.canvas,l=Math.round(n.anchor.overscan*e),u=l,d=l,f=(c.width|0)-2*l,p=(c.height|0)-2*l;if(n.anchor.mask&&!o){let e=ac(c,u,d,f,p);e&&(u=e.x,d=e.y,f=e.w,p=e.h)}if(f<4||p<4)continue;let m=(i.left+i.right)*.5,h=(i.top+i.bottom)*.5,g=(r.left+r.right)*.5,_=(r.top+r.bottom)*.5,v=m-g,y=h-_,b=Math.max(i.left-r.right,r.left-i.right,0)>=Math.max(i.top-r.bottom,r.top-i.bottom,0),x=ws(i,r),S=1-Math.min(1,x/as);S=S*S*(3-2*S);let C=cs+.44999999999999996*S,w=Math.min(ps,C*fs*ms)*n.strength,T=i.left>=r.left&&i.right<=r.right&&i.top>=r.top&&i.bottom<=r.bottom?[!0,!1]:[b],E=n.anchor.scale??1,D=Math.max(hs*E,n.hairlineWidth),O=Math.max(1,Math.round(D*e)),k=Math.max(1,Math.round(Math.max(_s*E,n.hairlineWidth)*e)),A=n.hairlineOuterCssPx;n.wrap.style.inset=`${-A}px`,n.wrap.style.borderRadius=`${Math.max(0,n.cornerRadius)}px`;let j=Math.max(1,Math.round((r.width+A*2)*e)),M=Math.max(1,Math.round((r.height+A*2)*e));n.canvas.width!==j&&(n.canvas.width=j),n.canvas.height!==M&&(n.canvas.height=M),n.strokeCanvas.width!==j&&(n.strokeCanvas.width=j),n.strokeCanvas.height!==M&&(n.strokeCanvas.height=M);let N=n.ctx;N.setTransform(1,0,0,1,0,0),N.clearRect(0,0,j,M);let P=n.strokeCtx;P.setTransform(1,0,0,1,0,0),P.clearRect(0,0,j,M);for(let[t,o]of T.entries()){let s=t>0&&nc(j,M),l=s?ec:N,m=s?tc:P,h=Math.min((a?as*1.5:as)*e,Math.max(j,M)),g,_,b,x;o?(g=v>0?j:0,b=v>0?j-h:h,_=M*.5,x=M*.5):(_=y>0?M:0,x=y>0?M-h:h,g=j*.5,b=j*.5);let S=N.createLinearGradient(g,_,b,x);S.addColorStop(0,`rgba(0,0,0,${ls})`),S.addColorStop(.5,`rgba(0,0,0,${us})`),S.addColorStop(1,`rgba(0,0,0,${ds})`);let C=f/e,T=a?Math.max(1,Math.min(o?j:M,Math.round(o?f:p))):Math.max(1,Math.round(ys*Math.max(.1,C/140)*e)),E,D,F,I,L=!1,R=!1;if(o){let t=Math.max(i.top,r.top),n=Math.min(i.bottom,r.bottom);L=!0,E=v>0?j-T:0,D=Math.round((t-r.top+A)*e),F=T,I=Math.max(1,Math.round((n-t)*e))}else{let t=Math.max(i.left,r.left),n=Math.min(i.right,r.right);R=!0,E=Math.round((t-r.left+A)*e),D=y>0?M-T:0,F=Math.max(1,Math.round((n-t)*e)),I=T}let ee={x:E,y:D,w:F,h:I,flipX:L,flipY:R,sx:u,sy:d},z={x:0,y:0,w:j,h:M,r:Math.max(0,n.cornerRadius*e)},te=a?Math.min(1,w*xs):Math.min(ps,w*bs*xs*Ss);As(l,c,f,p,j,M,te,S,ee,z,e,a?Math.max(j,M):void 0),a||(Ms(m,c,f,p,j,M,z,w,O,S,gs,ee),Ns(m,z,k,g,_,b,x,Math.min(.85,vs*w))),s&&(N.globalCompositeOperation=`lighter`,N.drawImage(Qs,0,0),P.globalCompositeOperation=`lighter`,P.drawImage($s,0,0))}for(let t of T)Zs(N,P,i,r,t,j,M,A,e);N.globalCompositeOperation=`source-over`,P.globalCompositeOperation=`source-over`}}var sc=!1,cc=0;function lc(){sc||(sc=!0,typeof requestAnimationFrame<`u`&&requestAnimationFrame(e=>{sc=!1,!(e-cc<Kr)&&(cc=e,oc())}))}var uc=`metal-fx-styles`,dc=`
.metal-fx-root {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  overflow: visible;
  background: #272727;
  color: #f8f8f8;
}
.metal-fx-root[data-theme='light'] {
  background: #ffffff;
  color: #1d1d1d;
}

.metal-fx-root::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 2;
  box-shadow: inset 0 0 50px 0 rgba(255, 255, 255, 0.02);
}
.metal-fx-root[data-theme='light']::before {
  box-shadow: inset 0 0 50px 0 rgba(0, 0, 0, 0.02);
}

.metal-fx-root::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 4;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.metal-fx-root[data-theme='light']::after {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
/* Circle variant gets a thicker outer rim than the button variant. */
.metal-fx-root[data-variant='circle']::after {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.1);
}
.metal-fx-root[data-theme='light'][data-variant='circle']::after {
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.06);
}

.metal-fx-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
}

/* The inner spacer — defines the inset geometry where the metal ring meets
   the interior (3 px for Button, 1-2 px for Circle) and carries the Circle dark
   hairline ('box-shadow: inset' rules below). Intentionally transparent so
   the wrapper's background propagates through to the punched shader centre,
   giving consumers a single surface tone to override. See "Single-surface
   background" in the file header for the rationale. */
.metal-fx-inner {
  position: absolute;
  inset: 3px;
  border-radius: inherit;
  z-index: 1;
  pointer-events: none;
}

.metal-fx-root[data-variant='button'][data-shape='pill'] .metal-fx-inner {
  border-radius: calc(var(--mfx-radius, 20px) - 3px);
}
.metal-fx-root[data-variant='button'][data-shape='circle'] .metal-fx-inner {
  border-radius: calc(var(--mfx-radius, 16px) - 3px);
}
.metal-fx-root[data-variant='circle'][data-shape='pill'] .metal-fx-inner {
  inset: 0;
  border-radius: var(--mfx-radius, 20px);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
}
.metal-fx-root[data-variant='circle'][data-shape='circle'] .metal-fx-inner {
  inset: 0;
  border-radius: var(--mfx-radius, 16px);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
}
/* Circle-variant hairline alpha — light mode.
   Source-of-truth: index.html L2261-2267. The 0.45-alpha black inset that
   reads as a single-pixel frame against the dark interior is too heavy
   on a #ffffff inner: it ends up looking like a hard 2-px black ring
   against the iridescent shader. Suppressed entirely (alpha 0) — the
   shader's own iridescent rim already defines the silhouette in light
   mode, so an extra dark hairline only competes with it. The rule is
   kept (rather than deleted) as a tunable hook in case a future variant
   wants to re-introduce a soft edge. NOTE: we keep the dark-mode inset
   and border-radius values because — unlike index.html — our renderer
   does NOT overscan the canvas in light mode, so there is no 1-px gap
   between inner element and shader to compensate for. */
.metal-fx-root[data-theme='light'][data-variant='circle'][data-shape='pill'] .metal-fx-inner,
.metal-fx-root[data-theme='light'][data-variant='circle'][data-shape='circle'] .metal-fx-inner {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0);
}

/* ─── Combined glow SVG (z=3) ──────────────────────────────────────────────
   Single SVG per instance that holds BOTH the wide-halo group
   (#mfx_haloTravel) and the catch-light group (#mfx_extraTravel), exactly
   mirroring canonical's _buildGlowSvgInner (index.html L8078). One
   mix-blend-mode: screen lifts the combined composite onto the shader
   ring; per-frame opacity attributes on each inner group still drive the
   independent fade-in / fade-out cycles for the halo and the catch-light.

   Why a single SVG: the circle variant anchors halo + catch-light at the same
   perimeter point, so they overlap in the bright zone. Two separately-
   screened SVGs would double-screen the overlap (A + B + C - AB - AC -
   BC + ABC instead of A + B + C - AB - AC once both groups composite
   in source-over inside one SVG and then screen against the host once).
   That overlap looked muted versus canonical specifically on the circle
   variant where both layers travel together.

   Source-of-truth opacity: #btnGlowSvg drops to 0.7 in dark and 0.2746 in
   light (index.html L632/L643). */
.metal-fx-glow-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  z-index: 3;
  pointer-events: none;
  opacity: 0.7;
}
.metal-fx-root[data-theme='light'] .metal-fx-glow-svg {
  /* Light-mode 1-px overscan mirrors .btn-glow-svg in metal.html so the
     halo stays glued to the visible silhouette (the shader ring there sits
     1 px outside the host's padding box). */
  inset: -1px;
  width: calc(100% + 2px);
  height: calc(100% + 2px);
  mix-blend-mode: multiply;
  /* Source-of-truth: html[data-theme="light"] #btnGlowSvg { opacity: 0.2746 }
     → −35 % from 0.4225 from the original 0.7 dark-mode opacity. */
  opacity: 0.2746;
  filter: saturate(5.355) brightness(0.78);
}
/* Circle light-mode small variants (e.g. 36×36 send button): the geometrically
   shrunk halo loses density when multiplied against #ffffff. Mirror the
   canonical override at index.html L2316 — bump saturation + drop brightness
   so the small glow holds together visually. */
.metal-fx-root[data-variant='circle'][data-shape='circle'][data-theme='light'] .metal-fx-glow-svg {
  filter: saturate(7.5) brightness(0.6);
}

/* The wrapped child — hoisted into z=5 so it sits above every overlay, with
   normalized chrome so consumer button styles don't fight the metal frame. */
.metal-fx-content {
  position: relative;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  pointer-events: none;
}
.metal-fx-content > * {
  pointer-events: auto;
}
.metal-fx-root[data-normalize='true'] .metal-fx-content > * {
  background: transparent !important;
  border: 0 !important;
  outline: 0 !important;
  box-shadow: none !important;
  /* Sizing: we deliberately DO NOT force \`width: 100%; height: 100%\` on the
     child here. That used to be the contract ("the wrapper is the visible
     button surface; the child stretches to fill it"), but it created a cyclic
     percentage dependency: the wrapper is \`inline-flex\` with no intrinsic
     size, .metal-fx-content is \`width/height: 100%\` of the wrapper, and the
     child was \`100%\` of .metal-fx-content. With nothing breaking the cycle,
     icon-only / class-sized children collapsed.

     The new contract: the child sizes itself (intrinsic content, CSS class,
     or inline style — all work), and the wrapper's \`inline-flex\` wraps it
     tightly. Consumers who want a metal frame BIGGER than the child (e.g.
     padding around an icon) size <MetalFx style={{ width, height }}> AND
     explicitly set width/height on the child to fill (or accept that the
     child renders at its intrinsic size, centered).

     Typography is intentionally NOT touched. We used to apply
     \`color: inherit; font: inherit;\` here to "match" the wrapper, but
     \`font: inherit\` is a shorthand that overrides font-family, font-size,
     font-weight, AND line-height on the child — which (a) shrank the
     button height (line-height changes propagate through the flex
     content box) and (b) scaled em-based icons / font-icons inside the
     child to whatever the wrapper inherited. The wrapper now stays out
     of the child's typography entirely; consumers who want typographic
     normalization can apply it themselves on the child element. */
}

[data-metal-fx-reflection] {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  overflow: hidden;
  z-index: 0;
  isolation: isolate;
}
.metal-fx-reflection-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  filter: blur(4px) saturate(1.2) brightness(1.58);
}
.metal-fx-reflection-stroke-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  filter: saturate(1.35) brightness(1.75);
}
/* Hosts that participate as reflection targets need positioning + isolation
   so the wrap composites only against the host (not the parent stack). The
   wrap injects these inline as well, but stating them here keeps reflections
   working on hosts that already have other inline styles applied. */
[data-metal-fx-reflect-host] {
  isolation: isolate;
}
`,fc=!1;function pc(){if(fc||typeof document>`u`)return;if(document.getElementById(uc)){fc=!0;return}let e=document.createElement(`style`);e.id=uc,e.textContent=dc,document.head.appendChild(e),fc=!0}pc();var mc={position:`absolute`,inset:0,width:`100%`,height:`100%`},hc={position:`absolute`,inset:3},gc={position:`absolute`,inset:0,pointerEvents:`none`,zIndex:3,borderRadius:`inherit`},_c={position:`absolute`,inset:0,pointerEvents:`none`,zIndex:4},vc=new Map;function yc(){let e=globalThis;e.__MFX_DEBUG__&&(e.__mfxGlow=vc)}Vi((e,t)=>{let n=vc.get(e);return n?Yo(n.handles,e,t,e.opacityMul*e.glowGain,n.themeRef.current):!1});function bc(e){let[t,n]=(0,a.useState)(()=>e===`auto`?typeof window>`u`||!window.matchMedia||window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`:e);return(0,a.useEffect)(()=>{if(e!==`auto`){n(e);return}if(typeof window>`u`||!window.matchMedia)return;let t=window.matchMedia(`(prefers-color-scheme: dark)`),r=()=>n(t.matches?`dark`:`light`);return r(),t.addEventListener(`change`,r),()=>t.removeEventListener(`change`,r)},[e]),t}var xc=(0,a.forwardRef)(function({children:e,variant:t=`button`,preset:n=`chromatic`,theme:r=`auto`,strength:i=1,glowGain:o=1,paused:s=!1,borderRadius:c,normalizeHostStyles:l=!0,reflectionTargets:u,disableGlow:d=!1,innerShadow:f,shaderScale:p,ringCssPx:m,scale:h=1,mask:g,glowMode:_=`mask`,className:v,style:y,...b},x){let S=(0,a.useRef)(null),C=(0,a.useRef)(null),w=(0,a.useRef)(null),T=(0,a.useRef)(null),E=(0,a.useRef)(null),D=(0,a.useRef)(null),O=(0,a.useRef)(null),k=(0,a.useRef)(null),A=(0,a.useRef)(`dark`),j=(0,a.useRef)(0),[M,N]=(0,a.useState)(!1),P=bc(r),F=(0,a.useMemo)(()=>ui(),[]);A.current=P;let I=t===`circle`?`circle`:`pill`,L=!d;(0,a.useImperativeHandle)(x,()=>S.current,[]);let R=(e,t)=>{if(I===`circle`)return Math.min(e,t)/2;let n=typeof c==`number`?c:(()=>{let e=D.current?.firstElementChild;if(e){let t=parseFloat(getComputedStyle(e).borderTopLeftRadius);if(Number.isFinite(t)&&t>0)return t}return j.current})();return Math.min(n,Math.min(e,t)/2)};(0,a.useEffect)(()=>{F&&zi(n,P)},[n,P,F]),(0,a.useEffect)(()=>{let e=O.current;e&&Fi(e,{mask:g??null})},[g]),(0,a.useEffect)(()=>{let e=O.current;e&&Fi(e,{paused:s})},[s]),(0,a.useEffect)(()=>{let e=O.current;if(!e)return;let t={};p!==void 0&&(t.shaderScale=p),m!==void 0&&(t.ringCssPx=m),h!==void 0&&(t.scale=h),Object.keys(t).length>0&&Fi(e,t)},[p,m,h]),(0,a.useLayoutEffect)(()=>{let e=C.current,t=S.current,n=w.current;if(!e||!t||!F)return;{let e=getComputedStyle(t),n=parseFloat(e.borderTopLeftRadius);j.current=Number.isFinite(n)?n:0}let r=()=>{let e=t.getBoundingClientRect(),n=Math.max(1,Math.round(e.width)),r=Math.max(1,Math.round(e.height));return{cssWidth:n,cssHeight:r,cornerRadius:R(n,r)}},i=r();O.current=ji({onComposite:()=>{let e=O.current,t=k.current;e&&t&&Jo(t,e.deform);let n=E.current;e&&n&&rs(n,e.deform)},hostCanvas:e,cssWidth:i.cssWidth,cssHeight:i.cssHeight,cornerRadius:i.cornerRadius,kind:I,paused:s,shaderScale:p,ringCssPx:m,scale:h,mask:g??null,onFirstCopy:()=>N(!0)}),t.style.setProperty(`--mfx-radius`,`${i.cornerRadius}px`),t.style.borderRadius=`${i.cornerRadius}px`;let a=(e,t)=>{if(!g||_===`ring`)return{};let n=window.devicePixelRatio||1,r=document.createElement(`canvas`);r.width=Math.max(1,Math.round(e*n)),r.height=Math.max(1,Math.round(t*n));let i=r.getContext(`2d`);if(!i)return{};i.fillStyle=`#fff`,g(i,r.width,r.height,n);let a=i.getImageData(0,0,r.width,r.height).data,o=[],s=Math.max(1,Math.round(2*n));for(let e=s>>1;e<r.height;e+=s)for(let t=s>>1;t<r.width;t+=s)a[(e*r.width+t)*4+3]>128&&o.push({x:t/n,y:e/n});return{samplePoints:o,maskDataUrl:r.toDataURL(`image/png`)}};n&&(k.current=Wo(n,{width:i.cssWidth,height:i.cssHeight,cornerRadius:i.cornerRadius,kind:I,scale:h,...a(i.cssWidth,i.cssHeight)}));let o=e=>{if(!n)return;let t=k.current;n.innerHTML=``,k.current=Wo(n,{width:e.cssWidth,height:e.cssHeight,cornerRadius:e.cornerRadius,kind:I,scale:h,...a(e.cssWidth,e.cssHeight)}),t&&$o(t,k.current);let r=O.current;r&&k.current&&vc.set(r,{handles:k.current,themeRef:A})},c=()=>f?f===!0?es:{...es,...f}:null,l=e=>{let t=T.current,n=O.current;is(E.current),E.current=null;let r=c();t&&n&&r&&(E.current=ts(t,{width:e.cssWidth,height:e.cssHeight,cornerRadius:e.cornerRadius,kind:I,ring:n.ringCssPx},r))};l(i);let u=0,d=i.cssWidth,v=i.cssHeight,y=i.cornerRadius,b=new ResizeObserver(()=>{u===0&&(u=requestAnimationFrame(()=>{u=0;let e=r(),n=O.current;!n||Math.abs(e.cssWidth-d)<.5&&Math.abs(e.cssHeight-v)<.5&&Math.abs(e.cornerRadius-y)<.5||(d=e.cssWidth,v=e.cssHeight,y=e.cornerRadius,Fi(n,{cssWidth:e.cssWidth,cssHeight:e.cssHeight,cornerRadius:e.cornerRadius}),t.style.setProperty(`--mfx-radius`,`${e.cornerRadius}px`),t.style.borderRadius=`${e.cornerRadius}px`,o(e),l(e))}))});b.observe(t);let x=null,D=()=>{let e=O.current;if(e&&Li(e)){let e=r();o(e),l(e)}M()},M=()=>{x?.removeEventListener(`change`,D),x=typeof window.matchMedia==`function`?window.matchMedia(`(resolution: ${window.devicePixelRatio||1}dppx)`):null,x?.addEventListener(`change`,D)};M();let P=oa(e=>{e&&O.current&&o(r())}),L=null;return typeof IntersectionObserver<`u`&&(L=new IntersectionObserver(e=>{let t=O.current;if(t)for(let n of e)Ii(t,n.isIntersecting)},{rootMargin:`64px`}),L.observe(t)),O.current&&k.current&&(vc.set(O.current,{handles:k.current,themeRef:A}),Ni(O.current)),Oa(),yc(),()=>{ka(),is(E.current),E.current=null,b.disconnect(),x?.removeEventListener(`change`,D),L?.disconnect(),P(),u!==0&&cancelAnimationFrame(u);let e=O.current;e&&(vc.delete(e),Pi(e),Mi(e)),O.current=null,k.current=null,n&&(n.innerHTML=``)}},[I]),(0,a.useEffect)(()=>{let e=O.current;e&&Fi(e,{opacityMul:Math.max(0,Math.min(1,i)),glowGain:Math.max(0,o)})},[i,o,t]),(0,a.useEffect)(()=>{let e=O.current,t=S.current;if(!e||!t||!u||P!==`dark`)return;e.onAfterFrame=lc;let n=u.flatMap(e=>{let t=`current`in e?e:e.ref,n=`current`in e?1:e.strength??1;return t.current?[{el:t.current,strength:n}]:[]});for(let{el:r,strength:i}of n)rc(r,e,t,i);return()=>{e.onAfterFrame=void 0;for(let{el:e}of n)ic(e)}},[u,P]),(0,a.useEffect)(()=>{let e=S.current,t=O.current;if(!e||!t)return;let n=R(t.cssWidth,t.cssHeight);Fi(t,{cornerRadius:n}),e.style.setProperty(`--mfx-radius`,`${n}px`),e.style.borderRadius=`${n}px`},[c,P,t,I]);let ee=(0,a.useMemo)(()=>({...y,"--mfx-strength":String(Math.min(1,Math.max(0,i))),opacity:+!!M,visibility:M?`visible`:`hidden`,transition:M?`opacity 0.15s ease-out`:`none`}),[y,i,M]);return F?(0,K.jsxs)(`div`,{...b,ref:S,className:v?`metal-fx-root ${v}`:`metal-fx-root`,"data-variant":t,"data-shape":I,"data-theme":P,"data-paused":s?`true`:void 0,"data-normalize":l?`true`:`false`,style:ee,children:[(0,K.jsx)(`canvas`,{ref:C,className:`metal-fx-canvas`,style:mc}),(0,K.jsx)(`div`,{className:`metal-fx-inner`,"aria-hidden":`true`,style:hc}),(0,K.jsx)(`div`,{ref:w,"aria-hidden":`true`,style:{...gc,display:L?void 0:`none`}}),f?(0,K.jsx)(`div`,{ref:T,"aria-hidden":`true`,style:_c}):null,(0,K.jsx)(`div`,{ref:D,className:`metal-fx-content`,children:e})]}):(0,K.jsx)(`div`,{...b,ref:S,className:v?`metal-fx-fallback ${v}`:`metal-fx-fallback`,"data-metal-fx-unsupported":``,style:{display:`inline-flex`,...y},children:e})});xc.displayName=`MetalFx`,Object.freeze({metalOpacity:.62,shaderScale:2.8,glowGain:2.5,innerShadow:{offsetY:1,blur:.5,alpha:.9}}),Object.freeze({metalOpacity:.8,shaderScale:1.6,core:Object.freeze({r:46,blur:100,a:.94,size:49}),gradient:0,glow:.41}),{...Object.freeze({enabled:!0,applyTo:`ring`,strength:.74,fadeInMs:200,fadeOutMs:350,smoothMs:140,reach:36,blob:13,liquidBlob:10,maxDisp:9,gain:.6,pressGain:.55,pullGain:.49,press:5,liquid:7.5,liquidReach:8,liquidStiffness:53,liquidDamping:9,stiffness:260,damping:13,mass:1,follow:.32,mapRes:2,smooth:.25})};function $(...e){return e.filter(Boolean).join(` `)}var Sc={primary:`bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600 disabled:bg-brand-400`,secondary:`bg-white text-gray-800 ring-1 ring-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-700`,danger:`bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400`,ghost:`text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800`};function Cc(){let e=()=>typeof document<`u`&&document.documentElement.classList.contains(`dark`)?`dark`:`light`,[t,n]=(0,a.useState)(e);return(0,a.useEffect)(()=>{let t=new MutationObserver(()=>n(e()));return t.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`]}),()=>t.disconnect()},[]),t}function wc(){let[e,t]=(0,a.useState)(()=>typeof window<`u`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches);return(0,a.useEffect)(()=>{let e=window.matchMedia(`(prefers-reduced-motion: reduce)`),n=()=>t(e.matches);return e.addEventListener(`change`,n),()=>e.removeEventListener(`change`,n)},[]),e}function Tc({children:e,variant:t=`button`,preset:n=`chromatic`,strength:r=1,paused:i=!1,borderRadius:a=8,className:o}){let s=Cc(),c=wc();return(0,K.jsx)(xc,{variant:t,preset:n,theme:s,strength:i?.5:r,paused:i||c,borderRadius:a,className:o,children:e})}function Ec({variant:e=`primary`,size:t=`md`,loading:n=!1,metal:r,className:i,children:a,...o}){let s=(0,K.jsxs)(`button`,{...o,disabled:o.disabled||n,className:$(`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60`,t===`sm`?`px-2.5 py-1.5 text-xs`:`px-3.5 py-2 text-sm`,Sc[e],i),children:[n&&(0,K.jsx)(x,{className:`h-4 w-4 animate-spin`}),a]});return r??e===`primary`?(0,K.jsx)(Tc,{paused:!!(o.disabled||n),children:s}):s}function Dc({label:e,className:t,children:n,...r}){return(0,K.jsx)(`button`,{type:`button`,"aria-label":e,title:e,...r,className:$(`inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100`,t),children:n})}var Oc=`block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500 disabled:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:disabled:bg-zinc-800`;function kc({className:e,...t}){return(0,K.jsx)(`input`,{...t,className:$(Oc,e)})}function Ac({className:e,rows:t=4,...n}){return(0,K.jsx)(`textarea`,{rows:t,...n,className:$(Oc,e)})}function jc({className:e,children:t,...n}){return(0,K.jsx)(`select`,{...n,className:$(Oc,`pr-8`,e),children:t})}function Mc({label:e,hint:t,error:n,children:r,className:i}){return(0,K.jsxs)(`label`,{className:$(`block space-y-1`,i),children:[e&&(0,K.jsx)(`span`,{className:`text-sm font-medium text-gray-700 dark:text-zinc-200`,children:e}),r,t&&!n&&(0,K.jsx)(`span`,{className:`block text-xs text-gray-500 dark:text-zinc-400`,children:t}),n&&(0,K.jsx)(`span`,{className:`block text-xs text-red-600`,children:n})]})}function Nc({checked:e,onChange:t,label:n,description:r,disabled:i}){return(0,K.jsxs)(`div`,{className:`flex items-start justify-between gap-4`,children:[(n||r)&&(0,K.jsxs)(`div`,{className:`min-w-0`,children:[n&&(0,K.jsx)(`div`,{className:`text-sm font-medium text-gray-800 dark:text-zinc-100`,children:n}),r&&(0,K.jsx)(`div`,{className:`text-xs text-gray-500 dark:text-zinc-400`,children:r})]}),(0,K.jsx)(`button`,{type:`button`,role:`switch`,"aria-checked":!!e,"aria-label":n,disabled:i,onClick:()=>t(!e),className:$(`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50`,e?`bg-brand-600`:`bg-gray-300 dark:bg-zinc-600`),children:(0,K.jsx)(`span`,{className:$(`inline-block h-5 w-5 rounded-full bg-white shadow transition`,e?`translate-x-5`:`translate-x-0.5`)})})]})}function Pc({title:e,description:t,actions:n,children:r,className:i}){return(0,K.jsxs)(`section`,{className:$(`rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900`,i),children:[(e||n)&&(0,K.jsxs)(`header`,{className:`flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-zinc-800`,children:[(0,K.jsxs)(`div`,{children:[e&&(0,K.jsx)(`h2`,{className:`text-base font-semibold`,children:e}),t&&(0,K.jsx)(`p`,{className:`mt-0.5 text-sm text-gray-500 dark:text-zinc-400`,children:t})]}),n&&(0,K.jsx)(`div`,{className:`flex shrink-0 items-center gap-2`,children:n})]}),(0,K.jsx)(`div`,{className:`p-5`,children:r})]})}var Fc={gray:`bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300`,green:`bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300`,red:`bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300`,amber:`bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`,blue:`bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200`};function Ic({color:e=`gray`,children:t,className:n}){return(0,K.jsx)(`span`,{className:$(`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium`,Fc[e],n),children:t})}function Lc({type:e=`info`,children:t}){return(0,K.jsx)(`div`,{role:e===`error`?`alert`:`status`,className:$(`rounded-xl px-4 py-3 text-sm ring-1`,{info:`bg-brand-50 text-brand-900 ring-brand-200 dark:bg-brand-900/20 dark:text-brand-100 dark:ring-brand-800`,success:`bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-100 dark:ring-emerald-800`,warning:`bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-100 dark:ring-amber-800`,error:`bg-red-50 text-red-900 ring-red-200 dark:bg-red-900/20 dark:text-red-100 dark:ring-red-800`}[e]),children:t})}function Rc({open:e,onClose:t,title:n,children:r,footer:i,wide:a}){return(0,K.jsxs)(Vr,{open:e,onClose:t,className:`relative z-50`,children:[(0,K.jsx)(zr,{className:`fixed inset-0 bg-black/50`}),(0,K.jsx)(`div`,{className:`fixed inset-0 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4`,children:(0,K.jsxs)(Rr,{className:$(`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl dark:bg-zinc-900 sm:rounded-2xl`,a?`sm:max-w-3xl`:`sm:max-w-lg`),children:[(0,K.jsxs)(`div`,{className:`flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-zinc-800`,children:[(0,K.jsx)(Br,{className:`text-base font-semibold`,children:n}),(0,K.jsx)(Dc,{label:`Schliessen`,onClick:t,children:(0,K.jsx)(C,{className:`h-4 w-4`})})]}),(0,K.jsx)(`div`,{className:`space-y-4 overflow-y-auto p-5`,children:r}),i&&(0,K.jsx)(`div`,{className:`flex justify-end gap-2 border-t border-gray-100 px-5 py-3 dark:border-zinc-800`,children:i})]})})]})}function zc({title:e,description:t,children:n}){return(0,K.jsxs)(`div`,{className:`rounded-2xl border border-dashed border-gray-300 p-10 text-center dark:border-zinc-700`,children:[(0,K.jsx)(`p`,{className:`font-medium`,children:e}),t&&(0,K.jsx)(`p`,{className:`mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-zinc-400`,children:t}),n&&(0,K.jsx)(`div`,{className:`mt-4`,children:n})]})}function Bc({className:e}){return(0,K.jsx)(x,{className:$(`h-4 w-4 animate-spin`,e)})}function Vc({columns:e,children:t,className:n}){return(0,K.jsx)(`div`,{className:$(`overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800`,n),children:(0,K.jsxs)(`table`,{className:`min-w-full divide-y divide-gray-200 text-sm dark:divide-zinc-800`,children:[(0,K.jsx)(`thead`,{className:`bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500 dark:bg-zinc-900 dark:text-zinc-400`,children:(0,K.jsx)(`tr`,{children:e.map(e=>(0,K.jsx)(`th`,{className:`whitespace-nowrap px-4 py-2.5 font-medium`,children:e},e))})}),(0,K.jsx)(`tbody`,{className:`divide-y divide-gray-100 dark:divide-zinc-800`,children:t})]})})}function Hc({children:e,className:t}){return(0,K.jsx)(`td`,{className:$(`px-4 py-2.5 align-top`,t),children:e})}export{a as $,At as A,$e as B,cn as C,Gt as D,Kt as E,xt as F,Oe as G,Be as H,bt as I,Se as J,ke as K,pt as L,jt as M,Lt as N,Ht as O,wt as P,be as Q,st as R,hn as S,nn as T,Fe as U,rt as V,Me as W,Ee as X,Te as Y,U as Z,$ as _,zc as a,z as at,gn as b,kc as c,F as ct,jc as d,j as dt,ne as et,Bc as f,O as ft,Nc as g,Ac as h,y as ht,Pc as i,B as it,kt as j,It as k,Tc as l,P as lt,Hc as m,x as mt,Ic as n,le as nt,Mc as o,R as ot,Vc as p,C as pt,De as q,Ec as r,H as rt,Dc as s,L as st,Lc as t,V as tt,Rc as u,N as ut,Ln as v,sn as w,G as x,bn as y,ut as z};