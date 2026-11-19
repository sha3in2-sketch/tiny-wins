/* ==========================================================================
   TINYWINS OS — DATE UTILITIES
   ========================================================================== */
export const pad = (n) => String(n).padStart(2, '0');

export const key = (d) =>
  d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

export const dt = (k) => new Date(k + 'T00:00:00');

export const add = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const mon = (d) => add(d, -((d.getDay() + 6) % 7));

export const today = () => key(new Date());

export const rel = (k) => {
  const n = Math.round((dt(k) - dt(today())) / 864e5);
  return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n === -1 ? 'Yesterday' : '';
};

export const L = (d, o) => d.toLocaleDateString('en-GB', o);

export const monthTitle = (d) =>
  d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// Get month matrix of dates (including padding for leading and trailing days)
export function getMonthMatrix(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const startDate = add(firstDay, -startDayOfWeek);

  const matrix = [];
  for (let i = 0; i < 42; i++) {
    const current = add(startDate, i);
    matrix.push({
      date: current,
      key: key(current),
      dayNum: current.getDate(),
      isCurrentMonth: current.getMonth() === monthIndex,
      isToday: key(current) === today()
    });
  }
  return matrix;
}
