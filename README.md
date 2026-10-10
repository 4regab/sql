# Learn SQL by watching it run

Interactive lessons for the PUP *Database Administration* handout, Lessons 4 to 6:

- **Lesson 4:** Basic SQL on single tables (SELECT, arithmetic, NULL, aliases, concatenation, DISTINCT)
- **Lesson 5:** Restricting and sorting data (WHERE, BETWEEN, IN, LIKE, IS NULL, AND/OR/NOT, ORDER BY)
- **Lesson 6:** SQL functions (string, number, date, CAST and CONVERT)

**Live site:** https://4regab.github.io/sql/

## What is on each page

- **Watch it run.** Any query can be played one clause at a time: FROM, WHERE, SELECT, DISTINCT, ORDER BY, result. Rows tick off, columns appear, rows slide into order.
- **Play with it.** Small labs: selection/projection/join, LIKE patterns, AND/OR/NOT and precedence, BETWEEN, IN, string tiles, number line, date parts and boundaries, CONVERT styles.
- **Try it yourself.** A SQL box that runs on a real database in the browser. Handout exercises are checked by running a model answer and comparing results.
- **Quizzes.** A short quiz for each of the 15 sections and a review (exercises plus quiz) for each lesson. Scores are saved in the browser.

## How it works

The site is static HTML, CSS and JavaScript. There is no build step.

| Path | What it does |
|---|---|
| `docs/index.html` | The page shell. GitHub Pages serves the `docs/` folder. |
| `docs/css/style.css` | All styles. Mobile-first, using only Tailwind's standard breakpoints (640, 768, 1024, 1280, 1536). |
| `docs/js/content.js` | The lessons, examples, exercises and quiz questions. |
| `docs/js/db.js` | Reads SQL Server style queries and runs them on SQLite (sql.js). |
| `docs/js/tsql.js` | SQL Server functions: `LEN`, `LEFT`, `DATEADD`, `CAST`, `CONVERT`, and so on. |
| `docs/js/stepper.js` | The step-by-step query picture. |
| `docs/js/labs.js` | The small interactive labs. |
| `docs/js/editor.js`, `quiz.js`, `app.js`, `ui.js` | The SQL box, quizzes, pages and menu, and shared helpers. |
| `docs/data/northwind.sql` | The practice tables (Northwind). |
| `docs/js/vendor/` | sql.js 1.14.2 (MIT licence). |

To run it on your computer, serve the `docs/` folder with any web server, for example `python3 -m http.server --directory docs`. Opening `index.html` as a file will not work, because the browser blocks loading the database file.

## Notes on the practice data

- The tables come from the Northwind sample database, which the handout uses.
- Product 6 (Grandma's Boysenberry Spread) has no price, to match the handout's NULL example.
- Order dates were moved forward ten years (2006 to 2008) so the handout's 2007 examples return rows.
- Text comparison ignores upper and lower case, like SQL Server's default.
- The database is read-only. Only SELECT runs.
