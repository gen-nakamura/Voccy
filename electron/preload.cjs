const { contextBridge, ipcRenderer } = require('electron');
// A fixed set of domain operations; never expose ipcRenderer or arbitrary channels.
const methods = ['list', 'quiz', 'add', 'edit', 'remove', 'review', 'changeSettings'];
contextBridge.exposeInMainWorld('voccy', Object.freeze(Object.fromEntries(methods.map(method => [method, async value => {
  const result = await ipcRenderer.invoke(`voccy:${method}`, value);
  if (!result.ok) throw new Error(result.error);
  return result.data;
}]))));
