// Rivercord 14672b59
// Standalone: false
// Platform: win32
// Updater Disabled: false
"use strict";

// src/shared/debounce.ts
function debounce(func, delay = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

// src/preload.ts
var import_electron2 = require("electron");
var import_fs = require("fs");
var import_path = require("path");

// src/RivercordNative.ts
var import_electron = require("electron");
function invoke(event, ...args) {
  return import_electron.ipcRenderer.invoke(event, ...args);
}
function sendSync(event, ...args) {
  return import_electron.ipcRenderer.sendSync(event, ...args);
}
var PluginHelpers = {};
var pluginIpcMap = sendSync("RivercordGetPluginIpcMethodMap" /* GET_PLUGIN_IPC_METHOD_MAP */);
for (const [plugin, methods] of Object.entries(pluginIpcMap)) {
  const map = PluginHelpers[plugin] = {};
  for (const [methodName, method] of Object.entries(methods)) {
    map[methodName] = (...args) => invoke(method, ...args);
  }
}
var RivercordNative_default = {
  themes: {
    uploadTheme: (fileName, fileData) => invoke("RivercordUploadTheme" /* UPLOAD_THEME */, fileName, fileData),
    deleteTheme: (fileName) => invoke("RivercordDeleteTheme" /* DELETE_THEME */, fileName),
    getThemesDir: () => invoke("RivercordGetThemesDir" /* GET_THEMES_DIR */),
    getThemesList: () => invoke("RivercordGetThemesList" /* GET_THEMES_LIST */),
    getThemeData: (fileName) => invoke("RivercordGetThemeData" /* GET_THEME_DATA */, fileName),
    getSystemValues: () => invoke("RivercordGetThemeSystemValues" /* GET_THEME_SYSTEM_VALUES */)
  },
  updater: {
    getUpdates: () => invoke("RivercordGetUpdates" /* GET_UPDATES */),
    update: () => invoke("RivercordUpdate" /* UPDATE */),
    rebuild: () => invoke("RivercordBuild" /* BUILD */),
    getRepo: () => invoke("RivercordGetRepo" /* GET_REPO */)
  },
  settings: {
    get: () => sendSync("RivercordGetSettings" /* GET_SETTINGS */),
    set: (settings, pathToNotify) => invoke("RivercordSetSettings" /* SET_SETTINGS */, settings, pathToNotify),
    getSettingsDir: () => invoke("RivercordGetSettingsDir" /* GET_SETTINGS_DIR */)
  },
  quickCss: {
    get: () => invoke("RivercordGetQuickCss" /* GET_QUICK_CSS */),
    set: (css) => invoke("RivercordSetQuickCss" /* SET_QUICK_CSS */, css),
    addChangeListener(cb) {
      import_electron.ipcRenderer.on("RivercordQuickCssUpdate" /* QUICK_CSS_UPDATE */, (_, css) => cb(css));
    },
    addThemeChangeListener(cb) {
      import_electron.ipcRenderer.on("RivercordThemeUpdate" /* THEME_UPDATE */, () => cb());
    },
    openFile: () => invoke("RivercordOpenQuickCss" /* OPEN_QUICKCSS */),
    openEditor: () => invoke("RivercordOpenMonacoEditor" /* OPEN_MONACO_EDITOR */)
  },
  native: {
    getVersions: () => process.versions,
    openExternal: (url) => invoke("RivercordOpenExternal" /* OPEN_EXTERNAL */, url)
  },
  pluginHelpers: PluginHelpers
};

// src/preload.ts
import_electron2.contextBridge.exposeInMainWorld("RivercordNative", RivercordNative_default);
if (location.protocol !== "data:") {
  const rendererCss = (0, import_path.join)(__dirname, true ? "rivercordDesktopRenderer.css" : "renderer.css");
  const style = document.createElement("style");
  style.id = "rivercord-css-core";
  style.textContent = (0, import_fs.readFileSync)(rendererCss, "utf-8");
  if (document.readyState === "complete") {
    document.documentElement.appendChild(style);
  } else {
    document.addEventListener("DOMContentLoaded", () => document.documentElement.appendChild(style), {
      once: true
    });
  }
  if (true) {
    (0, import_fs.watch)(rendererCss, { persistent: false }, () => {
      document.getElementById("rivercord-css-core").textContent = (0, import_fs.readFileSync)(rendererCss, "utf-8");
    });
  }
  if (false) {
    webFrame.executeJavaScript((0, import_fs.readFileSync)((0, import_path.join)(__dirname, "renderer.js"), "utf-8"));
    require(process.env.DISCORD_PRELOAD);
  }
} else {
  import_electron2.contextBridge.exposeInMainWorld("setCss", debounce(RivercordNative_default.quickCss.set));
  import_electron2.contextBridge.exposeInMainWorld("getCurrentCss", RivercordNative_default.quickCss.get);
  import_electron2.contextBridge.exposeInMainWorld("getTheme", () => "vs-dark");
}
//# sourceURL=RivercordPreload

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL3NoYXJlZC9kZWJvdW5jZS50cyIsICIuLi9zcmMvcHJlbG9hZC50cyIsICIuLi9zcmMvUml2ZXJjb3JkTmF0aXZlLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKlxuICogUml2ZXJjb3JkLCBhIG1vZGlmaWNhdGlvbiBmb3IgRGlzY29yZCdzIGRlc2t0b3AgYXBwXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjIgVmVuZGljYXRlZCBhbmQgY29udHJpYnV0b3JzXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS4gIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4qL1xuXG4vKipcbiAqIFJldHVybnMgYSBuZXcgZnVuY3Rpb24gdGhhdCB3aWxsIGNhbGwgdGhlIHdyYXBwZWQgZnVuY3Rpb25cbiAqIGFmdGVyIHRoZSBzcGVjaWZpZWQgZGVsYXkuIElmIHRoZSBmdW5jdGlvbiBpcyBjYWxsZWQgYWdhaW5cbiAqIHdpdGhpbiB0aGUgZGVsYXksIHRoZSB0aW1lciB3aWxsIGJlIHJlc2V0LlxuICogQHBhcmFtIGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXBcbiAqIEBwYXJhbSBkZWxheSBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWJvdW5jZTxUIGV4dGVuZHMgRnVuY3Rpb24+KGZ1bmM6IFQsIGRlbGF5ID0gMzAwKTogVCB7XG4gICAgbGV0IHRpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0O1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7IGZ1bmMoLi4uYXJncyk7IH0sIGRlbGF5KTtcbiAgICB9IGFzIGFueTtcbn1cbiIsICIvKlxuICogUml2ZXJjb3JkLCBhIG1vZGlmaWNhdGlvbiBmb3IgRGlzY29yZCdzIGRlc2t0b3AgYXBwXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjIgVmVuZGljYXRlZCBhbmQgY29udHJpYnV0b3JzXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS4gIElmIG5vdCwgc2VlIDxodHRwczovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4qL1xuXG5pbXBvcnQgeyBkZWJvdW5jZSB9IGZyb20gXCJAc2hhcmVkL2RlYm91bmNlXCI7XG5pbXBvcnQgeyBjb250ZXh0QnJpZGdlLCB3ZWJGcmFtZSB9IGZyb20gXCJlbGVjdHJvblwiO1xuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCB3YXRjaCB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5cbmltcG9ydCBSaXZlcmNvcmROYXRpdmUgZnJvbSBcIi4vUml2ZXJjb3JkTmF0aXZlXCI7XG5cbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoXCJSaXZlcmNvcmROYXRpdmVcIiwgUml2ZXJjb3JkTmF0aXZlKTtcblxuLy8gRGlzY29yZFxuaWYgKGxvY2F0aW9uLnByb3RvY29sICE9PSBcImRhdGE6XCIpIHtcbiAgICAvLyAjcmVnaW9uIGNzc0luc2VydFxuICAgIGNvbnN0IHJlbmRlcmVyQ3NzID0gam9pbihfX2Rpcm5hbWUsIElTX1ZFU0tUT1AgPyBcInJpdmVyY29yZERlc2t0b3BSZW5kZXJlci5jc3NcIiA6IFwicmVuZGVyZXIuY3NzXCIpO1xuXG4gICAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gICAgc3R5bGUuaWQgPSBcInJpdmVyY29yZC1jc3MtY29yZVwiO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gcmVhZEZpbGVTeW5jKHJlbmRlcmVyQ3NzLCBcInV0Zi04XCIpO1xuXG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIikge1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChzdHlsZSksIHtcbiAgICAgICAgICAgIG9uY2U6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKElTX0RFVikge1xuICAgICAgICAvLyBwZXJzaXN0ZW50IG1lYW5zIGtlZXAgcHJvY2VzcyBydW5uaW5nIGlmIHdhdGNoZXIgaXMgdGhlIG9ubHkgdGhpbmcgc3RpbGwgcnVubmluZ1xuICAgICAgICAvLyB3aGljaCB3ZSBvYnZpb3VzbHkgZG9uJ3Qgd2FudFxuICAgICAgICB3YXRjaChyZW5kZXJlckNzcywgeyBwZXJzaXN0ZW50OiBmYWxzZSB9LCAoKSA9PiB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJpdmVyY29yZC1jc3MtY29yZVwiKSEudGV4dENvbnRlbnQgPSByZWFkRmlsZVN5bmMocmVuZGVyZXJDc3MsIFwidXRmLThcIik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyAjZW5kcmVnaW9uXG5cbiAgICBpZiAoSVNfRElTQ09SRF9ERVNLVE9QKSB7XG4gICAgICAgIHdlYkZyYW1lLmV4ZWN1dGVKYXZhU2NyaXB0KHJlYWRGaWxlU3luYyhqb2luKF9fZGlybmFtZSwgXCJyZW5kZXJlci5qc1wiKSwgXCJ1dGYtOFwiKSk7XG4gICAgICAgIHJlcXVpcmUocHJvY2Vzcy5lbnYuRElTQ09SRF9QUkVMT0FEISk7XG4gICAgfVxufSAvLyBNb25hY28gcG9wb3V0XG5lbHNlIHtcbiAgICBjb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKFwic2V0Q3NzXCIsIGRlYm91bmNlKFJpdmVyY29yZE5hdGl2ZS5xdWlja0Nzcy5zZXQpKTtcbiAgICBjb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKFwiZ2V0Q3VycmVudENzc1wiLCBSaXZlcmNvcmROYXRpdmUucXVpY2tDc3MuZ2V0KTtcbiAgICAvLyBzaHJ1Z1xuICAgIGNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoXCJnZXRUaGVtZVwiLCAoKSA9PiBcInZzLWRhcmtcIik7XG59XG4iLCAiLypcbiAqIFJpdmVyY29yZCwgYSBEaXNjb3JkIGNsaWVudCBtb2RcbiAqIENvcHlyaWdodCAoYykgMjAyMyBWZW5kaWNhdGVkIGFuZCBjb250cmlidXRvcnNcbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBHUEwtMy4wLW9yLWxhdGVyXG4gKi9cblxuaW1wb3J0IHsgUGx1Z2luSXBjTWFwcGluZ3MgfSBmcm9tIFwiQG1haW4vaXBjUGx1Z2luc1wiO1xuaW1wb3J0IHR5cGUgeyBVc2VyVGhlbWVIZWFkZXIgfSBmcm9tIFwiQG1haW4vdGhlbWVzXCI7XG5pbXBvcnQgeyBJcGNFdmVudHMgfSBmcm9tIFwiQHNoYXJlZC9JcGNFdmVudHNcIjtcbmltcG9ydCB7IElwY1JlcyB9IGZyb20gXCJAdXRpbHMvdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgU2V0dGluZ3MgfSBmcm9tIFwiYXBpL1NldHRpbmdzXCI7XG5pbXBvcnQgeyBpcGNSZW5kZXJlciB9IGZyb20gXCJlbGVjdHJvblwiO1xuXG5mdW5jdGlvbiBpbnZva2U8VCA9IGFueT4oZXZlbnQ6IElwY0V2ZW50cywgLi4uYXJnczogYW55W10pIHtcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuaW52b2tlKGV2ZW50LCAuLi5hcmdzKSBhcyBQcm9taXNlPFQ+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VuZFN5bmM8VCA9IGFueT4oZXZlbnQ6IElwY0V2ZW50cywgLi4uYXJnczogYW55W10pIHtcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuc2VuZFN5bmMoZXZlbnQsIC4uLmFyZ3MpIGFzIFQ7XG59XG5cbmNvbnN0IFBsdWdpbkhlbHBlcnMgPSB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCAoLi4uYXJnczogYW55W10pID0+IFByb21pc2U8YW55Pj4+O1xuY29uc3QgcGx1Z2luSXBjTWFwID0gc2VuZFN5bmM8UGx1Z2luSXBjTWFwcGluZ3M+KElwY0V2ZW50cy5HRVRfUExVR0lOX0lQQ19NRVRIT0RfTUFQKTtcblxuZm9yIChjb25zdCBbcGx1Z2luLCBtZXRob2RzXSBvZiBPYmplY3QuZW50cmllcyhwbHVnaW5JcGNNYXApKSB7XG4gICAgY29uc3QgbWFwID0gUGx1Z2luSGVscGVyc1twbHVnaW5dID0ge307XG4gICAgZm9yIChjb25zdCBbbWV0aG9kTmFtZSwgbWV0aG9kXSBvZiBPYmplY3QuZW50cmllcyhtZXRob2RzKSkge1xuICAgICAgICBtYXBbbWV0aG9kTmFtZV0gPSAoLi4uYXJnczogYW55W10pID0+IGludm9rZShtZXRob2QgYXMgSXBjRXZlbnRzLCAuLi5hcmdzKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICB0aGVtZXM6IHtcbiAgICAgICAgdXBsb2FkVGhlbWU6IChmaWxlTmFtZTogc3RyaW5nLCBmaWxlRGF0YTogc3RyaW5nKSA9PiBpbnZva2U8dm9pZD4oSXBjRXZlbnRzLlVQTE9BRF9USEVNRSwgZmlsZU5hbWUsIGZpbGVEYXRhKSxcbiAgICAgICAgZGVsZXRlVGhlbWU6IChmaWxlTmFtZTogc3RyaW5nKSA9PiBpbnZva2U8dm9pZD4oSXBjRXZlbnRzLkRFTEVURV9USEVNRSwgZmlsZU5hbWUpLFxuICAgICAgICBnZXRUaGVtZXNEaXI6ICgpID0+IGludm9rZTxzdHJpbmc+KElwY0V2ZW50cy5HRVRfVEhFTUVTX0RJUiksXG4gICAgICAgIGdldFRoZW1lc0xpc3Q6ICgpID0+IGludm9rZTxBcnJheTxVc2VyVGhlbWVIZWFkZXI+PihJcGNFdmVudHMuR0VUX1RIRU1FU19MSVNUKSxcbiAgICAgICAgZ2V0VGhlbWVEYXRhOiAoZmlsZU5hbWU6IHN0cmluZykgPT4gaW52b2tlPHN0cmluZyB8IHVuZGVmaW5lZD4oSXBjRXZlbnRzLkdFVF9USEVNRV9EQVRBLCBmaWxlTmFtZSksXG4gICAgICAgIGdldFN5c3RlbVZhbHVlczogKCkgPT4gaW52b2tlPFJlY29yZDxzdHJpbmcsIHN0cmluZz4+KElwY0V2ZW50cy5HRVRfVEhFTUVfU1lTVEVNX1ZBTFVFUyksXG4gICAgfSxcblxuICAgIHVwZGF0ZXI6IHtcbiAgICAgICAgZ2V0VXBkYXRlczogKCkgPT4gaW52b2tlPElwY1JlczxSZWNvcmQ8XCJoYXNoXCIgfCBcImF1dGhvclwiIHwgXCJtZXNzYWdlXCIsIHN0cmluZz5bXT4+KElwY0V2ZW50cy5HRVRfVVBEQVRFUyksXG4gICAgICAgIHVwZGF0ZTogKCkgPT4gaW52b2tlPElwY1Jlczxib29sZWFuPj4oSXBjRXZlbnRzLlVQREFURSksXG4gICAgICAgIHJlYnVpbGQ6ICgpID0+IGludm9rZTxJcGNSZXM8Ym9vbGVhbj4+KElwY0V2ZW50cy5CVUlMRCksXG4gICAgICAgIGdldFJlcG86ICgpID0+IGludm9rZTxJcGNSZXM8c3RyaW5nPj4oSXBjRXZlbnRzLkdFVF9SRVBPKSxcbiAgICB9LFxuXG4gICAgc2V0dGluZ3M6IHtcbiAgICAgICAgZ2V0OiAoKSA9PiBzZW5kU3luYzxTZXR0aW5ncz4oSXBjRXZlbnRzLkdFVF9TRVRUSU5HUyksXG4gICAgICAgIHNldDogKHNldHRpbmdzOiBTZXR0aW5ncywgcGF0aFRvTm90aWZ5Pzogc3RyaW5nKSA9PiBpbnZva2U8dm9pZD4oSXBjRXZlbnRzLlNFVF9TRVRUSU5HUywgc2V0dGluZ3MsIHBhdGhUb05vdGlmeSksXG4gICAgICAgIGdldFNldHRpbmdzRGlyOiAoKSA9PiBpbnZva2U8c3RyaW5nPihJcGNFdmVudHMuR0VUX1NFVFRJTkdTX0RJUiksXG4gICAgfSxcblxuICAgIHF1aWNrQ3NzOiB7XG4gICAgICAgIGdldDogKCkgPT4gaW52b2tlPHN0cmluZz4oSXBjRXZlbnRzLkdFVF9RVUlDS19DU1MpLFxuICAgICAgICBzZXQ6IChjc3M6IHN0cmluZykgPT4gaW52b2tlPHZvaWQ+KElwY0V2ZW50cy5TRVRfUVVJQ0tfQ1NTLCBjc3MpLFxuXG4gICAgICAgIGFkZENoYW5nZUxpc3RlbmVyKGNiOiAobmV3Q3NzOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgICAgICAgICAgIGlwY1JlbmRlcmVyLm9uKElwY0V2ZW50cy5RVUlDS19DU1NfVVBEQVRFLCAoXywgY3NzKSA9PiBjYihjc3MpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRUaGVtZUNoYW5nZUxpc3RlbmVyKGNiOiAoKSA9PiB2b2lkKSB7XG4gICAgICAgICAgICBpcGNSZW5kZXJlci5vbihJcGNFdmVudHMuVEhFTUVfVVBEQVRFLCAoKSA9PiBjYigpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvcGVuRmlsZTogKCkgPT4gaW52b2tlPHZvaWQ+KElwY0V2ZW50cy5PUEVOX1FVSUNLQ1NTKSxcbiAgICAgICAgb3BlbkVkaXRvcjogKCkgPT4gaW52b2tlPHZvaWQ+KElwY0V2ZW50cy5PUEVOX01PTkFDT19FRElUT1IpLFxuICAgIH0sXG5cbiAgICBuYXRpdmU6IHtcbiAgICAgICAgZ2V0VmVyc2lvbnM6ICgpID0+IHByb2Nlc3MudmVyc2lvbnMgYXMgUGFydGlhbDxOb2RlSlMuUHJvY2Vzc1ZlcnNpb25zPixcbiAgICAgICAgb3BlbkV4dGVybmFsOiAodXJsOiBzdHJpbmcpID0+IGludm9rZTx2b2lkPihJcGNFdmVudHMuT1BFTl9FWFRFUk5BTCwgdXJsKVxuICAgIH0sXG5cbiAgICBwbHVnaW5I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
