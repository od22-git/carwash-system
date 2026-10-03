-- Separate databases for automated tests, so tests never touch development data.
CREATE DATABASE carwash_test OWNER carwash;
CREATE DATABASE carwash_e2e OWNER carwash;
