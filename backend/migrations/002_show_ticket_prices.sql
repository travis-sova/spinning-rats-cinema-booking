ALTER TABLE shows
  ADD COLUMN adult_price_cents INT NOT NULL DEFAULT 1060,
  ADD COLUMN student_price_cents INT NOT NULL DEFAULT 838,
  ADD COLUMN senior_price_cents INT NOT NULL DEFAULT 645,
  ADD COLUMN child_price_cents INT NOT NULL DEFAULT 645;

UPDATE shows s
JOIN movies m ON m.id = s.movie
SET s.adult_price_cents = m.adult_price_cents,
    s.student_price_cents = m.student_price_cents,
    s.senior_price_cents = m.senior_price_cents,
    s.child_price_cents = m.child_price_cents;

ALTER TABLE movies
  DROP COLUMN adult_price_cents,
  DROP COLUMN student_price_cents,
  DROP COLUMN senior_price_cents,
  DROP COLUMN child_price_cents;
