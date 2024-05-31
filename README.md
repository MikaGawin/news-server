# Northcoders News API

This project hosts the backend for a news API. This includes files for database setup and seeding aswell as the server application. A hosted version of the project can be found [here](https://news-server-2i86.onrender.com/API). The linked API page contains a list of current endpoints and details on how they are used.

Please ensure that you have Node.js v22.0.0 or newer and PSQL v12.18 or newer set up on your machine.

After cloning the project please install all dependencies using the following command:

```
npm i
```

Please create a .env.development file in the project root directory with the form of the env-example with your database name, please look at setup.sql for database names. For development and testing please also create .env.test.

If you do do not have your PGPassword set up globally you will need to type `PGPASSWORD=yourpsqluserpassword` before any of the below commands in your terminal.

To create and seed the database locally please run the following commands:

```
npm run setup-dbs

npm run seed
```
Jest tests can be run using the following command:

```
npm test
```


---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
