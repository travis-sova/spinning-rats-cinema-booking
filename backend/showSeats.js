const MIN_SEAT_LAYOUT = 100;

function getSeatLayoutCount(capacity) {
  return Math.max(MIN_SEAT_LAYOUT, Math.max(0, Number(capacity) || 0));
}

function getBaselineReservedSeats(capacity) {
  const reservedCount = getSeatLayoutCount(capacity) - Math.max(0, Number(capacity) || 0);
  return Array.from(
    { length: reservedCount },
    (_, index) => `S${index + 1}`
  );
}

module.exports = { MIN_SEAT_LAYOUT, getSeatLayoutCount, getBaselineReservedSeats };
