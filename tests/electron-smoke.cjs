// Integration harness: real Electron, real sandboxed renderer, isolated data.
const { app, BrowserWindow, netLog } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const evidence = path.join(root, 'evidence');
fs.mkdirSync(evidence, { recursive: true });
app.setPath('userData', path.join(evidence, `profile-${Date.now()}`));
const events = [];
const errors = [];
// Instrument Node socket/DNS entry points as well as Chromium net-log.
for (const [name, members] of [['node:net', ['connect', 'createConnection']], ['node:dns', ['lookup', 'resolve', 'resolve4', 'resolve6']], ['node:http', ['request', 'get']], ['node:https', ['request', 'get']], ['node:dgram', ['createSocket']]]) {
  const mod = require(name);
  for (const member of members) {
    const original = mod[member];
    mod[member] = function (...args) { events.push({ module: name, member }); return original.apply(this, args); };
  }
}
let failTimer = setTimeout(() => { console.error('SMOKE TIMEOUT', errors); app.exit(1); }, 45000);
app.on('web-contents-created', (_event, contents) => {
  contents.on('console-message', (...args) => { const details = args[1]; if (typeof details === 'object' && details.level === 'error') errors.push(details.message); });
  contents.on('did-finish-load', async () => {
    try {
      await contents.executeJavaScript(`(async () => {
        const wait = () => new Promise(r => setTimeout(r, 80));
        if (window.require || window.process) throw Error('Node leaked to renderer');
        if (Object.keys(window.voccy).sort().join(',') !== 'add,changeSettings,edit,list,quiz,remove,review') throw Error('Bad IPC surface');
        const input = (selector, value) => { const el = document.querySelector(selector); el.value = value; el.dispatchEvent(new Event('input', { bubbles:true })); };
        await wait(); input('#question', 'smoke日本語 <script>alert(1)</script>'); input('#answer', 'offline answer\\n二行目'); await wait();
        document.querySelector('form').dispatchEvent(new Event('submit', { bubbles:true, cancelable:true })); await wait();
        let data = await window.voccy.list(); if (data.flashcards.length !== 1) throw Error('UI add failed');
        const c = data.flashcards[0];
        await window.voccy.edit({ id:c.id, question:'edited smoke', answer:'edited meaning' });
        data = await window.voccy.list(); if (data.flashcards[0].answer !== 'edited meaning') throw Error('Edit failed');
        await window.voccy.changeSettings({ remind_enabled:0, remind_times:'[]', max_test_nums:5 });
        document.querySelectorAll('nav button')[2].click(); await wait(); input('#search', 'missing'); await wait(); if(document.querySelectorAll('tbody tr').length) throw Error('Search failed');
        input('#search','edited'); await wait(); if(document.querySelectorAll('tbody tr').length !== 1) throw Error('Search match failed');
        await window.voccy.review({ id:c.id, result:'cross', expected_previous:c.previous_result, expected_latest:c.latest_result, expected_timestamp:c.latest_test_timestamp });
        data = await window.voccy.list(); if(data.flashcards[0].latest_result !== 'cross') throw Error('Review failed');
        let rejected = false; try { await window.voccy.changeSettings({ remind_enabled:1, remind_times:'[]', max_test_nums:0 }); } catch { rejected=true; } if(!rejected) throw Error('Invalid settings accepted');
        await window.voccy.remove({id:c.id}); if((await window.voccy.list()).flashcards.length) throw Error('Delete failed');
        return { title:document.title, body:document.body.innerText, isolated:!window.require && !window.process };
      })()`);
      const win = BrowserWindow.fromWebContents(contents);
      fs.writeFileSync(path.join(evidence, 'smoke.png'), (await win.capturePage()).toPNG());
      await new Promise(resolve => setTimeout(resolve, 3000));
      await netLog.stopLogging();
      assert.equal(events.length, 0, 'Unexpected Node network operation');
      assert.equal(errors.length, 0, 'Renderer errors');
      fs.writeFileSync(path.join(evidence, 'smoke.json'), JSON.stringify({ passed:true, versions:process.versions, nodeNetworkCalls:events, rendererErrors:errors, webPreferences:contents.getLastWebPreferences() }, null, 2));
      clearTimeout(failTimer); failTimer = null;
      app.quit();
    } catch (error) {
      console.error(error);
      fs.writeFileSync(path.join(evidence,'smoke-failure.txt'), error.stack);
      app.exit(1);
    }
  });
});
app.whenReady().then(() => netLog.startLogging(path.join(evidence, 'chromium-netlog.json'), { captureMode: 'default' }));
require('../electron/main.cjs');
