Hello, dear developer.

To run front-end react server:

<..\Kan-do-it> cd frontend
<..\Kan-do-it\frontend> npm install
<..\Kan-do-it\frontend> npm run dev



To run back-end prisma-db:

<..\Kan-do-it\backend> npm install
<..\Kan-do-it\backend> npx prisma generate
#pg server must be on port 5432 (or change port in .env)
<..\Kan-do-it\backend> npx prisma migrate dev
<..\Kan-do-it\backend> npm run dev

# also you can go to
# http://localhost:3000/health
# to check launch


