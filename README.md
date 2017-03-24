![CF](https://i.imgur.com/7v5ASc8.png)  Lab 09: SQL Joins and Relations
=======
[Code of Conduct](https://github.com/codefellows/code-of-conduct)

Today we introduced Joins and Relations, which we'll be implementing using SQL.

Your lab TODOs today will require you to write SQL queries and add associated data to those queries in the `server.js` file, though you need to have an understanding at this point as to how everything is working together to accomplish our full functionality.


## Getting started (DO THIS AFTER CLONING YOUR FORK)
1. `cd starter-code` to change dirs to the starter code directory
2. **You will need to drop the table that we created yesterday in Postgres!**
  * To do so, start Postgres in the terminal using the `psql` command
  * Once you're in the Postgres shell, enter `DROP TABLE articles;` to remove the table from your local DB
  * Enter `\dt` in your Postgres shell, and it should return "No relations found"; if it shows that the "articles" table still exists, or does nothing, then you probably forgot the semicolon in the previous step. If so, enter one now, ignore the complaints, and redo the `DROP TABLE articles;`
  * Leave the shell open so you can check on your new tables in the upcoming setup steps!
3. In your Postgres shell:
  * Run `select count(*) from articles;`
    * The output should read that you now have 250 records in the articles table.
  * Then run `select * from authors;`
    * The output should read each of the five author records to your with their respective data

You're ready to go!

## User Stories: MVP
 - As a developer, I want article data to persist with SQL, so that I can store more, faster and have more query flexibility.

This means you'll want to be able to do full CRUD on articles in the database. You'll have to use SQL to make a table for articles (**and clear out the table for troubleshooting**), with a class-level method attached to the constructor function (because it does not apply to any single instance). Then teach each article instance how to write or update itself to the database, or delete itself, via instance methods (available for use as needed in the code).

Crucially, you'll need to trace through the app logic, and all those callback functions to determine WHEN is the right time to load data, or convert JSON.

Look through the TODOs, which signify areas of the code with varying levels of completeness, and focus initially on writing correct SQL. Practice in the web inspector.

<!-- There is no portfolio assignment. -->
