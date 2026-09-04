# Store Rating Platform — FullStack Intern Coding Challenge

This project implements the requirements from the supplied coding challenge using:

- Frontend: React + Vite
- Backend: Node.js + Express.js
- Database: MySQL
- Authentication: JWT + bcrypt
- API testing: Postman

## 1. Required software

Install these before running the project:

1. Node.js LTS (includes npm)
2. MySQL Community Server
3. MySQL Workbench
4. Visual Studio Code
5. Git (optional but recommended)
6. Postman (optional, useful for API testing)

## 2. Project structure

```text
fullstack-intern-rating-platform/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── db.js
│   │   ├── server.js
│   │   └── seed.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/assets/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── database/
│   └── schema.sql
└── README.md
```

## 3. Database setup

Open MySQL Workbench and run:

`database/schema.sql`

It creates the database, tables, indexes, and constraints.

Then:

```bash
cd backend
npm install
```

Create `.env` from `.env.example` and update your MySQL password.

Run the seed:

```bash
npm run seed
```

The seed creates demo accounts:

- Admin: admin@example.com / Admin@123
- Store Owner: owner@example.com / Owner@123

The demo owner is attached to a demo store.

## 4. Start backend

```bash
cd backend
npm run dev
```

Backend runs on:

`http://localhost:5000`

Health check:

`http://localhost:5000/api/health`

## 5. Start frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend normally runs on:

`http://localhost:5173`

## 6. Functionalities covered

### System Administrator
- Login
- Dashboard: total users, stores, ratings
- Add stores
- Add normal users
- Add admin users
- Add store owners
- Store list with Name, Email, Address, Rating
- User/admin/store-owner listing
- Search/filter by Name, Email, Address, Role
- View user details
- Store owner details include rating
- Sorting on key table fields
- Logout

### Normal User
- Sign up
- Login
- Change password
- View all stores
- Search by Name and Address
- See overall rating
- See own submitted rating
- Submit rating 1–5
- Modify own rating
- Logout

### Store Owner
- Login
- Change password
- Dashboard
- See average store rating
- See users who rated the store
- See submitted ratings
- Logout

### Validation
- Name: 20–60 characters
- Address: max 400 characters
- Password: 8–16 characters, at least one uppercase and one special character
- Standard email validation
- Rating: integer 1–5
- Duplicate email prevented
- One rating per user/store; later submissions update the existing rating

## 7. Recommended demo flow

1. Login as Admin.
2. Create a store owner.
3. Create a store and assign that owner.
4. Create a normal user.
5. Logout.
6. Login as normal user.
7. Search for the store and submit a rating.
8. Modify the rating.
9. Logout.
10. Login as store owner and verify average rating and rater list.
11. Login as admin and verify dashboard counts and listings.

## 8. Notes

The challenge says the backend may use ExpressJS, Loopback, or NestJS and the database may be PostgreSQL/MySQL. This implementation chooses ExpressJS + MySQL while keeping the requested React frontend.

For a real production deployment, use HTTPS, a secure secret manager, refresh tokens/secure cookies, stronger rate limiting, and environment-specific configuration.
