export const LOG_USER_LOGIN_QUERY = `
  INSERT INTO neusentra.user_login (user_id, login_at, logout_at)
  VALUES ($1, NOW(), NOW()) 
  RETURNING id;
`;