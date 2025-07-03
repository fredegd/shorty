-- Create a stored procedure for atomic click count increment
CREATE OR REPLACE FUNCTION increment_click_count(short_code_param VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE urls 
  SET 
    click_count = COALESCE(click_count, 0) + 1,
    last_accessed = NOW()
  WHERE short_code = short_code_param;
END;
$$ LANGUAGE plpgsql;
