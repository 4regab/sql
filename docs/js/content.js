/* content.js: the three lessons. Source: PUP "Database Administration" handout, Lessons 4 to 6.
   Text style: **bold** and `code` only. Block types: h, p, list, note, code, table, html, demo, lab, try, tables. */

const T = (a, b) => ['table', a, { rows: b }];

/* ====================================================================== LESSON 4 */
const L4 = {
  id: 'l4', n: 4, title: 'Basic SQL on Single Tables',
  blurb: 'Choose columns, do arithmetic, rename headings, join text and remove duplicates.',
  outcomes: ['Understand the capabilities of SQL SELECT statements', 'Execute a basic SELECT statement', 'Understand the data security, data availability and data quality (the handout lists this outcome, but this unit has no text for it)'],
  sections: [
    {
      id: 's1', title: 'Capabilities of SQL SELECT statements',
      sub: 'To get data out of a database you use the structured query language (SQL) SELECT statement. You can restrict which columns are shown, and you can save a SELECT statement to use again and again.',
      blocks: [
        ['p', 'A **SELECT statement** retrieves information from the database. With it you can do three things: **selection**, **projection** and **join**.'],
        ['lab', 'parts', { title: 'Selection, projection and join' }],
        ['h', 'Selection'],
        ['p', 'Selection chooses the **rows** in a table that a query returns. You can use many kinds of criteria to restrict the rows you see.'],
        ['h', 'Projection'],
        ['p', 'Projection chooses the **columns** in a table. You can choose as few or as many columns as you need.'],
        ['h', 'Join'],
        ['p', 'Join brings together data that is stored in different tables. It creates a link through a column that both tables share. You will learn more about joins in a later lesson.'],
        ['note', 'Picture a table as a grid. Selection picks rows (down the grid). Projection picks columns (across the grid).']
      ],
      quiz: [
        { q: 'Which capability chooses the **rows** a query returns?', o: ['Projection', 'Selection', 'Join', 'Sorting'], a: 1, why: 'Selection restricts the rows. Projection chooses columns.' },
        { q: 'You want only the `LastName` and `City` columns of a table. Which capability is that?', o: ['Selection', 'Join', 'Projection', 'Concatenation'], a: 2, why: 'Choosing columns is projection.' },
        { q: 'A join links two tables through…', o: ['a column both tables share', 'the name of the database', 'the first row of each table', 'an ORDER BY clause'], a: 0, why: 'The shared column is the link between the two tables.' },
        { q: 'Projection removes the rows that do not meet a condition.', o: ['True', 'False'], a: 1, why: 'That is selection. Projection works on columns.' }
      ]
    },
    {
      id: 's2', title: 'The basic SELECT statement',
      sub: 'SELECT retrieves data from the tables in a database. The output is shown as a table.',
      blocks: [
        ['code', 'SELECT [DISTINCT] {*, column [alias], …}\nFROM   tableName', { cap: 'Syntax' }],
        T(['Part', 'Meaning'], [['`SELECT`', 'a list of one or more columns'], ['`DISTINCT`', 'suppresses duplicates'], ['`*`', 'selects all columns'], ['`column`', 'selects the named column'], ['`alias`', 'gives selected columns different headings'], ['`FROM tablename`', 'specifies the table containing the columns']]),
        ['p', 'In its simplest form a SELECT statement must include two things: a **SELECT clause**, which says which columns to show, and a **FROM clause**, which says which table holds those columns.'],
        ['tables'],
        ['h', 'Selecting all columns'],
        ['p', 'Follow the SELECT keyword with an asterisk (`*`) to display every column of a table.'],
        ['demo', 'SELECT * FROM Region', { after: 'The Region table has two columns, RegionID and RegionDescription. It has four rows, one for each region.' }],
        ['p', 'You get the same output if you list every column by name.'],
        ['demo', 'SELECT RegionID, RegionDescription\nFROM   Region'],
        ['h', 'Selecting specific columns'],
        ['p', 'Show only some columns by naming them, separated by commas. List them in the order you want them to appear.'],
        ['demo', 'SELECT EmployeeID, LastName,\n       FirstName, Title\nFROM   Employees', { after: 'This shows the employee IDs, last names, first names and titles from the Employees table.' }],
        ['demo', 'SELECT Title, LastName\nFROM   Employees', { title: 'Same table, different order', after: 'The columns come out in the order you write them, not the order they have in the table.' }],
        ['try', 'SELECT *\nFROM   Region', { title: 'Change the query' }],
        ['h', 'Writing SQL statements'],
        ['p', 'These simple rules make statements easy to read and easy to edit:'],
        ['list', ['SQL statements are not case sensitive, unless indicated.', 'SQL statements can be entered on one or many lines.', 'Keywords cannot be split across lines or abbreviated.', 'Clauses are usually placed on separate lines, to make them easy to read and edit.', 'Tabs and indents can be used to make code easier to read.']],
        ['note', 'A **keyword** is one SQL word, such as `SELECT` or `FROM`. A **clause** is part of a statement, such as `SELECT empno, ename, …`. A **statement** is two or more clauses together, such as `SELECT * FROM emp`.', { label: 'Three words to know' }]
      ],
      quiz: [
        { q: 'What must a SELECT statement include, at the very least?', o: ['A SELECT clause and a FROM clause', 'A WHERE clause and an ORDER BY clause', 'Only the word SELECT', 'An asterisk and an alias'], a: 0, why: 'SELECT says which columns. FROM says which table.' },
        { q: 'SQL keywords such as SELECT must be typed in capital letters.', o: ['True', 'False'], a: 1, why: 'SQL statements are not case sensitive, unless indicated. Capitals are just a habit that helps reading.' },
        { q: 'In the handout, `SELECT * FROM emp` is an example of a…', o: ['keyword', 'clause', 'statement', 'column'], a: 2, why: 'A statement combines two or more clauses.' },
        { q: 'You write `SELECT Title, LastName FROM Employees`. In what order do the columns appear?', o: ['Title, then LastName', 'LastName, then Title', 'The order they have in the table', 'Alphabetical order'], a: 0, why: 'The columns appear in the order you list them in the SELECT clause.' }
      ]
    },
    {
      id: 's3', title: 'Arithmetic expressions and NULL',
      sub: 'You may need to change how data is shown, do calculations, or ask “what if” questions. Arithmetic expressions let you do that.',
      blocks: [
        ['p', 'An **arithmetic expression** can contain column names, constant numbers and arithmetic operators.'],
        T(['Operator', 'Description'], [['`+`', 'Add'], ['`-`', 'Subtract'], ['`*`', 'Multiply'], ['`/`', 'Divide'], ['`%`', 'Modulus division (the remainder)']]),
        ['p', 'You can use arithmetic operators in any clause of a SQL statement except the FROM clause.'],
        ['h', 'Operator precedence'],
        ['list', ['Multiplication and division go before addition and subtraction.', 'Operators of the same priority are worked out from left to right.', 'Parentheses force the part inside them to be worked out first.']],
        ['demo', 'SELECT 2 + 3 * 4 AS NoParentheses,\n       (2 + 3) * 4 AS WithParentheses', { title: 'Precedence', after: 'Without parentheses, 3 * 4 is done first, then 2 is added. Parentheses change that.' }],
        ['h', 'Using arithmetic operators'],
        ['demo', 'SELECT ProductID, ProductName,\n       Unitprice, UnitPrice + 10\nFROM   Products', { pin: [6], after: 'This adds 10 to every price. `UnitPrice + 10` is **not** a new column in the Products table. Because it has no alias, its heading is shown as “(No column name)”.' }],
        ['h', 'Defining a null value'],
        ['p', 'If a row has no value for a column, that value is **null**. A null value is unavailable, unassigned, unknown or not applicable.'],
        ['p', 'A null value is **not** the same as zero or a space. Zero is a number. A space is a character.'],
        ['p', 'A column of any data type can hold null, unless it was created as NOT NULL or as PRIMARY KEY.'],
        ['h', 'Null values in arithmetic expressions'],
        ['p', 'If any value in an arithmetic expression is null, the result is null.'],
        ['demo', 'SELECT ProductID, ProductName,\n       UnitPrice, UnitPrice + 10\nFROM   Products\nWHERE  ProductID IN (4, 5, 6)', { title: 'NULL plus 10 is NULL', after: 'Grandma’s Boysenberry Spread has no price, so adding 10 to it gives NULL, not 10.' }],
        ['note', 'Dividing by zero is an **error**. Dividing a number by NULL is **not** an error. The answer is NULL (unknown).'],
        ['try', 'SELECT 10 / NULL', { title: 'Divide by NULL, then by 0', after: '' }]
      ],
      quiz: [
        { q: 'What does this return?', code: 'SELECT 3 + 4 * 2', o: ['11', '14', '24', '9'], a: 0, why: 'Multiplication goes first: 4 * 2 = 8. Then 3 + 8 = 11.' },
        { q: 'How do you make SQL work out `3 + 4` before the multiplication?', o: ['Put `3 + 4` in parentheses', 'Put it at the end', 'Use the `%` operator', 'Add an alias'], a: 0, why: 'Parentheses force the part inside to be worked out first.' },
        { q: 'A product has a NULL `UnitPrice`. What does `UnitPrice + 10` give for that product?', o: ['NULL', '10', '0', 'An error'], a: 0, why: 'If any value in an arithmetic expression is null, the result is null.' },
        { q: 'You can use arithmetic operators in the FROM clause.', o: ['True', 'False'], a: 1, why: 'Arithmetic operators can be used in any clause except FROM.' },
        { q: 'What is the result of dividing a number by NULL?', o: ['NULL', '0', 'An error', '1'], a: 0, why: 'The answer is NULL (unknown). Only dividing by zero gives an error.' }
      ]
    },
    {
      id: 's4', title: 'Column aliases, concatenation and literals',
      sub: 'Aliases rename a column heading. The + operator joins text. A literal is a fixed value you put in the SELECT list.',
      blocks: [
        ['h', 'Column aliases'],
        ['list', ['An alias renames a column heading.', 'It is useful with calculations.', 'It needs quotation marks if it contains spaces or special characters, or if it is case sensitive.']],
        ['p', 'Put the alias after the column in the SELECT list, with a space between them. The word `AS` between the column name and the alias is optional.'],
        ['demo', 'SELECT ProductName, Unitprice,\n       UnitPrice + 10 AS NewPrice\nFROM   Products', { after: 'The heading is NewPrice. The result is the same with or without `AS`.' }],
        ['demo', "SELECT employeeid AS 'Emp No.',\n       fname = firstname,\n       lastname [Last Name]\nFROM   Employees", { title: 'Three ways to write an alias', after: '`Emp No.` has a space and a period, so it is in single quotes. `fname = firstname` uses an equals sign. `[Last Name]` uses square brackets.' }],
        ['h', 'The concatenation operator'],
        ['p', 'The concatenation operator (`+`) links columns to other columns, arithmetic expressions or constant values. It makes a character expression. The columns on either side of the operator are combined into one output column.'],
        ['demo', 'SELECT LastName + Title AS EmployeeJob\nFROM   Employees', { after: 'LastName and Title are joined and given the alias EmployeeJob. There is no space between them.' }],
        ['h', 'Literal character strings'],
        ['p', 'A **literal** is a character, expression or number included in the SELECT list. Date and character literals must be inside single quotation marks. Each string is output once for every row returned.'],
        ['demo', "SELECT firstName + '  ' + lastName\n       + ' is a ' + Title AS EmpDetail\nFROM   Employees", { after: 'The spaces between the quotation marks make the output easier to read.' }],
        ['try', "SELECT FirstName + ' ' + LastName\n       + ' works in ' + City AS Who\nFROM   Employees", { title: 'Build your own sentence' }]
      ],
      quiz: [
        { q: 'When must an alias be placed in quotes or square brackets?', o: ['When it contains spaces or special characters', 'Always', 'Never', 'Only when it is a number'], a: 0, why: 'A plain one-word alias needs no quotes. `Emp No.` does, because of the space and the period.' },
        { q: 'The word `AS` is required before an alias.', o: ['True', 'False'], a: 1, why: 'AS is optional. The result is the same with or without it.' },
        { q: 'Which operator joins text values in the SELECT list (in SQL Server)?', o: ['+', '&', '.', '#'], a: 0, why: 'The concatenation operator is `+`.' },
        { q: 'Why is the space in `FirstName + \' \' + LastName` inside single quotes?', o: ['A character string (literal) must be in single quotes', 'To make it an alias', 'To make it NULL', 'It is optional'], a: 0, why: 'Character and date literals go inside single quotation marks.' },
        { q: 'In `fname = firstname`, what is `fname`?', o: ['An alias for firstname', 'A table', 'A condition', 'A function'], a: 0, why: 'The equals sign form gives the column the heading on the left.' }
      ]
    },
    {
      id: 's5', title: 'Duplicate rows',
      sub: 'A query shows every row by default, including rows that repeat. DISTINCT removes the repeats.',
      blocks: [
        ['p', 'Unless you say otherwise, a query shows **all rows**, including duplicates.'],
        ['demo', 'SELECT Title\nFROM   Employees', { after: 'Nine rows come back. “Sales Representative” appears six times.' }],
        ['h', 'Eliminating duplicate rows'],
        ['p', 'To remove duplicate rows, put the `DISTINCT` keyword in the SELECT clause, right after `SELECT`.'],
        ['demo', 'SELECT DISTINCT Title\nFROM   Employees', { after: 'The Employees table has 9 rows, but only four different titles.' }],
        ['h', 'Understanding DISTINCT'],
        ['list', ['Only unique rows can appear in the result.', 'It removes duplicates based on the **selected columns**, not on the source table.', 'It gives uniqueness across the whole set of selected columns.']],
        ['demo', 'SELECT DISTINCT Title, City\nFROM   Employees', { title: 'More than one column', after: 'DISTINCT looks at the pair. “Sales Representative in London” appears three times in the table, so it is kept once. “Sales Representative in Seattle” is a different pair.' }],
        ['try', 'SELECT DISTINCT Country\nFROM   Employees', { title: 'Try DISTINCT' }]
      ],
      quiz: [
        { q: 'By default, does a query remove duplicate rows?', o: ['Yes', 'No, it shows all rows including duplicates'], a: 1, why: 'You must ask for DISTINCT.' },
        { q: 'How many rows does this return?', code: 'SELECT DISTINCT Title\nFROM   Employees', o: ['4', '9', '1', '6'], a: 0, why: 'The 9 employees have only four different titles.' },
        { q: 'Where does the DISTINCT keyword go?', o: ['Right after SELECT', 'Right after FROM', 'At the end of the query', 'Before SELECT'], a: 0, why: 'DISTINCT comes immediately after the SELECT keyword.' },
        { q: 'With `SELECT DISTINCT Title, City`, DISTINCT checks…', o: ['the combination of Title and City', 'Title only', 'City only', 'every column in the table'], a: 0, why: 'It works on the selected columns together.' }
      ]
    }
  ],
  review: {
    intro: 'Practise Lesson 4. These are the handout’s guide questions. Write the query, run it, then press Check answer.',
    note: 'Tap **Tables** under an exercise to see every table and its columns.',
    tasks: [
      { q: 'Fix this statement. It should show ProductID, ProductName and the price increased by 10% (UnitPrice × 1.10), with the heading INCREASE PRICE. (Guide question 3.)', start: 'SELECT ProductID, ProductName\n       UnitPrice x 1.10 INCREASE PRICE\nFROM   Products', a: "SELECT ProductID, ProductName, UnitPrice * 1.10 AS 'INCREASE PRICE' FROM Products", headers: true, why: 'Three fixes: add the missing comma after ProductName, use `*` (not `x`) to multiply, and put an alias that has a space in quotes or square brackets.' },
      { q: 'Show all data from the SUPPLIERS table. (Guide question 4.)', a: 'SELECT * FROM Suppliers' },
      { q: 'Show the employee ID, name, job and hire date of every employee, in that order. Use LastName for the name. (Guide question 5.)', a: 'SELECT EmployeeID, LastName, Title, HireDate FROM Employees' },
      { q: 'Show the unique countries in the EMPLOYEES table. (Guide question 6.)', a: 'SELECT DISTINCT Country FROM Employees' },
      { q: 'Show the employee ID, last name, title and hire date with the headings Emp #, Employee, Job and Hire Date. (Guide question 7.)', a: "SELECT EmployeeID AS 'Emp #', LastName AS Employee, Title AS Job, HireDate AS 'Hire Date' FROM Employees", headers: true },
      { q: 'Show the last name joined to the job, separated by a comma and a space, in one column named Employee and Title. (Guide question 8.)', a: "SELECT LastName + ', ' + Title AS 'Employee and Title' FROM Employees", headers: true },
      { q: 'Show all the data from the CATEGORIES table in ONE column named THE OUTPUT, with the three columns separated by a comma and no spaces. (Guide question 9.) Hint: CategoryID is a number and `+` will not join a number to text. Lesson 6 shows CAST, which fixes this. You can come back to this one later.', a: "SELECT CAST(CategoryID AS varchar(10)) + ',' + CategoryName + ',' + Description AS 'THE OUTPUT' FROM Categories", headers: true }
    ],
    quiz: [
      { q: 'Will this statement execute successfully? (Guide question 1.)', code: 'SELECT ProductID, ProductName, UnitPrice Cost\nFROM Products', o: ['True', 'False'], a: 0, why: 'It works. `Cost` is an alias written without the optional AS.' },
      { q: 'Will this statement execute successfully? (Guide question 2.)', code: 'SELECT * FROM ProductSupplier', o: ['True', 'False'], a: 1, why: 'There is no table called ProductSupplier in this database. Run it in a Try box to see the error. The tables are Products and Suppliers.' },
      { q: 'Which keyword removes duplicate rows?', o: ['UNIQUE', 'DISTINCT', 'ONLY', 'REMOVE'], a: 1, why: 'DISTINCT goes right after SELECT.' },
      { q: 'What does this show for one employee?', code: "SELECT LastName + ' - ' + Title\nFROM   Employees", o: ['One column with the two values joined by a dash', 'Two columns', 'An error', 'Only the title'], a: 0, why: '`+` joins the text values into one output column.' },
      { q: 'One product has a NULL `UnitPrice`. What is `UnitPrice * 2` for it?', o: ['NULL', '0', '2', 'An error'], a: 0, why: 'Any arithmetic with NULL gives NULL.' },
      { q: 'Which alias needs quotes or square brackets?', o: ['Hire Date', 'HireDate', 'Cost', 'NewPrice'], a: 0, why: 'It contains a space.' }
    ]
  }
};

/* ====================================================================== LESSON 5 */
const L5 = {
  id: 'l5', n: 5, title: 'Restricting and Sorting Data',
  blurb: 'Keep only the rows you want with WHERE, and put them in order with ORDER BY.',
  outcomes: ['Limit the rows retrieved by a query', 'Sort the rows retrieved by a query'],
  sections: [
    {
      id: 's6', title: 'Limiting rows with WHERE',
      sub: 'When you retrieve data you may need to restrict the rows that are shown, or choose the order they appear in. This lesson shows the SQL for both.',
      blocks: [
        ['p', 'You can restrict query results to the subset of rows that interest you. Use the **WHERE** clause. It holds a condition that must be met, and it comes directly after the FROM clause.'],
        ['code', 'SELECT [DISTINCT] {*, column [alias], …}\nFROM   tableName\n[WHERE condition(s)]', { cap: 'Syntax' }],
        T(['Part', 'Meaning'], [['`WHERE`', 'restricts the query to rows that meet a condition'], ['`condition`', 'is made of column names, expressions, constants and a comparison operator']]),
        ['p', 'The WHERE clause can compare values in columns, literal values, arithmetic expressions or functions. It has three elements:'],
        ['list', ['a column name', 'a comparison operator', 'a column name, a constant or a list of values']],
        ['demo', "SELECT EmployeeID, LastName, Title\nFROM   Employees\nWHERE  Title = 'Sales Representative'", { title: 'Using the WHERE clause', after: 'Only the six employees whose job title is Sales Representative stay.' }],
        ['h', 'Character strings and dates'],
        ['p', 'Character strings and dates in the WHERE clause must be inside single quotation marks. Number constants must **not** be.'],
        ['demo', "SELECT EmployeeID, LastName,\n       FirstName, Title\nFROM   Employees\nWHERE  LastName = 'King'"],
        ['h', 'Comparison operators'],
        T(['Operator', 'Meaning'], [['`=`', 'Equal to'], ['`>`', 'Greater than'], ['`>=`', 'Greater than or equal to'], ['`<`', 'Less than'], ['`<=`', 'Less than or equal to'], ['`<>`, `!=`', 'Not equal to']]),
        ['p', 'Comparison operators compare one expression with another. The format is `… WHERE expr operator value`.'],
        ['demo', "SELECT CompanyName, Country\nFROM   Customers\nWHERE  Country = 'Spain'", { title: 'Customers from Spain', after: 'The picture shows a small sample of the 91 customers. The counts use all of them.' }],
        ['note', 'The order dates in this practice database were moved forward ten years (they now run from 2006 to 2008). That way the handout’s 2007 examples return rows. Dates are written month-day-year, as in the handout.'],
        ['demo', "SELECT OrderID, Orderdate\nFROM   Orders\nWHERE  Orderdate < '07-01-2007'", { title: 'Orders before July 1, 2007' }],
        ['demo', "SELECT OrderID, Orderdate\nFROM   Orders\nWHERE  Orderdate >= '07-01-2007'\n   AND Orderdate < '01-01-2008'", { title: 'Orders from July 1 up to December 31, 2007' }],
        ['demo', 'SELECT ProductName, UnitPrice\nFROM   Products\nWHERE  UnitPrice > 15', { pin: [6], title: 'Products that cost more than 15', after: 'Look at the product with no price. NULL > 15 is not TRUE, so that row is dropped too.' }],
        ['h', 'Filtering with predicates'],
        ['list', ['WHERE clauses use predicates such as IN, LIKE and BETWEEN.', 'A predicate must be written as a logical condition.', 'Only rows where the predicate is TRUE are accepted. FALSE and UNKNOWN rows are filtered out.', 'WHERE follows FROM and comes before the other clauses.', 'WHERE cannot see aliases declared in the SELECT clause.', 'Data is filtered on the server, which can reduce network traffic and client memory use.']],
        ['try', 'SELECT UnitPrice * 2 AS Dbl\nFROM   Products\nWHERE  Dbl > 10', { title: 'WHERE cannot see an alias', after: '' }]
      ],
      quiz: [
        { q: 'Which clause restricts the rows a query returns?', o: ['WHERE', 'ORDER BY', 'DISTINCT', 'FROM'], a: 0, why: 'WHERE holds a condition. Only rows that meet it stay.' },
        { q: 'Which condition is written correctly?', o: ["WHERE LastName = 'King'", 'WHERE LastName = King', "WHERE 'LastName' = King", "WHERE = 'King'"], a: 0, why: 'Character strings go in single quotation marks.' },
        { q: 'What does `<>` mean?', o: ['Not equal to', 'Greater than', 'Less than or equal to', 'Equal to'], a: 0, why: '`<>` and `!=` both mean not equal to.' },
        { q: 'A row where the WHERE condition is UNKNOWN (for example it involves NULL) is…', o: ['filtered out', 'kept', 'shown with NULL', 'shown last'], a: 0, why: 'Only rows where the condition is TRUE are accepted.' },
        { q: 'A WHERE clause can use an alias created in the SELECT clause.', o: ['True', 'False'], a: 1, why: 'WHERE runs before SELECT, so it cannot see aliases. ORDER BY runs after, so it can.' }
      ]
    },
    {
      id: 's7', title: 'BETWEEN, IN, LIKE and IS NULL',
      sub: 'Four more ways to write a condition.',
      blocks: [
        T(['Operator', 'Meaning'], [['`BETWEEN … AND …`', 'between two values (inclusive)'], ['`IN (list)`', 'matches any value in a list'], ['`LIKE`', 'matches a character pattern'], ['`IS NULL`', 'is a null value']]),
        ['h', 'BETWEEN'],
        ['p', 'Use BETWEEN to show rows in a range. You give a lower limit and an upper limit. The values are **inclusive**, and you must write the lower limit first.'],
        ['lab', 'between', { title: 'Slide the range' }],
        ['demo', 'SELECT ProductName, UnitPrice\nFROM   Products\nWHERE  UnitPrice BETWEEN 50 AND 100', { title: 'Products priced from 50 to 100' }],
        ['demo', "SELECT LastName, HireDate\nFROM   Employees\nWHERE  HireDate BETWEEN '01-01-1994'\n                    AND '12-31-1994'", { title: 'Employees hired in 1994' }],
        ['h', 'IN'],
        ['p', 'Use IN to test for values in a list. It works with any data type.'],
        ['lab', 'inlist', { title: 'Build the list' }],
        ['demo', "SELECT LastName, FirstName, City\nFROM   Employees\nWHERE  City IN ('Tacoma', 'Kirkland', 'Redmond')"],
        ['h', 'LIKE'],
        ['p', 'You may not know the exact value. Use LIKE to match a character pattern. This is called a **wildcard search**. Two symbols build the pattern:'],
        ['list', ['`%` stands for zero or many characters.', '`_` stands for exactly one character.']],
        ['lab', 'like', { title: 'Type a pattern' }],
        T(['Pattern', 'Meaning', 'Matches'], [["`'D%'`", 'begins with D', 'Davolio, Dodsworth'], ["`'%g'`", 'ends with g', 'King, Leverling'], ["`'%ha%'`", 'contains “ha”', 'Buchanan, Callahan'], ["`'_E%'`", 'second letter is E', 'Peacock, Leverling']]),
        ['p', 'You can combine `%` and `_` with literal characters in any way.'],
        ['demo', "SELECT LastName\nFROM   Employees\nWHERE  LastName LIKE '_E%'", { title: 'Second letter is E', after: 'LIKE ignores upper and lower case here, so the E matches the e in Peacock and Leverling.' }],
        ['h', 'IS NULL'],
        ['p', 'IS NULL tests for null values. A null value is unavailable, unassigned, unknown or not applicable. You **cannot** test it with `=`, because a null value is not equal to anything, and not unequal to anything.'],
        ['demo', 'SELECT LastName, ReportsTo\nFROM   Employees\nWHERE  ReportsTo IS NULL', { after: 'Only Andrew Fuller, the vice president, has no manager.' }],
        ['try', 'SELECT LastName, ReportsTo\nFROM   Employees\nWHERE  ReportsTo = NULL', { title: 'Why = NULL finds nothing', after: '' }]
      ],
      quiz: [
        { q: 'Does `BETWEEN 50 AND 100` include a price of exactly 100?', o: ['Yes, both ends are included', 'No, only 51 to 99'], a: 0, why: 'BETWEEN is inclusive.' },
        { q: 'Which pattern finds last names that begin with D?', o: ["'D%'", "'%D'", "'_D'", "'D_'"], a: 0, why: '`D%` means D followed by zero or many characters.' },
        { q: 'Which last name matches this condition?', code: "WHERE LastName LIKE '_E%'", o: ['Peacock', 'Davolio', 'King', 'Fuller'], a: 0, why: 'The second letter must be E. Peacock has “e” as its second letter.' },
        { q: 'How do you find rows where `ReportsTo` has no value?', o: ['ReportsTo IS NULL', 'ReportsTo = NULL', 'ReportsTo = 0', "ReportsTo = ''"], a: 0, why: 'NULL is not equal to anything, so `= NULL` never matches.' },
        { q: 'Which operator is a short way to write several OR tests on one column?', o: ['IN', 'LIKE', 'BETWEEN', 'IS'], a: 0, why: '`City IN (\'A\', \'B\')` means City = \'A\' OR City = \'B\'.' }
      ]
    },
    {
      id: 's8', title: 'Logical operators and precedence',
      sub: 'A logical operator combines two conditions into one result, or flips the result of one condition.',
      blocks: [
        T(['Operator', 'Meaning'], [['`AND`', 'returns TRUE if both conditions are TRUE'], ['`OR`', 'returns TRUE if either condition is TRUE'], ['`NOT`', 'returns TRUE if the following condition is FALSE']]),
        ['lab', 'logic', { title: 'Switch the condition' }],
        ['h', 'AND'],
        ['p', 'AND needs **both** conditions to be TRUE.'],
        ['demo', "SELECT LastName, Title, City\nFROM   Employees\nWHERE  Title = 'Sales Representative'\n  AND  City = 'London'", { after: 'An employee who is a Sales Representative and lives in London is selected.' }],
        ['h', 'OR'],
        ['p', 'OR needs **either** condition to be TRUE.'],
        ['demo', "SELECT LastName, Title, City\nFROM   Employees\nWHERE  Title = 'Sales Representative'\n   OR  City = 'London'", { after: 'An employee who is a Sales Representative, or who lives in London, is selected. That is why more rows pass than with AND.' }],
        ['h', 'NOT'],
        ['p', 'NOT shows a row if the condition is **not** TRUE.'],
        ['demo', "SELECT LastName, Title\nFROM   Employees\nWHERE  NOT Title = 'Sales Representative'"],
        ['p', 'NOT also works with other operators:'],
        ['code', "WHERE City NOT IN ('Seattle', 'Redmond', 'London')\nWHERE UnitPrice NOT BETWEEN 10 AND 50\nWHERE Title NOT LIKE '%Sales%'\nWHERE ReportsTo IS NOT NULL"],
        ['h', 'Rules of precedence'],
        T(['Order evaluated', 'Operator'], [['1', 'All comparison operators'], ['2', '`NOT`'], ['3', '`AND`'], ['4', '`OR`']]),
        ['p', 'Override the rules of precedence by using parentheses.'],
        ['demo', "SELECT LastName, Title, City\nFROM   Employees\nWHERE  Title = 'Sales Representative'\n    OR Title = 'Sales Manager'\n   AND City = 'London'", { title: 'Without parentheses', after: 'There are two conditions. One: the job is Sales Manager **and** the city is London. Two: the job is Sales Representative. SQL selects a row if the employee is a Sales Manager in London **or** is a Sales Representative.' }],
        ['demo', "SELECT LastName, Title, City\nFROM   Employees\nWHERE (Title = 'Sales Representative'\n    OR Title = 'Sales Manager')\n   AND City = 'London'", { title: 'With parentheses', after: 'Now the job must be Sales Manager or Sales Representative, **and** the city must be London.' }],
        ['note', 'The handout’s printed results for these two examples leave out Steven Buchanan. He is a Sales Manager in London, so he meets the condition, and the real database returns him. That is why you see 7 rows above (the handout prints 6) and 4 rows here (the handout prints 3).', { label: 'A difference from the handout' }],
        ['try', "SELECT LastName, Title, City\nFROM   Employees\nWHERE  Title = 'Sales Representative'\n    OR Title = 'Sales Manager'\n   AND City = 'London'", { title: 'Add parentheses and run again' }]
      ],
      quiz: [
        { q: 'Which operator needs BOTH conditions to be TRUE?', o: ['AND', 'OR', 'NOT', 'IN'], a: 0, why: 'AND returns TRUE only if both conditions are TRUE.' },
        { q: 'Which is worked out first, AND or OR?', o: ['AND', 'OR', 'Whichever is on the left', 'They are equal'], a: 0, why: 'The order is: comparisons, NOT, AND, then OR.' },
        { q: 'How does SQL read this?', code: "WHERE Title = 'Sales Representative'\n   OR Title = 'Sales Manager'\n  AND City = 'London'", o: ["Representative OR (Manager AND London)", "(Representative OR Manager) AND London", 'Left to right, one test at a time', 'It is an error'], a: 0, why: 'AND goes first, so it is Representative, OR (Manager AND London).' },
        { q: 'How do you force the OR to run before the AND?', o: ['Put the OR test in parentheses', 'Write it first', 'Use NOT', 'Use DISTINCT'], a: 0, why: 'Parentheses override the rules of precedence.' },
        { q: 'Which is a valid way to write the opposite of IN?', o: ["City NOT IN ('London')", "City IN NOT ('London')", "NOT City ('London')", "City != IN ('London')"], a: 0, why: 'NOT goes before IN, BETWEEN or LIKE.' }
      ]
    },
    {
      id: 's9', title: 'Sorting with ORDER BY',
      sub: 'The order of rows in a query result is undefined. ORDER BY sorts them.',
      blocks: [
        ['p', 'If you use ORDER BY, it must be the **last** clause. You can sort by a column, an expression or an alias.'],
        ['code', 'SELECT [DISTINCT] {*, column [alias], …}\nFROM   tableName\n[WHERE condition(s)]\n[ORDER BY {column, expr} [ASC|DESC]]', { cap: 'Syntax' }],
        T(['Part', 'Meaning'], [['`ORDER BY`', 'sets the order in which the rows are shown'], ['`ASC`', 'ascending order (this is the default)'], ['`DESC`', 'descending order']]),
        ['list', ['ORDER BY sorts the rows for presentation.', 'Without ORDER BY there is no guaranteed order of rows.', 'With ORDER BY the sort order is guaranteed.', 'It is the last clause to be processed.', 'It sorts all NULLs together.']],
        ['h', 'Default order'],
        ['list', ['Numbers: lowest first (1 to 999).', 'Dates: earliest first.', 'Characters: alphabetical order, A first and Z last.']],
        ['demo', 'SELECT LastName, FirstName, HireDate\nFROM   Employees\nORDER BY HireDate', { after: 'The earliest hired employee comes first.' }],
        ['h', 'Descending order'],
        ['p', 'To reverse the order, put `DESC` after the column name.'],
        ['demo', 'SELECT LastName, FirstName, HireDate\nFROM   Employees\nORDER BY HireDate DESC', { after: 'The most recently hired employee comes first.' }],
        ['h', 'Sorting by a column alias'],
        ['demo', 'SELECT LastName, FirstName, Title AS Job\nFROM   Employees\nORDER BY Job', { after: 'ORDER BY can use the alias Job because it runs **after** SELECT. WHERE cannot, because it runs before.' }],
        ['h', 'Sorting by more than one column'],
        ['p', 'Separate the columns with commas. Put `DESC` after any column you want reversed.'],
        ['demo', 'SELECT LastName, FirstName, Title\nFROM   Employees\nORDER BY FirstName, Title DESC'],
        ['demo', 'SELECT LastName, Title, City\nFROM   Employees\nORDER BY Title, LastName DESC', { title: 'A sort where the second column matters', after: 'Rows with the same Title are sorted by LastName from Z to A.' }],
        ['note', 'You can sort by a column that is not in the SELECT list. Try `SELECT LastName FROM Employees ORDER BY HireDate`.'],
        ['note', 'The handout says null values come last in ascending order. That is how Oracle works. SQL Server, which this course uses, treats NULL as the lowest value, so NULLs come **first** in ascending order. Run the query below to see it.', { label: 'About NULL' }],
        ['try', 'SELECT LastName, ReportsTo\nFROM   Employees\nORDER BY ReportsTo', { title: 'Where does NULL go?' }]
      ],
      quiz: [
        { q: 'Where does ORDER BY go in a SELECT statement?', o: ['Last', 'First', 'Right after SELECT', 'Before WHERE'], a: 0, why: 'ORDER BY must be the last clause.' },
        { q: 'What is the default sort order?', o: ['Ascending', 'Descending', 'Random', 'By table order'], a: 0, why: 'ASC is the default. Add DESC to reverse it.' },
        { q: 'Without ORDER BY, SQL promises the rows come back in a fixed order.', o: ['True', 'False'], a: 1, why: 'There is no guaranteed order without ORDER BY.' },
        { q: 'Can ORDER BY use a column alias?', o: ['Yes, because ORDER BY runs after SELECT', 'No, never', 'Only with DESC', 'Only for numbers'], a: 0, why: 'It is the last clause processed, so the alias already exists.' },
        { q: 'What does this do?', code: 'ORDER BY FirstName, Title DESC', o: ['Sorts by FirstName A to Z, then ties by Title Z to A', 'Sorts by Title only', 'Sorts both columns Z to A', 'It is an error'], a: 0, why: 'DESC applies only to the column it follows.' }
      ]
    }
  ],
  review: {
    intro: 'Practise Lesson 5. These are the handout’s guide questions. Write the query, run it, then press Check answer.',
    note: 'Where a question says “name”, use `ProductName` for products and `LastName` for employees.',
    tasks: [
      { q: 'Show the ID, name and unit price of products that cost more than 120. (Guide question 1.)', a: 'SELECT ProductID, ProductName, UnitPrice FROM Products WHERE UnitPrice > 120' },
      { q: 'Show the employee ID, name and title for employee ID 8. (Guide question 2.)', a: 'SELECT EmployeeID, LastName, Title FROM Employees WHERE EmployeeID = 8' },
      { q: 'Show the ID, name and unit price of products that are **not** in the range 150 to 200. (Guide question 3.)', a: 'SELECT ProductID, ProductName, UnitPrice FROM Products WHERE UnitPrice NOT BETWEEN 150 AND 200', why: 'The product with no price is left out, because NULL NOT BETWEEN … is unknown, not TRUE.' },
      { q: 'Show the employee ID, name, title and hire date of employees hired between January 20, 1994 and May 1, 1994. Sort by hire date, earliest first. (Guide question 4.)', a: "SELECT EmployeeID, LastName, Title, HireDate FROM Employees WHERE HireDate BETWEEN '01-20-1994' AND '05-01-1994' ORDER BY HireDate", ordered: true },
      { q: 'Show the ID, name and category ID of all products in category 2 and 6, in alphabetical order by name. (Guide question 5.)', a: 'SELECT ProductID, ProductName, CategoryID FROM Products WHERE CategoryID IN (2, 6) ORDER BY ProductName', ordered: true },
      { q: 'Show the name and unit price of products that cost more than 150 and are in category 4 or 8. Name the columns Product and Unit Cost. (Guide question 6.)', a: "SELECT ProductName AS Product, UnitPrice AS 'Unit Cost' FROM Products WHERE UnitPrice > 150 AND CategoryID IN (4, 8)", headers: true, why: 'No product matches, so the correct answer is an empty result. Only one product costs more than 150, and it is in category 1.' },
      { q: 'Show the name and job title of all employees who do not have a manager. (Guide question 7.)', a: 'SELECT LastName, Title FROM Employees WHERE ReportsTo IS NULL' },
      { q: 'Show the first names of all employees where the third letter of the name is an N. (Guide question 8.)', a: "SELECT FirstName FROM Employees WHERE FirstName LIKE '__n%'" },
      { q: 'Show the last names of all employees who have two Ls in their last name AND are in the country USA or have manager 2. (Guide question 9.) Watch the parentheses.', a: "SELECT LastName FROM Employees WHERE LastName LIKE '%l%l%' AND (Country = 'USA' OR ReportsTo = 2)" },
      { q: 'Show the name, category ID and unit price of all products whose category ID is 1 or 3 and whose unit price is not equal to 50, 100 or 150. (Guide question 10.)', a: 'SELECT ProductName, CategoryID, UnitPrice FROM Products WHERE CategoryID IN (1, 3) AND UnitPrice NOT IN (50, 100, 150)' }
    ],
    quiz: [
      { q: 'Which rows does this keep?', code: "WHERE Title NOT LIKE '%Sales%'", o: ['Rows whose Title does not contain “Sales”', 'Rows whose Title is exactly “Sales”', 'Rows with no Title', 'All rows'], a: 0, why: 'NOT flips the LIKE test.' },
      { q: 'Which condition keeps products priced from 10 to 20, both included?', o: ['UnitPrice BETWEEN 10 AND 20', 'UnitPrice IN (10, 20)', 'UnitPrice > 10 AND UnitPrice < 20', 'UnitPrice LIKE 10-20'], a: 0, why: 'BETWEEN includes both ends. `>` and `<` leave them out.' },
      { q: 'Which clause lists employees from newest hire to oldest?', o: ['ORDER BY HireDate DESC', 'ORDER BY HireDate', 'ORDER BY DESC HireDate', 'WHERE HireDate DESC'], a: 0, why: 'DESC goes after the column name.' },
      { q: 'Why does `WHERE ReportsTo = NULL` return no rows?', o: ['NULL is never equal to anything, not even NULL', 'ReportsTo has no NULLs', 'It needs double quotes', 'ORDER BY is missing'], a: 0, why: 'Use IS NULL.' },
      { q: "`WHERE City = 'London' AND City = 'Seattle'` can return rows.", o: ['True', 'False'], a: 1, why: 'One value cannot be both London and Seattle.' },
      { q: 'In what order does SQL evaluate these, first to last?', o: ['Comparisons, NOT, AND, OR', 'OR, AND, NOT, comparisons', 'AND, OR, NOT, comparisons', 'NOT, comparisons, OR, AND'], a: 0, why: 'This is the rule of precedence. Parentheses override it.' }
    ]
  }
};

/* ====================================================================== LESSON 6 */
const L6 = {
  id: 'l6', n: 6, title: 'SQL Functions',
  blurb: 'Change text, numbers and dates with single-row functions, and convert between data types.',
  outcomes: ['Describe various types of functions available in SQL', 'Use character, number, and date functions in SELECT statements', 'Describe the use of conversion functions'],
  sections: [
    {
      id: 's10', title: 'What is a function?',
      sub: 'Functions make the basic query block more powerful. They are used to change data values.',
      blocks: [
        ['p', 'A **function** is a programming unit that returns a single value. You pass values in as parameters, and the parameters can change the result. A function is self-contained, so it can sit inside an expression.'],
        ['html', '<div class="flow"><div class="fb1"><b>Input</b><span>arg 1, arg 2 … arg n</span></div><span class="ar" aria-hidden="true"><i class="ic ic-right"></i></span><div class="fb1 mid"><b>Function</b><span>performs the action</span></div><span class="ar" aria-hidden="true"><i class="ic ic-right"></i></span><div class="fb1"><b>Output</b><span>one result value</span></div></div>'],
        ['p', 'SQL functions may accept arguments, and they always return a value.'],
        ['h', 'What functions can do'],
        ['list', ['Perform calculations on data.', 'Modify individual data items.', 'Manipulate output for groups of rows.', 'Format dates and numbers for display.', 'Convert column data types.']],
        ['h', 'Types of functions'],
        ['p', '**Single-row functions** do an operation on each row of a query. The same operation runs for every row the query retrieves. They come in four kinds: String, Number, Date and Conversion.'],
        ['p', '**Multiple-row functions** work on groups of rows and give one result per group.'],
        ['demo', 'SELECT LastName, LEN(LastName) AS Letters\nFROM   Employees', { title: 'A single-row function runs once per row', after: 'LEN is called nine times, once for each row. Each call returns one value.' }]
      ],
      quiz: [
        { q: 'What does a SQL function always do?', o: ['Returns a value', 'Deletes a row', 'Creates a table', 'Sorts the rows'], a: 0, why: 'Functions may accept arguments and always return a value.' },
        { q: 'A single-row function returns…', o: ['one result per row', 'one result per table', 'one result per group', 'no result'], a: 0, why: 'It runs the same operation for every row.' },
        { q: 'Which is NOT one of the four kinds of single-row function?', o: ['Network', 'String', 'Number', 'Date'], a: 0, why: 'The four kinds are String, Number, Date and Conversion.' },
        { q: 'Functions that give one result per group of rows are called…', o: ['multiple-row functions', 'single-row functions', 'aliases', 'literals'], a: 0, why: 'Multiple-row functions work on groups.' }
      ]
    },
    {
      id: 's11', title: 'Single-row functions',
      sub: 'Single-row functions change data items. They take one or more arguments and return one value for each row.',
      blocks: [
        ['p', 'An **argument** can be a user-supplied constant, a variable value, a column name or an expression.'],
        ['h', 'Features of single-row functions'],
        ['list', ['They act on each row returned by the query.', 'They return one result per row.', 'They may return a value of a different type from the one they were given.', 'They may expect one or more arguments.', 'They can be used in SELECT, WHERE and ORDER BY, and can be nested.']],
        ['code', 'function_name (column|expression, [arg1, arg2, ...])', { cap: 'Syntax' }],
        T(['Part', 'Meaning'], [['`function_name`', 'the name of the function'], ['`column`', 'any named database column'], ['`expression`', 'any character string or calculated expression'], ['`arg1, arg2`', 'any argument the function uses']]),
        ['h', 'The four groups'],
        T(['Group', 'What it does'], [['**String**', 'accepts character input and can return character and number values'], ['**Number**', 'accepts numbers and returns numbers'], ['**Date**', 'works on date values'], ['**Conversion**', 'converts a value from one data type to another']]),
        ['h', 'Case conversion functions'],
        T(['Function', 'Description', 'Syntax'], [['`LOWER`', 'converts a string to lower case', '`LOWER(char_expr)`'], ['`UPPER`', 'converts a string to upper case', '`UPPER(char_expr)`']]),
        ['demo', 'SELECT UPPER (LastName) LName,\n       LOWER (FirstName) FName\nFROM   Employees'],
        ['lab', 'string', { fn: 'UPPER', fns: ['UPPER', 'LOWER'], title: 'Change the case' }],
        ['demo', 'SELECT LastName, UPPER(LEFT(LastName, 3)) AS Code\nFROM   Employees\nWHERE  LEN(LastName) > 6', { title: 'Functions in WHERE, and one inside another', after: 'LEN is used in WHERE to keep long names. LEFT is placed **inside** UPPER. That is called nesting.' }]
      ],
      quiz: [
        { q: 'An argument of a function can be…', o: ['a constant, a column name or an expression', 'only a column name', 'only a number', 'only text'], a: 0, why: 'It can be a constant, a variable, a column name or an expression.' },
        { q: 'Which statement about single-row functions is true?', o: ['They can be used in SELECT, WHERE and ORDER BY', 'They can only be used in SELECT', 'They cannot be nested', 'They return one value for the whole table'], a: 0, why: 'They can also be nested.' },
        { q: 'What does `UPPER(\'Fuller\')` return?', o: ['FULLER', 'fuller', 'Fuller', 'F'], a: 0, why: 'UPPER changes every letter to capitals.' },
        { q: 'A function placed inside another function is…', o: ['nested', 'joined', 'aliased', 'sorted'], a: 0, why: 'For example `UPPER(LEFT(LastName, 3))`.' }
      ]
    },
    {
      id: 's12', title: 'Character manipulation functions',
      sub: 'String functions work on an input string and return a string or a number.',
      blocks: [
        ['lab', 'string', { fn: 'LEFT', title: 'Try every string function' }],
        ['h', 'LEN'],
        ['p', 'Returns the number of characters in the string.'],
        ['code', 'LEN(char_expr)'],
        ['demo', 'SELECT DISTINCT Title,\n       LEN (Title) Length\nFROM   Employees'],
        ['h', 'LEFT and RIGHT'],
        ['p', 'LEFT returns the part of a string starting a set number of characters from the left. RIGHT does the same from the right.'],
        ['code', 'LEFT(char_expr, integer_expr)\nRIGHT(char_expr, integer_expr)'],
        ['demo', 'SELECT DISTINCT Title,\n       LEFT (Title,4)\nFROM   Employees'],
        ['demo', 'SELECT DISTINCT Title,\n       RIGHT (Title,4)\nFROM   Employees'],
        ['h', 'LTRIM and RTRIM'],
        ['p', 'LTRIM removes blanks at the start of a string. RTRIM removes blanks at the end.'],
        ['code', 'LTRIM(char_expr)\nRTRIM(char_expr)'],
        ['demo', "SELECT LTRIM ('     abcde')", { after: 'The blanks at the front are gone. In the lab above, choose LTRIM to see each space marked with a dot.' }],
        ['demo', "SELECT RTRIM ('abcde   ')"],
        ['h', 'REPLACE'],
        ['p', 'Replaces **all** occurrences of the second string in the first string with a third string.'],
        ['code', "REPLACE('str_expr1', 'str_expr2', 'str_expr3')"],
        T(['Part', 'Meaning'], [['`str_expr1`', 'the string to be searched'], ['`str_expr2`', 'the string to find'], ['`str_expr3`', 'the replacement string']]),
        ['demo', "SELECT REPLACE ('abcdefghicde', 'cde', 'xxx')", { after: 'The handout’s example is missing its arguments. This is the complete version, and it gives the result the handout prints.' }],
        ['h', 'REPLICATE'],
        ['p', 'Repeats a string a set number of times.'],
        ['code', 'REPLICATE(char_expr, integer_expr)'],
        ['demo', 'SELECT REPLICATE (FirstName,2)\nFROM   Employees'],
        ['h', 'SUBSTRING'],
        ['p', 'Returns part of a string.'],
        ['code', 'SUBSTRING(char_expr, start, length)'],
        T(['Part', 'Meaning'], [['`char_expr`', 'the string'], ['`start`', 'the position to begin at (the first character is 1)'], ['`length`', 'how many characters to take']]),
        ['demo', 'SELECT FirstName,\n       SUBSTRING (FirstName,2,5)\nFROM   Employees'],
        ['h', 'CHARINDEX'],
        ['p', 'Returns the position where a string is found.'],
        ['code', 'CHARINDEX(expr1, expr2 [,start])'],
        T(['Part', 'Meaning'], [['`expr1`', 'the string to find'], ['`expr2`', 'the string to search'], ['`start`', 'the position to start searching from (optional)']]),
        ['demo', "SELECT DISTINCT Title,\n       CHARINDEX ('ale', title)\nFROM   Employees"]
      ],
      quiz: [
        { q: 'What does this return?', code: "SELECT LEFT('Vice President, Sales', 4)", o: ['Vice', 'ales', 'Vic', 'e Pr'], a: 0, why: 'LEFT takes the first 4 characters.' },
        { q: 'What does this return?', code: "SELECT RIGHT('Sales Manager', 4)", o: ['ager', 'Sale', 'nage', 'Mana'], a: 0, why: 'RIGHT takes the last 4 characters.' },
        { q: 'What does this return?', code: "SELECT SUBSTRING('Margaret', 2, 5)", o: ['argar', 'Marga', 'rgare', 'Marg'], a: 0, why: 'Start at character 2 (“a”) and take 5 characters: a-r-g-a-r.' },
        { q: 'What does this return?', code: "SELECT LEN('Sales Manager')", o: ['13', '12', '14', '2'], a: 0, why: 'S-a-l-e-s, a space, then M-a-n-a-g-e-r: 13 characters.' },
        { q: 'What does this return?', code: "SELECT CHARINDEX('ale', 'Sales Manager')", o: ['2', '1', '3', '0'], a: 0, why: '“ale” starts at the 2nd character of “Sales”.' },
        { q: 'What does this return?', code: "SELECT REPLACE('abcdefghicde', 'cde', 'xxx')", o: ['abxxxfghixxx', 'abxxxfghicde', 'xxxabfghixxx', 'abcdefghixxx'], a: 0, why: 'REPLACE changes **all** matches, so both “cde” parts change.' }
      ]
    },
    {
      id: 's13', title: 'Numeric functions',
      sub: 'Number functions work on numeric values. They accept and return numbers.',
      blocks: [
        T(['Function', 'What it does', 'Examples'], [['`ABS`', 'returns the absolute value of a number', '`ABS(-1.0)` gives 1.0'], ['`POWER`', 'raises a number to a power', '`POWER(2,2)` gives 4, `POWER(3,4)` gives 81'], ['`CEILING`', 'smallest whole number greater than or equal to the number', '`CEILING(123.45)` gives 124, `CEILING(-123.45)` gives -123'], ['`FLOOR`', 'largest whole number less than or equal to the number', '`FLOOR(123.45)` gives 123, `FLOOR(-123.45)` gives -124'], ['`ROUND`', 'rounds to a given length or precision', '`ROUND(748.58,-1)` gives 750, `ROUND(123.4545,2)` gives 123.45']]),
        ['lab', 'number', { fn: 'ROUND', title: 'See where the number lands' }],
        ['demo', "SELECT ROUND(45.923,2) AS 'ROUND(45.923,2)',\n       ROUND(45.923,0) AS 'ROUND(45.923,0)',\n       ROUND(45.923,-1) AS 'ROUND(45.923,-1)'", { after: 'A negative length rounds to the left of the decimal point: -1 means the nearest ten.' }],
        ['demo', 'SELECT ProductName, UnitPrice,\n       ROUND(UnitPrice, 0) AS Rounded,\n       CEILING(UnitPrice) AS Up,\n       FLOOR(UnitPrice) AS Down\nFROM   Products\nWHERE  ProductID <= 5', { title: 'On a table', after: 'Each function runs on the price of every row. SQL Server would print 750.00 where this engine prints 750, because SQL Server keeps the decimals of the input.' }]
      ],
      quiz: [
        { q: 'What does `ABS(-1.0)` return?', o: ['1', '-1', '0', 'an error'], a: 0, why: 'ABS gives the absolute value: the distance from zero.' },
        { q: 'What does `POWER(3, 4)` return?', o: ['81', '12', '7', '64'], a: 0, why: '3 × 3 × 3 × 3 = 81.' },
        { q: 'What does `CEILING(-123.45)` return?', o: ['-123', '-124', '-123.5', '124'], a: 0, why: 'CEILING goes up toward the larger number. The next whole number above -123.45 is -123.' },
        { q: 'What does `FLOOR(-123.45)` return?', o: ['-124', '-123', '-123.4', '123'], a: 0, why: 'FLOOR goes down. The next whole number below -123.45 is -124.' },
        { q: 'What does `ROUND(748.58, -2)` return?', o: ['700', '750', '748', '800'], a: 0, why: 'A length of -2 rounds to the nearest hundred.' }
      ]
    },
    {
      id: 's14', title: 'Date functions',
      sub: 'Sometimes you want only one part of a date, or you want to do date arithmetic.',
      blocks: [
        ['p', 'These functions help: `DATENAME`, `DATEPART`, `DATEADD` and `DATEDIFF`. Most of them take a **datepart** as the first argument.'],
        T(['Datepart', 'Abbreviation', 'Datepart', 'Abbreviation'], [['Year', '`yy`, `yyyy`', 'Day', '`dd`, `d`'], ['Quarter', '`qq`, `q`', 'Week', '`wk`, `ww`'], ['Month', '`mm`, `m`', 'Hour', '`hh`'], ['', '', 'Minute', '`mi`, `n`']]),
        ['h', 'GETDATE'],
        ['p', 'Returns the current system date and time.'],
        ['code', 'GETDATE()'],
        ['try', 'SELECT GETDATE()'],
        ['h', 'DATEADD'],
        ['p', 'Returns a new date made by adding an interval to a date.'],
        ['code', 'DATEADD (datepart, number, date)'],
        ['lab', 'date', { fn: 'DATEADD', fns: ['DATEADD'], title: 'Add to a date' }],
        ['demo', 'SELECT Hiredate,\n       DATEADD(dd,3,Hiredate) AddDays,\n       DATEADD(mm,2,Hiredate) AddMonth,\n       DATEADD(yy,1,Hiredate) AddYear\nFROM   Employees'],
        ['h', 'DATEDIFF'],
        ['p', 'Returns the number of date and time **boundaries** crossed between two dates.'],
        ['code', 'DATEDIFF (datepart, startdate, enddate)'],
        ['lab', 'date', { fn: 'DATEDIFF', fns: ['DATEDIFF'], title: 'Count the boundaries' }],
        ['demo', 'SELECT Hiredate,\n       DATEDIFF(dd,Hiredate,GETDATE()) DiffDays,\n       DATEDIFF(mm,Hiredate,GETDATE()) DiffMonth,\n       DATEDIFF(yy,HIREDATE,GETDATE()) DiffYear\nFROM   Employees', { after: 'These numbers depend on today’s date, so they are bigger than the handout’s.' }],
        ['h', 'DATENAME and DATEPART'],
        ['p', '`DATENAME` returns a part of a date as **text**. `DATEPART` returns a part of a date as a **number**.'],
        ['code', 'DATENAME (datepart, date)\nDATEPART (datepart, date)'],
        ['lab', 'date', { fn: 'DATEPART', fns: ['DATEPART', 'DATENAME'], title: 'Take a date apart' }],
        ['demo', "SELECT DATENAME(MM, GETDATE())", { after: 'The datepart is MM, so this returns the name of the current month.' }],
        ['demo', "SELECT DATEPART (mm, GETDATE()) AS 'Month',\n       DATEPART (dd, GETDATE()) AS 'Day',\n       DATEPART (yyyy, GETDATE()) AS 'Year'", { after: 'This returns the number of the current month, day and year.' }],
        ['note', 'You can also use the straightforward functions `MONTH`, `YEAR` and `DAY`.'],
        ['try', 'SELECT LastName, HireDate,\n       MONTH(HireDate) AS M, DAY(HireDate) AS D, YEAR(HireDate) AS Y\nFROM   Employees', { title: 'MONTH, DAY and YEAR' }]
      ],
      quiz: [
        { q: 'Which function returns the current system date and time?', o: ['GETDATE()', 'DATEADD()', 'DATEPART()', 'NOW'], a: 0, why: 'GETDATE() takes no arguments.' },
        { q: 'What does this return?', code: "SELECT DATEADD(dd, 3, '1992-05-01')", o: ['1992-05-04', '1992-08-01', '1992-05-03', '1995-05-01'], a: 0, why: 'dd means days. Add 3 days to May 1.' },
        { q: 'Which function returns the month **name**, such as May?', o: ['DATENAME', 'DATEPART', 'DATEDIFF', 'DATEADD'], a: 0, why: 'DATENAME returns text. DATEPART returns a number.' },
        { q: 'Which function returns a part of a date as a **number**?', o: ['DATEPART', 'DATENAME', 'GETDATE', 'CONVERT'], a: 0, why: 'For example `DATEPART(mm, date)` gives 5 for May.' },
        { q: 'What does this return?', code: "SELECT DATEDIFF(yy, '1992-12-31', '1993-01-01')", o: ['1', '0', '2', '365'], a: 0, why: 'DATEDIFF counts boundaries crossed. One day apart, but the year boundary (January 1) is crossed once.' }
      ]
    },
    {
      id: 's15', title: 'Conversion functions: CAST and CONVERT',
      sub: 'Sometimes you need to convert data from one type to another. CAST and CONVERT do it explicitly.',
      blocks: [
        ['h', 'CAST'],
        ['p', 'Converts a value of any type into a data type you choose.'],
        ['code', 'CAST (expr AS datatype)'],
        T(['Part', 'Meaning'], [['`expr`', 'required. The value to convert'], ['`datatype`', 'the target data type']]),
        ['demo', 'SELECT birthdate,\n       CAST(birthdate AS VARCHAR(11))\nFROM   Employees', { after: 'A date becomes text in the form “Dec  8 1948”.' }],
        ['h', 'What is wrong with this statement?'],
        ['try', "SELECT ProductName + ' unit price is '\n       + UnitPrice AS 'Products Price'\nFROM   Products", { title: 'Run it and read the error' }],
        ['p', 'The `+` operator joins strings. `ProductName` is varchar but `UnitPrice` is money. SQL does not allow a non-string to be joined to a string. To fix it, convert `UnitPrice` to varchar.'],
        ['demo', "SELECT ProductName + ' unit price is '\n       + CAST(UnitPrice AS VARCHAR(20)) AS 'Products Price'\nFROM   Products", { title: 'The fixed statement' }],
        ['h', 'CONVERT'],
        ['p', 'Also converts a value to another data type. It has an optional **style** that controls how a date is written as text.'],
        ['code', 'CONVERT (datatype[length], expr [, style])'],
        T(['Part', 'Meaning'], [['`datatype`', 'the target data type'], ['`length`', 'optional. The length of the result (for char, varchar, nchar, nvarchar, binary and varbinary)'], ['`expr`', 'required. The value to convert'], ['`style`', 'the style of date format used to convert datetime or smalldatetime data to character data']]),
        ['lab', 'convert', { title: 'Pick a style' }],
        ['demo', "SELECT CONVERT(varchar(20), birthdate,1) 'mm/dd/yy',\n       CONVERT(varchar(20), birthdate,3) 'dd/mm/yy',\n       CONVERT(varchar(20), birthdate,6) 'dd mmm yy',\n       CONVERT(varchar(11), birthdate,9) 'mmm dd yyyy'\nFROM   Employees"]
      ],
      quiz: [
        { q: 'Why does `ProductName + \' unit price is \' + UnitPrice` fail?', o: ['UnitPrice is money, and + will not join a non-string to a string', 'ProductName is too long', 'The alias is missing', 'WHERE is missing'], a: 0, why: 'Convert UnitPrice to text first.' },
        { q: 'Which converts `UnitPrice` to text?', o: ['CAST(UnitPrice AS VARCHAR(20))', 'CAST(VARCHAR(20), UnitPrice)', 'UnitPrice AS CAST', 'TEXT(UnitPrice)'], a: 0, why: 'CAST takes the value, then AS, then the data type.' },
        { q: 'In `CONVERT(varchar(20), birthdate, 1)`, what is the `1`?', o: ['The style number for the date format', 'The length', 'A row number', 'A column number'], a: 0, why: 'The style decides how the date is written. Style 1 is mm/dd/yy.' },
        { q: 'CAST and CONVERT both…', o: ['convert a value to another data type', 'sort the rows', 'remove duplicate rows', 'join two tables'], a: 0, why: 'They convert data types explicitly.' },
        { q: 'What does this return?', code: "SELECT CONVERT(varchar(20), '1948-12-08', 3)", o: ['08/12/48', '12/08/48', '48/12/08', '1948-12-08'], a: 0, why: 'Style 3 is dd/mm/yy.' }
      ]
    }
  ],
  review: {
    intro: 'The handout has no guide questions for Lesson 6, so these exercises are new. Write the query, run it, then press Check answer.',
    tasks: [
      { q: 'Show each employee’s last name in capital letters and first name in small letters.', a: 'SELECT UPPER(LastName), LOWER(FirstName) FROM Employees' },
      { q: 'Show each different job title and the number of characters in it.', a: 'SELECT DISTINCT Title, LEN(Title) FROM Employees' },
      { q: 'Show each first name and its first three letters.', a: 'SELECT FirstName, LEFT(FirstName, 3) FROM Employees' },
      { q: 'Show the number 748.58 rounded to the nearest hundred.', a: 'SELECT ROUND(748.58, -2)' },
      { q: 'Show last name, hire date, and the date six months after hire. Name the last column Review Date.', a: "SELECT LastName, HireDate, DATEADD(mm, 6, HireDate) AS 'Review Date' FROM Employees", headers: true },
      { q: "For products that cost less than 10, show one column named Products Price with text like “Geitost unit price is 2.50”.", a: "SELECT ProductName + ' unit price is ' + CAST(UnitPrice AS VARCHAR(20)) AS 'Products Price' FROM Products WHERE UnitPrice < 10", headers: true }
    ],
    quiz: [
      { q: 'Which expression gives the first three letters of `LastName` in capitals?', o: ['UPPER(LEFT(LastName, 3))', 'LEFT(UPPER, 3)', 'UPPER(LastName, 3)', 'LEFT(LastName) UPPER'], a: 0, why: 'LEFT takes three letters. UPPER makes them capitals.' },
      { q: 'What does this return?', code: "SELECT LEN('abc   ')", o: ['3', '6', '4', '0'], a: 0, why: 'LEN does not count spaces at the end.' },
      { q: 'To show a date as text like 12/08/48, use…', o: ['CONVERT with a style number', 'ROUND', 'REPLICATE', 'DATEDIFF'], a: 0, why: 'Style 1 gives mm/dd/yy.' },
      { q: 'What does this return?', code: 'SELECT ROUND(123.4545, 2)', o: ['123.45', '123.46', '123', '123.5'], a: 0, why: 'Length 2 keeps two decimals.' },
      { q: 'Which clauses can contain a function?', o: ['SELECT, WHERE and ORDER BY', 'Only SELECT', 'Only WHERE', 'None of them'], a: 0, why: 'Single-row functions can be used in all three.' },
      { q: 'What does this return?', code: "SELECT DATEPART(mm, '1992-05-01')", o: ['5', 'May', '1992', '1'], a: 0, why: 'DATEPART gives a number. DATENAME would give “May”.' }
    ]
  }
};

export const LESSONS = [L4, L5, L6];
