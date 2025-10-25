CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP
);

-- This trigger should be removed by preprocessor
CREATE TRIGGER update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END;

CREATE TABLE posts (
  id INT PRIMARY KEY,
  user_id INT,
  title VARCHAR(200),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- PostgreSQL function should also be removed
CREATE OR REPLACE FUNCTION notify_user()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('user_channel', NEW.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
