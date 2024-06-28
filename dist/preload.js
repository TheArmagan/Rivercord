// Rivercord beb2224a
// Standalone: false
// Platform: win32
// Updater Disabled: false
"use strict";function _(e,t=300){let i;return function(...d){clearTimeout(i),i=setTimeout(()=>{e(...d)},t)}}var o=require("electron"),a=require("fs"),c=require("path");var n=require("electron");function r(e,...t){return n.ipcRenderer.invoke(e,...t)}function m(e,...t){return n.ipcRenderer.sendSync(e,...t)}var S={},p=m("RivercordGetPluginIpcMethodMap");for(let[e,t]of Object.entries(p)){let i=S[e]={};for(let[d,R]of Object.entries(t))i[d]=(...g)=>r(R,...g)}var s={themes:{uploadTheme:(e,t)=>r("RivercordUploadTheme",e,t),deleteTheme:e=>r("RivercordDeleteTheme",e),getThemesDir:()=>r("RivercordGetThemesDir"),getThemesList:()=>r("RivercordGetThemesList"),getThemeData:e=>r("RivercordGetThemeData",e),getSystemValues:()=>r("RivercordGetThemeSystemValues")},updater:{getUpdates:()=>r("RivercordGetUpdates"),update:()=>r("RivercordUpdate"),rebuild:()=>r("RivercordBuild"),getRepo:()=>r("RivercordGetRepo")},settings:{get:()=>m("RivercordGetSettings"),set:(e,t)=>r("RivercordSetSettings",e,t),getSettingsDir:()=>r("RivercordGetSettingsDir")},quickCss:{get:()=>r("RivercordGetQuickCss"),set:e=>r("RivercordSetQuickCss",e),addChangeListener(e){n.ipcRenderer.on("RivercordQuickCssUpdate",(t,i)=>e(i))},addThemeChangeListener(e){n.ipcRenderer.on("RivercordThemeUpdate",()=>e())},openFile:()=>r("RivercordOpenQuickCss"),openEditor:()=>r("RivercordOpenMonacoEditor")},native:{getVersions:()=>process.versions,openExternal:e=>r("RivercordOpenExternal",e)},pluginHelpers:S};o.contextBridge.exposeInMainWorld("RivercordNative",s);if(location.protocol!=="data:"){let e=(0,c.join)(__dirname,"renderer.css"),t=document.createElement("style");t.id="rivercord-css-core",t.textContent=(0,a.readFileSync)(e,"utf-8"),document.readyState==="complete"?document.documentElement.appendChild(t):document.addEventListener("DOMContentLoaded",()=>document.documentElement.appendChild(t),{once:!0}),o.webFrame.executeJavaScript((0,a.readFileSync)((0,c.join)(__dirname,"renderer.js"),"utf-8")),require(process.env.DISCORD_PRELOAD)}else o.contextBridge.exposeInMainWorld("setCss",_(s.quickCss.set)),o.contextBridge.exposeInMainWorld("getCurrentCss",s.quickCss.get),o.contextBridge.exposeInMainWorld("getTheme",()=>"vs-dark");
//# sourceURL=RivercordPreload
//# sourceMappingURL=rivercord://preload.js.map
