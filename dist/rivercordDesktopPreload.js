// Rivercord aedd0475
// Standalone: false
// Platform: win32
// Updater Disabled: false
"use strict";function a(e,t=300){let o;return function(...d){clearTimeout(o),o=setTimeout(()=>{e(...d)},t)}}var n=require("electron"),S=require("fs"),m=require("path");var i=require("electron");function r(e,...t){return i.ipcRenderer.invoke(e,...t)}function c(e,...t){return i.ipcRenderer.sendSync(e,...t)}var _={},p=c("RivercordGetPluginIpcMethodMap");for(let[e,t]of Object.entries(p)){let o=_[e]={};for(let[d,R]of Object.entries(t))o[d]=(...g)=>r(R,...g)}var s={themes:{uploadTheme:(e,t)=>r("RivercordUploadTheme",e,t),deleteTheme:e=>r("RivercordDeleteTheme",e),getThemesDir:()=>r("RivercordGetThemesDir"),getThemesList:()=>r("RivercordGetThemesList"),getThemeData:e=>r("RivercordGetThemeData",e),getSystemValues:()=>r("RivercordGetThemeSystemValues")},updater:{getUpdates:()=>r("RivercordGetUpdates"),update:()=>r("RivercordUpdate"),rebuild:()=>r("RivercordBuild"),getRepo:()=>r("RivercordGetRepo"),isUpdateRequired:()=>r("RivercordIsUpdateRequired")},settings:{get:()=>c("RivercordGetSettings"),set:(e,t)=>r("RivercordSetSettings",e,t),getSettingsDir:()=>r("RivercordGetSettingsDir")},quickCss:{get:()=>r("RivercordGetQuickCss"),set:e=>r("RivercordSetQuickCss",e),addChangeListener(e){i.ipcRenderer.on("RivercordQuickCssUpdate",(t,o)=>e(o))},addThemeChangeListener(e){i.ipcRenderer.on("RivercordThemeUpdate",()=>e())},openFile:()=>r("RivercordOpenQuickCss"),openEditor:()=>r("RivercordOpenMonacoEditor")},native:{getVersions:()=>process.versions,openExternal:e=>r("RivercordOpenExternal",e)},pluginHelpers:_};n.contextBridge.exposeInMainWorld("RivercordNative",s);if(location.protocol!=="data:"){let e=(0,m.join)(__dirname,"rivercordDesktopRenderer.css"),t=document.createElement("style");t.id="rivercord-css-core",t.textContent=(0,S.readFileSync)(e,"utf-8"),document.readyState==="complete"?document.documentElement.appendChild(t):document.addEventListener("DOMContentLoaded",()=>document.documentElement.appendChild(t),{once:!0})}else n.contextBridge.exposeInMainWorld("setCss",a(s.quickCss.set)),n.contextBridge.exposeInMainWorld("getCurrentCss",s.quickCss.get),n.contextBridge.exposeInMainWorld("getTheme",()=>"vs-dark");
//# sourceURL=RivercordPreload
//# sourceMappingURL=rivercord://rivercordDesktopPreload.js.map
