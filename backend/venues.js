const venueRows = (lengths) =>
  lengths.map((seats, index) => ({
    row: String.fromCharCode(65 + index),
    seats,
  }));

const VENUES = [
  {
    id: "balti-telliskivi",
    cinemaId: 1,
    rows: venueRows([10, 10, 10, 10, 10, 10, 8, 7]),
  },
  {
    id: "balti-elron",
    cinemaId: 1,
    rows: venueRows([10, 10, 10, 10, 10, 10, 8, 7]),
  },
  {
    id: "ylemiste-vanake",
    cinemaId: 3,
    rows: venueRows(Array(10).fill(10)),
  },
  {
    id: "oismae-ringi-saal",
    cinemaId: 2,
    rows: venueRows([10, 10, 10, 10, 10, 10, 8]),
  },
  {
    id: "oismae-harku",
    cinemaId: 2,
    rows: venueRows([10, 10, 10, 10, 10, 10, 6]),
  },
  {
    id: "oismae-oismae",
    cinemaId: 2,
    rows: venueRows([10, 10, 10, 10, 10, 10, 6]),
  },
];

function getVenue(venueId) {
  return VENUES.find((venue) => venue.id === venueId);
}

function getSeatRows(venue) {
  if (!venue) return null;
  return venue.rows.map(({ row, seats }) => ({
    row,
    seats: Array.from({ length: seats }, (_, index) => `${row}${index + 1}`),
  }));
}

function getVenueCapacity(venue) {
  return venue?.rows.reduce((total, row) => total + row.seats, 0) ?? 0;
}

function venueResponse(venue) {
  return {
    id: venue.id,
    cinemaId: venue.cinemaId,
    capacity: getVenueCapacity(venue),
    rows: getSeatRows(venue),
  };
}

module.exports = { VENUES, getVenue, getSeatRows, getVenueCapacity, venueResponse };
