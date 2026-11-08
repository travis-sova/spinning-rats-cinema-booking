ALTER TABLE orders
  ADD COLUMN user_id INT NULL,
  ADD INDEX orders_user_id_idx (user_id),
  ADD CONSTRAINT orders_user_fk
    FOREIGN KEY (user_id) REFERENCES `user` (`id`) ON DELETE SET NULL;

ALTER TABLE shows
  MODIFY COLUMN seats INT NOT NULL DEFAULT 100;
