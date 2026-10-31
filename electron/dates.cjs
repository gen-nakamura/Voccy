// Existing databases store local wall-clock minutes, without an offset.
// Preserve that convention; never compare these values with SQLite UTC 'now'.
function formatLocal(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function parseLocal(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(value || '');
  if (!match) throw new Error('Invalid local timestamp');
  const [, y, m, d, h, min] = match.map(Number);
  const date = new Date(y, m - 1, d, h, min);
  if (formatLocal(date) !== value) throw new Error('Invalid local date');
  return date;
}
function nextTimestamp(card, random = Math.random) {
  if (card.latest_result === 'done') return null;
  const intervals = {
    null: { null: 0.2, cross: 0.5, circle: 1, check: 2 },
    cross: { cross: 0.5, circle: 1, check: 2 },
    circle: { cross: 0.5, circle: 3, check: 4 },
    check: { cross: 0.5, circle: 3, check: 30 },
    done: { cross: 0.5, circle: 1, check: 2 }
  };
  const days = intervals[String(card.previous_result)]?.[String(card.latest_result)];
  if (days == null) return null;
  const date = parseLocal(card.latest_test_timestamp);
  date.setTime(date.getTime() + days * 0.5 * (0.8 + random() * 0.5) * 86400000);
  return formatLocal(date);
}
function reviewResult(card, result) {
  if (!['cross', 'circle', 'check'].includes(result)) throw new Error('Invalid review result');
  // Three consecutive checks, including THIS answer, mean mastered.
  return result === 'check' && card.previous_result === 'check' && card.latest_result === 'check' ? 'done' : result;
}
module.exports = { formatLocal, parseLocal, nextTimestamp, reviewResult };
