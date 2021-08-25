-- debug: connection info
-- \connifo
-- Create role-user used by application
CREATE ROLE bogan WITH PASSWORD '123';
-- Allow role to setup Database
ALTER ROLE bogan CREATEDB;
-- debug: dump permissions of roles
\du
-- quit
\q
