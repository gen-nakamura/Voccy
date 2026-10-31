const { validateSettings } = require('./database.cjs');
function nextDelay(times, now = new Date()) {
  if (!times.length) return null;
  return Math.min(...times.map(time => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    if (date <= now) date.setDate(date.getDate() + 1);
    return date.getTime() - now.getTime();
  }));
}
function createReminders(database, notify, timers = { setTimeout, clearTimeout }) {
  let timer = null;
  let generation = 0;
  function stop() {
    generation++;
    if (timer !== null) timers.clearTimeout(timer);
    timer = null;
  }
  function schedule() {
    stop();
    const token = generation;
    let settings;
    try { settings = validateSettings(database.settings()); }
    catch { return; } // Invalid legacy reminder values cannot create a rapid timer loop.
    if (!settings.remind_enabled) return;
    const delay = nextDelay(JSON.parse(settings.remind_times));
    timer = timers.setTimeout(() => {
      timer = null;
      if (token !== generation) return;
      try {
        const current = validateSettings(database.settings());
        const count = current.remind_enabled ? database.quiz().length : 0;
        if (count) notify(count);
      } catch (error) { console.error('Reminder failed:', error.message); }
      if (token === generation) schedule();
    }, delay);
  }
  return { schedule, stop };
}
module.exports = { nextDelay, createReminders };
