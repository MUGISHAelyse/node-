SHOPWISE AI — XAMPP BACKEND

1. Copy the whole `backend` folder into `C:\xampp\htdocs\shopwise\backend`.
2. In XAMPP, start Apache and MySQL.
3. Open http://localhost/phpmyadmin, choose Import, and import `database/shopwise_ai.sql` from the project ZIP.
4. Confirm `backend/api.php` has the correct MySQL credentials (default XAMPP is root with a blank password).
5. API base URL: http://localhost/shopwise/backend/api.php?route=...
6. Start React with `npm install` then `npm run dev`.

Routes included: GET products, admin-only product create/update/delete, signup, login, current session, logout, contact messages, and authenticated order create/list. PHP sessions are cookie-based and the default CORS origin is http://localhost:5173. If Vite uses another port, update $allowedOrigin in api.php.

ADMIN ACCOUNT
For safety, no default admin password is inserted into the SQL file. To promote an account to admin, first sign up through the website, then run this SQL in phpMyAdmin (replace the email):
UPDATE users SET role='admin' WHERE email='your-email@example.com';

Important: this is a local learning setup. Before public deployment, configure HTTPS, a restricted CORS origin, secure DB credentials, and review the authorization checks for every admin feature.
