export function read(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback; } catch { return fallback; }
}
export function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
export function remaining(deadline, now = Date.now()) { return Math.max(0, Math.ceil((deadline - now) / 1000)); }
export function record(progress, id, accepted) {
  const old = progress[id] || {};
  return {...progress, [id]:{attempts:(old.attempts || 0)+1, solved:!!old.solved || accepted, lastAttempt:new Date().toISOString()}};
}

export function canExecute(deadline, now = Date.now()) { return Number.isFinite(deadline) && deadline > now; }
