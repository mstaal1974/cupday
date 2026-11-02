/* The documents use venue-local times on 3 November 2026. */
(function (root) {
  const raceDate = '2026-11-03';
  const timeFormat = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Brisbane', hour: 'numeric', minute: '2-digit', hour12: true
  });
  function startTime(venue, race) {
    const match = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(race.time);
    if (!match) throw new Error('Invalid race time: ' + race.time);
    const hour = Number(match[1]) % 12 + (match[3].toLowerCase() === 'pm' ? 12 : 0);
    const offset = venue.timezone === 'AEDT' ? '+11:00' : '+10:00';
    return new Date(`${raceDate}T${String(hour).padStart(2, '0')}:${match[2]}:00${offset}`).getTime();
  }
  function brisbaneTime(venue, race) {
    return timeFormat.format(startTime(venue, race));
  }
  function upcoming(venues, now = Date.now()) {
    return venues.flatMap(v => v.races.map(r => ({v, r, start: startTime(v, r)})))
      .filter(item => item.start > now)
      .sort((a, b) => a.start - b.start || a.v.name.localeCompare(b.v.name));
  }
  function countdown(start, now = Date.now()) {
    const seconds = Math.max(0, Math.ceil((start - now) / 1000));
    if (seconds === 0) return 'Scheduled start reached';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    if (days) return `Starts in ${days}d ${hours}h`;
    if (hours) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m ${String(seconds % 60).padStart(2, '0')}s`;
  }
  const api = {raceDate, startTime, brisbaneTime, upcoming, countdown};
  root.CupdayTime = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
