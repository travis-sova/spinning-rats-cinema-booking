const DEFAULT_TICKET_PRICES_CENTS = Object.freeze({
  Adult: 1060,
  Student: 838,
  Senior: 645,
  Child: 645,
});

const SHOW_PRICE_COLUMNS = Object.freeze({
  Adult: "adult_price_cents",
  Student: "student_price_cents",
  Senior: "senior_price_cents",
  Child: "child_price_cents",
});

module.exports = {
  DEFAULT_TICKET_PRICES_CENTS,
  SHOW_PRICE_COLUMNS,
};
