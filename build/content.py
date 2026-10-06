"""content.py: Database Administration, Lessons 4-6 (Basic SQL, Restricting & Sorting, SQL Functions).
All prose is pasted verbatim from the PUP handout. Run: python3 build/content.py"""
from components import *
from vizdefs import V

META = dict(
    title="Basic SQL, Restricting &amp; Sorting, SQL Functions · Database Administration",
    desc="An illustrated, interactive explainer for Database Administration Lessons 4 to 6: SELECT, WHERE, ORDER BY and SQL functions.",
    key="pup-dba-sql-l4-6-v1",
    course="Database Administration · Lessons 4–6",
    edition="Polytechnic University of the Philippines",
    sources="Lesson 4 · Lesson 5 · Lesson 6",
    mast="SELECT * FROM",
    strip=["Basic SQL on Single Tables", "Restricting and Sorting Data", "SQL Functions"],
    kick="Three lessons · One query language",
    headline=["See your SQL", "<em>run.</em>"],
    deck="An interactive course on Lessons 4, 5 and 6. Watch each query run step by step, read the lesson, then check yourself with a short exercise.",
    rooms_title="Sixteen sections",
    hero="hero",
    loader="Executing query",
    fonts="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;0,700;1,500&display=swap",
)

def c(x): return f"<code>{x}</code>"

# ======================================================================= diagrams
_UNUSED_CAP = '''<svg class="pyr-svg cap-svg" viewBox="0 0 600 430" role="img" aria-label="Selection, projection and join on two tables">
  <g class="grid"><rect x="40" y="40" width="240" height="280"/>
    <line x1="88" y1="40" x2="88" y2="320"/><line x1="136" y1="40" x2="136" y2="320"/><line x1="184" y1="40" x2="184" y2="320"/><line x1="232" y1="40" x2="232" y2="320"/>
    <line x1="40" y1="80" x2="280" y2="80"/><line x1="40" y1="120" x2="280" y2="120"/><line x1="40" y1="160" x2="280" y2="160"/><line x1="40" y1="200" x2="280" y2="200"/><line x1="40" y1="240" x2="280" y2="240"/><line x1="40" y1="280" x2="280" y2="280"/>
    <rect x="380" y="40" width="180" height="280"/>
    <line x1="425" y1="40" x2="425" y2="320"/><line x1="470" y1="40" x2="470" y2="320"/><line x1="515" y1="40" x2="515" y2="320"/>
    <line x1="380" y1="80" x2="560" y2="80"/><line x1="380" y1="120" x2="560" y2="120"/><line x1="380" y1="160" x2="560" y2="160"/><line x1="380" y1="200" x2="560" y2="200"/><line x1="380" y1="240" x2="560" y2="240"/><line x1="380" y1="280" x2="560" y2="280"/></g>
  <g class="tier" data-t="0"><rect x="40" y="80" width="240" height="40"/><rect x="40" y="200" width="240" height="40"/><text x="110" y="370">Selection</text></g>
  <g class="tier" data-t="1"><rect x="88" y="40" width="48" height="280"/><rect x="184" y="40" width="48" height="280"/><text x="300" y="370">Projection</text></g>
  <g class="tier" data-t="2"><rect x="232" y="40" width="48" height="280"/><rect x="380" y="40" width="45" height="280"/><rect x="280" y="173" width="100" height="14"/><text x="480" y="370">Join</text></g>
  <text class="lbl" x="160" y="412">Table 1</text><text class="lbl" x="470" y="412">Table 2</text>
</svg>'''

FN_SVG = '''<svg class="pyr-svg" viewBox="0 0 600 360" role="img" aria-label="Arguments go into a function, which returns a result value">
  <g class="grid"><line x1="160" y1="78" x2="230" y2="165"/><line x1="160" y1="178" x2="230" y2="178"/><line x1="160" y1="278" x2="230" y2="191"/><line x1="380" y1="178" x2="450" y2="178"/></g>
  <text class="lbl" x="95" y="30">Input</text><text class="lbl" x="515" y="125">Output</text>
  <g class="tier" data-t="0"><rect x="30" y="50" width="130" height="56" rx="6"/><rect x="30" y="150" width="130" height="56" rx="6"/><rect x="30" y="250" width="130" height="56" rx="6"/>
    <text x="95" y="87" class="sm">arg 1</text><text x="95" y="187" class="sm">arg 2</text><text x="95" y="287" class="sm">arg n</text></g>
  <g class="tier" data-t="1"><rect x="230" y="140" width="150" height="76" rx="6"/><text x="305" y="188">Function</text></g>
  <g class="tier" data-t="2"><rect x="450" y="140" width="130" height="76" rx="6"/><text x="515" y="186" class="sm">Result</text></g>
</svg>'''

EMP9 = [["1", "Davolio", "Nancy", "Sales Representative"], ["2", "Fuller", "Andrew", "Vice President, Sales"],
        ["3", "Leverling", "Janet", "Sales Representative"], ["4", "Peacock", "Margaret", "Sales Representative"],
        ["5", "Buchanan", "Steven", "Sales Manager"], ["6", "Suyama", "Michael", "Sales Representative"],
        ["7", "King", "Robert", "Sales Representative"], ["8", "Callahan", "Laura", "Inside Sales Coordinator"],
        ["9", "Dodsworth", "Anne", "Sales Representative"]]
TITLES9 = [[r[3]] for r in EMP9]

# ======================================================================= LESSON 4
S1 = (
    lede("To extract data from the database, you need to use the structured query language (SQL) SELECT statement. You may need to restrict the columns that are displayed. This lesson describes all Ihe SQL statements that you need to perform these actions. You may want to create SELECT statements that can be used time and time again")
    + h4("Learning Outcomes")
    + bullets(["Understand the capabilities of SQL SELECT statements", "Execute a basic SELECT statement",
               "Understand the data security, data availability and data quality"],
              "At the end of this module, student should be able to:")
    + block(bhead("01", "Capabilities of SQL SELECT Statements", "Unit 1 · Select Statement"),
            para("A SELECT statement retrieves information from the database. Using a SELECT statement, you can do the following:"),
            V["caps"])
)

S2 = (
    lede("SQL statement SELECT is used to retrieve data from the tables in a database and the output is also displayed in tabular form.")
    + sql("SELECT [DISTINCT] {*, column [alias],…}\nFROM tableName", "Syntax")
    + para("In its simplest form, a <em>SELECT</em> statement must include the following")
    + bullets(["A " + c("SELECT") + " clause, which specifies the columns to be displayed.",
               "A " + c("FROM") + " clause, which specifies the table containing the columns listed in the <em>SELECT</em> clause."])
    + syn([("SELECT", "is a list of one or more columns"), ("DISTINCT", "suppresses duplicates."), ("*", "selects all columns"),
           ("column", "selects the named column."), ("alias", "gives selected columns different headings."),
           ("FROM tablename", "specifies the table containing the columns.")])
    + V["anatomy"]
    + note("<strong>NOTE:</strong> Throughout this course, the words <em>keyword</em>, <em>clause</em>, and <em>statement</em> are used.")
    + cards([("Keyword", "A <em>keyword</em> refers to an individual SQL element. For example, " + c("SELECT") + " and " + c("FROM") + " are keywords."),
             ("Clause", "A <em>clause</em> is a part of an SQL statement. For example. " + c("SELECT empno, ename, …") + " is a clause."),
             ("Statement", "A <em>statement</em> is a combination of two or more clauses. For example. " + c("SELECT * FROM emp") + " is a SQL statement.")])
    + block(bhead("01", "Writing SQL Statements"),
            para("Using the following simple rules and guidelines, you can construct valid statements that are both easy to read and easy to edit:"),
            pledges("", ["SQL statements are not case sensitive, unless indicated.", "SQL statements can be entered on one or many lines.",
                         "Keywords cannot be split across lines or abbreviated",
                         "Clauses are usually placed on separate lines for readability and ease of editing.",
                         "Tabs and indents can be used to make code more readable."]))
    + block(bhead("02", "Selecting All Columns"),
            para("You can display all columns of data in a table by following the <em>SELECT</em> keyword with an asterisk (*)."),
            sql("SELECT * FROM Region"),
            result(["RegionID", "RegionDescription"], [["1", "Eastern"], ["2", "Western"], ["3", "Northern"], ["4", "Southern"]]),
            para("In the example, the " + c("Region") + " table contains two columns: " + c("RegionID") + ", and " + c("RegionDescription") + ". The table contains four rows, one for each region.",
                 "You can also display all columns in the table by listing all the columns after the SELECT keyword. For example, the following SQL statement, displays all columns and all rows of the " + c("Region") + " table:"),
            sql("SELECT RegionID, RegionDescription\nFROM Region"))
    + block(bhead("03", "Selecting Specific Columns"),
            para("You can use the <em>SELECT</em> statement to display specific columns of the table by specifying the column names, separated by commas."),
            sql("SELECT EmployeeID, LastName,\n       FirstName,Title\nFROM Employees"),
            result(["EmployeeID", "LastName", "FirstName", "Title"], EMP9),
            para("The example displays all the employee IDs, Last names, First names and Titles from the " + c("Employees") + " table.",
                 "In the " + c("SELECT") + " clause, specifiy the columns that you want to see, in the order in which you want them to appear in the output."))
)

S3 = (
    lede("You may need to modify the way in which data is displayed, perform calculations, or look at what-if scenarios. This is possible using arithmetic expressions An arithmetic expression may contain column names, constant numeric values, and the arithmetic operators.")
    + block(bhead("01", "Arithmetic Operators"),
            optable(["Operator", "Description"], [["+", "Add"], ["-", "Subtract"], ["*", "Multiply"], ["/", "Divide"], ["%", "Modulus Division"]]),
            para("The arithmetic operators available in SQL.  You can use arithmetic operators in a clause of a SQL statement except the FROM clause"))
    + V["arith"]
    + block(bhead("02", "Operator Precedence"),
            keyrow([("Multiply", "*"), ("Divide", "/"), ("Add", "+"), ("Subtract", "-")]),
            bullets(["Multiplication and division take priority over addition and subtraction",
                     "Operators of the same priority are evaluated from left to right",
                     "You can use parentheses to force the expression within parentheses to be evaluated first"]))
    + block(bhead("03", "Using Arithmetic Operators"),
            sql("SELECT ProductID, ProductName,\n       Unitprice , UnitPrice +10\nFROM Products"),
            result(["ProductID", "ProductName", "Unitprice", "(No column name)"],
                   [["1", "Chai", "18.00", "28.00"], ["2", "Chang", "19.00", "29.00"], ["3", "Aniseed Syrup", "10.00", "20.00"],
                    ["4", "Chef Anton's Cajun", "22.00", "32.00"], ["5", "Chef Anton's Gumbo", "21.35", "31.35"], "…"], "(77 row(s) affected)"),
            para("The example uses the addition operator to calculate unit price increase of 10 for all products. The column which is the result of " + c("UnitPrice +10") + " is not a new column in the " + c("Products") + " table.  By default, if an arithmetic expression is used in an SQL statement, no column header will be displayed."))
    + block(bhead("04", "Defining a Null Value"),
            para("If a row lacks the data value for a particular column, that value is said to null.",
                 "A <em>null</em> value is a value that is unavailable, unassigned. unknown, or inapplicable. A null value is not the same as zero or a space. Zero is a number, and a space is a character.",
                 "Columns of any datatype can contain null values, unless the column was defined as <em>NOT NULL</em> or as <em>PRIMARY KEY</em> when the column was created."))
    + pull("A null value is not the same as zero or a space.")
    + block(bhead("05", "Null Values in Arithmetic Expressions"),
            para("Arithmetic expressions containing a null value evaluate to null."),
            sql("SELECT ProductID, ProductName,\n       Unitprice , UnitPrice +100\nFROM Products"),
            result(["ProductID", "ProductName", "Unitprice", "(No column name)"],
                   [["1", "Chai", "18.00", "28.00"], ["2", "Chang", "19.00", "29.00"], ["3", "Aniseed Syrup", "10.00", "20.00"],
                    ["4", "Chef Anton's Cajun", "22.00", "32.00"], ["5", "Chef Anton's Gumbo", "21.35", "31.35"],
                    ["6", "Grandma's Boysenberry", "NULL", "NULL"], "…"], "(77 row(s) affected)"),
            para("If any column value in an arithmetic expression is null, the result is null. For example, if you attempt to perform division with zero, you get an error. However, if you divide a number by null, the result is a null or unknown."))
)

S4 = (
    bullets(["Renames a column heading", "Is useful with calculations",
               "Requires double quotation marks if it contains spaces or special characters or is case sensitive"])
    + block(bhead("01", "Using Aliases to Refer to Columns"),
            para("Specify the alias after the column in the SELECT list using a space as a separator. Immediately follows column name; optional AS keyword between column name and alias"),
            V["alias"],
            sql("SELECT ProductName,\n       Unitprice , UnitPrice +10 AS NewPrice\nFROM Products"),
            result(["ProductID", "ProductName", "Unitprice", "NewPrice"],
                   [["1", "Chai", "18.00", "28.00"], ["2", "Chang", "19.00", "29.00"], ["3", "Aniseed Syrup", "10.00", "20.00"], "…"], "(77 row(s) affected)"),
            para("The example displays the " + c("ProductName, Unitprice,") + " and " + c("NewPrice") + ". Notice that output displays " + c("NewPrice") + " as column name. The result of the query would be the same whether the AS keyword is used or not."),
            sql("SELECT employeeid AS ‘Emp No.’,\n        fname = firstname,\n        lastname [Last Name]\nFROM   Employees"),
            result(["Emp No.", "fname", "Last Name"], [["1", "Nancy", "Davolio"], ["2", "Andrew", "Fuller"], ["3", "Janet", "Leverling"], "…"], "(9 row(s) affected)"),
            para("The example displays the " + c("employeeid") + "  but will be dislayed in the result as " + c("Emp No.") + " Since the alias contains special characters such as space and period, the alias should be enclosed with single quote or square bracket.  The next column which is " + c("firstname,") + " used equal sign to denotes alias of " + c("firstname") + " to " + c("fname.")))
    + block(bhead("02", "Concatenation Operator"),
            para("You can link columns to other columns, arithmetic expressions, or constant values to create a character expression by using the concatenation operator ( + ) Columns on either side of the operator are combined to make a single output column."),
            V["concat"],
            h4("Using the Concatenation Operator"),
            sql("SELECT LastName+Title AS EmployeeJob\nFROM   Employees"),
            result(["EmployeeJob"], [["DavolioSales Representative"], ["FullerVice President, Sales"], ["LeverlingSales Representative"], "…"], "(9 row(s) affected)"),
            para("In the example. " + c("LastName") + " and " + c("Title") + " are concatenated, and they are given the alias " + c("EmployeeJob") + ". Notice that the " + c("LastName") + " and job are combined to make a single output column. The " + c("AS") + " keyword before the alias name makes the " + c("SELECT") + " clause easier to read."))
    + block(bhead("03", "Literal Character Strings"),
            para("A literal is a character, expression, or number included in the SELECT list. Date and character literal values must be enclosed within single quotation marks. Each character string is output once for each row returned"),
            h4("Using Literal Character Strings"),
            sql("SELECT firstName+'  '+lastName+' is a '+Title\n      AS EmpDetail\nFROM   Employees"),
            result(["EmpDetail"], [["Nancy  Davolio is a Sales Representative"], ["Andrew  Fuller is a Vice President, Sales"], ["Janet  Leverling is a Sales Representative"], "…"], "(9 row(s) affected)"),
            para("The example names and jobs of all employees. The column has the heading " + c("EmpDetail") + " Notice the spaces between the single quotation marks the SELECT statement. The spaces improve the readability of the output"))
)

GUIDE4 = block(
    bhead("Q", "Assessment / Activities", "ASSESSMENT/ACTIVITIES GUIDE QUESTION/s · Guide Questions"),
    para("1. Will the SELECT statement execute successfully? True/False"),
    sql("SELECT ProductID, ProductName, UnitPrice Cost\nFROM Products", "Question 1"),
    para("2. Will the SELECT statement execute successfully? True/False"),
    sql("SELECT * FROM ProductSupplier", "Question 2"),
    para("3. There are four coding errors in this statement. Can you identify them?"),
    sql("SELECT ProductID, ProductName\n       UnitPrice x 1.10 INCREASE PRICE\nFROM Products", "Question 3"),
    pledges("", ["Show the structure of the SUPPLIERS table. Select all data from the SUPPLIERS table.",
                 "Show the structure of the EMPLOYEES table. Create a query to display the name, job, hire date, and employee ID for each employee, with employee number appearing first.",
                 "Create a query to display unique countries from the EMPLOYEES table.",
                 "Create a query and name the column headings Emp #, Employee, Job, and Hire Date, respectively.",
                 "Display the employee name concatenated with the job separated by a comma and space, and name the column Employee and Title.",
                 "Create a query to display all the data from the CATEGORIES table. Separate each column by a comma. Name the column THE OUTPUT."]),
)
# renumber pledge items 4..9 (source numbering)
_parts = GUIDE4.split('<span class="code-n">')
GUIDE4 = _parts[0] + "".join(f'<span class="code-n">{i:02d}</span>' + p.split("</span>", 1)[1] for i, p in enumerate(_parts[1:], 4))

S5 = (
    lede("The default display of queries is all rows, including duplicate rows.  Unless you indicate otherwise, it will displays results of a query without eliminating duplicate rows.")
    + sql("SELECT Title\nFROM   Employees")
    + result(["Title"], TITLES9, "(9 row(s) affected)")
    + block(bhead("01", "Eliminating Duplicate Rows"),
            para("To eliminate duplicate rows in the result, include the " + c("DISTINCT") + " keyword in the " + c("SELECT") + " clause immediately after the " + c("SELECT") + " keyword."),
            sql("SELECT DISTINCT Title\nFROM   Employees"),
            result(["Title"], [["Inside Sales Coordinator"], ["Sales Manager"], ["Sales Representative"], ["Vice President, Sales"]], "(4 row(s) affected)"),
            para("In the example, the " + c("Employees") + " table actually contains 9 rows but there are only four unique " + c("Title") + " in the table. You can specify multiple columns after the " + c("DISTINCT") + " qualifier. The " + c("DISTINCT") + " qualifier affects all the selected columns, and the result represents a distinct combination of the columns"),
            V["distinct"])
    + block(bhead("02", "Understanding DISTINCT"),
            bullets(["Specifies that only unique rows can appear in the result set.",
                     "Removes duplicates based on column list results, not source table.",
                     "Provides uniqueness across set of selected columns.",
                     "Some queries may improve performance by filtering out duplicates prior to execution of SELECT clause."]))
    + GUIDE4
)

# ======================================================================= LESSON 5
EMPDEPT = [["7839", "KING", "PRESIDENT", "...", "10"], ["7698", "BLAKE", "MANAGER", "", "30"],
           ["7782", "CLARK", "MANAGER", "", "10"], ["7566", "JONES", "MANAGER", "", "20"], "…"]
S6 = (
    lede("While retrieving data from the database, you may need to restrict the rows of the data that are display or specify the order in which rows are displayed.  This lesson explains the SQL statement that you will use to perform these actions.")
    + h4("Learning Outcomes")
    + bullets(["Limit the rows retrieved by a query", "Sort the rows retrieved by a query"],
              "After completing this lesson,   you should be able to do the following:")
    + block(bhead("01", "Limiting Rows Selected", "Unit 1 · Limiting Rows Using a Selection"),
            para("You want to restrict query results to a subset of rows in the table that interest you."),
            result(["EMPNO", "ENAME", "JOB", "...", "DEPTNO"], EMPDEPT, label="EMPLOYEE"),
            result(["EMPNO", "ENAME", "JOB", "...", "DEPTNO"], [["7839", "KING", "PRESIDENT", "", "<b>10</b>"], ["7782", "CLARK", "MANAGER", "", "<b>10</b>"], ["7934", "MILLER", "CLERK", "", "<b>10</b>"]],
                   label="EMPLOYEE · \"…retrieve all employees in department 10\""),
            para("In the example, assume that you want to display all the employees in department 10. The highlighted set of rows with a value of 10 in DEPTNO column are the only ones returned.",
                 "You can restrict the rows returned from the query by using the " + c("WHERE") + " clause. A " + c("WHERE") + " clause contains a condition that must be met, and it directly follows the " + c("FROM") + " clause."),
            sql("SELECT [DISTINCT] {*, column [alias],…}\nFROM tableName\n [ WHERE condition (s)]", "Syntax"),
            syn([("WHERE", "restricts the query to rows that meet a condition"),
                 ("condition", "is composed of column names, expressions, constants, and a comparison operator")]),
            para("The " + c("WHERE") + " clause can compare values in columns, literal values, arithmetic expressions, or functions. The " + c("WHERE") + " clause consists of three elements:"),
            bullets(["Column name", "Comparison operator", "Column name, constant, or list of values"]))
    + V["where"]
    + block(bhead("02", "Using the WHERE clause"),
            sql("SELECT EmployeeID, LastName,Title\nFROM Employees\nWHERE Title = ‘Sales Representative’"),
            result(["EmployeeID", "LastName", "Title"], [["1", "Davolio", "Sales Representative"], ["3", "Leverling", "Sales Representative"], ["4", "Peacock", "Sales Representative"],
                                                         ["6", "Suyama", "Sales Representative"], ["7", "King", "Sales Representative"], ["9", "Dodsworth", "Sales Representative"]]),
            para("In the example, the " + c("SELECT") + " statement retrieves the " + c("EmployeeID,  LastName") + " and " + c("Title") + " of all employees whose job title is " + c("Sales Representative")))
    + block(bhead("03", "Character Strings and Dates"),
            para("Character strings and dates in the " + c("WHERE") + " clause must be enclosed in single quotation marks (' '). Number constants, however, should not."),
            sql("SELECT EmployeeID, LastName,\n   FirstName, Title\nFROM   Employees\nWHERE LastName = ‘King’"))
)

S7 = (
    optable(["Operator", "Meaning"], [["=", "Equal to"], ["&gt;", "Greater than"], ["&gt;=", "Greater than or equal to"], ["&lt;", "Less than"],
                                      ["&lt;=", "Less than or equal to"], ["&lt;&gt;,!=", "Not equal to"]])
    + V["gt"]
    + para("Comparison operators are used in conditions that compare one expression to another. They are used in the " + c("WHERE") + " clause in the following format:")
    + sql(". . .  WHERE expr operator value", "Syntax")
    + sql("SELECT CompanyName, Country\nFROM   Customers\nWHERE Country = ‘Spain’")
    + para(c("SELECT") + " statement retrieves the " + c("CompanyName") + "  and " + c("Country") + " of all customers from Spain")
    + sql("SELECT OrderID, Orderdate\nFROM   Orders\nWHERE Orderdate < ’07-01-2007’")
    + para(c("SELECT") + " statement retrieves the " + c("OrderID") + " and " + c("Orderdate") + " of all Orders before July 1, 2007")
    + sql("SELECT OrderID, Orderdate\nFROM   Orders\nWHERE Orderdate >= ’07-01-2007’\n      AND Orderdate < ’01-01-2008’")
    + para(c("SELECT") + " statement retrieves the " + c("OrderID") + " and " + c("Orderdate") + " of all Orders from July 1, 2007 up to December 31, 2007")
    + sql("SELECT ProductName, UnitPrice\nFROM   Products\nWHERE UnitPrice > 15")
    + para(c("SELECT") + " statement retrieves the " + c("ProductName") + " and " + c("UnitPrice") + " of all Products that Unit price is greater than 15")
    + block(bhead("01", "Filtering Data in the WHERE Clause With Predicates"),
            rules([("WHERE clauses use predicates (IN, LIKE, BETWEEN)", ["<p>Must be expressed as logical conditions</p>", "<p>Only rows for which predicate evaluates to TRUE are accepted</p>", "<p>Values of FALSE or UNKNOWN filtered out</p>"]),
                   ("WHERE clause follows FROM, precedes other clauses", ["<p>Can’t see aliases declared in SELECT clause</p>"]),
                   ("Data filtered server-side", ["<p>Can reduce network traffic and client memory usage</p>"])]))
    + block(bhead("02", "T-SQL Language Elements: Predicates and Operators"),
            optable(["Elements:", "Predicates and Operators:"], [["Predicates", "IN, BETWEEN, LIKE"], ["Comparison Operators", "=, &gt;, &lt;, &gt;=, &lt;=, &lt;&gt;, !=, !&gt;, !&lt;"], ["Logical Operators", "AND, OR, NOT"]], mono_first=False))
)

S8 = (
    optable(["Operator", "Meaning"], [["BETWEEN.. AND..", "Between two values (inclusive)"], ["IN (list)", "Match any of a list of values"], ["LIKE", "Match a character pattern"], ["IS NULL", "Is a null value"]])
    + block(bhead("01", "Using the BETWEEN Operator"),
            para("You can display rows based on a range of values using the " + c("BETWEEN") + " operator. The range that you specify contains a lower range and an upper range.",
                 "Values specified with the " + c("BETWEEN") + " operator are inclusive. You must specify the lower limit first."),
            V["between"],
            sql("SELECT ProductName, UnitPrice\nFROM   Products\nWHERE UnitPrice BETWEEN 50 AND 100"),
            result(["ProductName", "UnitPrice"], [["Mishi Kobe Niku", "97.00"], ["Carnarvon Tigers", "62.50"], ["Sir Rodney's Marmalade", "81.00"], ["Manjimup Dried Apples", "53.00"], ["Raclette Courdavault", "55.00"]]),
            para(c("SELECT") + " statement retrieves the " + c("ProductName") + " and " + c("UnitPrice") + " of all Products that Unit price is between 50 to 100 only"),
            sql("SELECT LastName, HireDate\nFROM   Employees\nWHERE HireDate BETWEEN '01-01-1994'  AND '12-31-1994'"),
            result(["LastName", "HireDate"], [["King", "1994-01-02"], ["Callahan", "1994-03-05"], ["Dodsworth", "1994-11-15"]]),
            para("The " + c("SELECT") + " statement above returns the employee last name and hire date from the " + c("Employees") + "  table for any employee that was hired on the year 1994"))
    + V["innull"]
    + block(bhead("02", "Using the IN Operator"),
            para("Use the " + c("IN") + " operator to test for values in a list. The " + c("IN") + " operator can be used with any datatype."),
            sql("SELECT LastName, FirstName, City\nFROM   Employees\nWHERE City IN ('Tacoma', 'Kirkland', 'Redmond')"),
            result(["LastName", "FirstName", "City"], [["Fuller", "Andrew", "Tacoma"], ["Leverling", "Janet", "Kirkland"], ["Peacock", "Margaret", "Redmond"]]),
            para(c("SELECT") + " statement returns the " + c("LastName,  FirstName") + "  and " + c("City") + " of all employees who live in either Tacoma, Kirkland or Redmond"))
    + block(bhead("03", "Using the LIKE Operator"),
            para("You may not always know the exact value to search for. You can select rows that match a character pattern by using the " + c("LIKE") + " operator. The character pattern-matching operation is referred to as a wildcard search. Two svmbols can be used to construct the search string."),
            syn([("%", "denotes zero or many characters."), ("_", "denotes one character")], ""),
            V["like"],
            sql("SELECT LastName\nFROM   Employees\nWHERE LastName LIKE 'D%'"),
            result(["LastName"], [["Davolio"], ["Dodsworth"]]),
            para("The " + c("SELECT") + " statement above returns the employee last name from the " + c("Employees") + "  table for any employee whose last name begins with an \"D”."),
            sql("SELECT LastName\nFROM   Employees\nWHERE LastName LIKE '%g'"),
            result(["LastName"], [["King"], ["Leverling"]]),
            para("The " + c("SELECT") + " statement above returns the employee last name from the " + c("Employees") + "  table for any employee whose last name ends with an \"g”."),
            sql("SELECT LastName\nFROM   Employees\nWHERE LastName LIKE '%ha%'"),
            result(["LastName"], [["Buchanan"], ["Callahan"]]),
            para("The " + c("SELECT") + " statement above returns the employee last name from the " + c("Employees") + "  table for any employee whose last name contains the word \"ha”."),
            h4("Combining Wildcard Characters"),
            para("You can combine pattern-matching characters.  The % and _ symbols can be used in any combination with literal characters."),
            sql("SELECT LastName\nFROM   Employees\nWHERE LastName LIKE '_E%'"),
            result(["LastName"], [["Peacock"], ["Leverling"]]),
            para("The " + c("SELECT") + " statement above returns the employee last name from the " + c("Employees") + "  table for any employee whose last name second character is an \"e”."),
            lab("like", "LIKE pattern tester"))
    + block(bhead("04", "The IS NULL Operator"),
            para("The " + c("IS  NULL") + " operator tests for values that are null. A null value means the value is unavailable, unassigned, unknown, or inapplicable. Therefore, you cannot test with (=) because a null value cannot be equal or unequal to any value."),
            sql("SELECT LastName, ReportsTo\nFROM   Employees\nWHERE ReportsTo IS NULL"),
            result(["LastName", "ReportsTo"], [["Fuller", "NULL"]]))
)

S9 = (
    para("A logical operator combines the result of two component conditions to produce a single result based on them or to invert the result of a single condition. Three logical operators are available in SQL:")
    + optable(["Operators", "Meaning"], [["AND", "Returns TRUE if both component conditions are TRUE"], ["OR", "Returns TRUE if either component condition is TRUE"], ["NOT", "Returns TRUE if the following condition is FALSE"]])
    + para("All the examples so far have specified only one condition in the " + c("WHERE") + " clause. You can use several conditions in one " + c("WHERE") + " clause using the " + c("AND") + " and " + c("OR") + " operators")
    + V["venn"]
    + block(bhead("01", "Using the AND Operator"),
            sql("SELECT LastName, Title, City\nFROM   Employees\nWHERE Title = 'Sales Representative'\n   AND  City = 'London'"),
            result(["LastName", "Title", "City"], [["Suyama", "Sales Representative", "London"], ["King", "Sales Representative", "London"], ["Dodsworth", "Sales Representative", "London"]]),
            para("In the example, both conditions must be true for any record to be retrieved. Therefore, an employee who has a job title of Sales Representative and lives in London will be selected."))
    + block(bhead("02", "Using the OR Operator"),
            sql("SELECT LastName, Title, City\nFROM   Employees\nWHERE Title = 'Sales Representative'\n   OR  City = 'London'"),
            result(["LastName", "Title", "City"], [["Davolio", "Sales Representative", "Seattle"], ["Leverling", "Sales Representative", "Kirkland"], ["Peacock", "Sales Representative", "Redmond"],
                                                   ["Buchanan", "Sales Manager", "London"], ["Suyama", "Sales Representative", "London"], ["King", "Sales Representative", "London"], ["Dodsworth", "Sales Representative", "London"]]),
            para("In the example, either conditions must be true for any record to be retrieved. Therefore, an employee who has a job title of Sales Representative <em>or</em> lives in London will be selected."))
    + block(bhead("03", "Using the NOT Operator"),
            para("The " + c("NOT") + " operator displays a record if the condition(s) is NOT TRUE."),
            sql("SELECT LastName, Title\nFROM   Employees\nWHERE NOT Title = 'Sales Representative'"),
            result(["LastName", "Title"], [["Fuller", "Vice President, Sales"], ["Buchanan", "Sales Manager"], ["Callahan", "Inside Sales Coordinator"]]),
            para("The " + c("SELECT") + " statement above returns the employee last name and title from the " + c("Employees") + "  table for any employee whose job is not a Sales Representative"),
            note("<strong>NOTE:</strong> The NOT operator can also be used with other SQL operators, such as " + c("BETWEEN") + ", " + c("LIKE") + ", and " + c("NULL") + "."),
            sql(". . .\nWHERE City NOT IN ('Seattle', 'Redmond', 'London')\n. . .\nWHERE UnitPrice NOT BETWEEN 10 AND 50\n. . .\nWHERE Title NOT LIKE '%Sales%'\n. . .\nWHERE ReportsTo IS NOT NULL", "Fragments"))
    + block(bhead("04", "Rules of Precedence"),
            para("Override rules of precedence by using parentheses."),
            optable(["Order Evaluated", "Operator"], [["1", "All comparison operators"], ["2", "NOT"], ["3", "AND"], ["4", "OR"]]),
            V["prec"],
            sql("SELECT LastName, Title, City\nFROM   Employees\nWHERE Title = 'Sales Representative'\n      OR Title = 'Sales Manager'\n      AND  City = 'London'"),
            result(["LastName", "Title", "City"], [["Davolio", "Sales Representative", "Seattle"], ["Leverling", "Sales Representative", "Kirkland"], ["Peacock", "Sales Representative", "Redmond"],
                                                   ["Suyama", "Sales Representative", "London"], ["King", "Sales Representative", "London"], ["Dodsworth", "Sales Representative", "London"]]),
            para("In the example, there are two conditions: The first condition is that job is Sales Manager  and city is London. The second condition is that job is Sales Representative. Therefore, the " + c("SELECT") + " statement reads as follows: \"Select the row if an employee is a Sales Manager and city is London or if the employee is a Sales Representative \""))
    + block(bhead("05", "Using Parentheses"),
            para("The parentheses to force priority"),
            sql("SELECT LastName, Title, City\nFROM   Employees\nWHERE (Title = 'Sales Representative'\n      OR Title = 'Sales Manager')\n      AND  City = 'London'"),
            result(["LastName", "Title", "City"], [["Suyama", "Sales Representative", "London"], ["King", "Sales Representative", "London"], ["Dodsworth", "Sales Representative", "London"]]),
            para("In the example, there are two conditions: The first condition is that job is Sales Manager  or Sales Representative. The second condition is city is London. Therefore, the " + c("SELECT") + " statement reads as follows: \"Select the row if an employee is a Sales Manager or Sales Representative  and city is London\""))
)

S10 = (
    pull("The order of rows returned in a query result is undefined.")
    + block(bhead("01", "Using ORDER BY", "Unit 2 · The ORDER BY Clause"),
            para("The order of rows returned in a query result is undefined. The ORDER BY clause can be used to sort the rows. If you use the ORDER BY clause, you must place last. You can specify an expression or an alias to sort."),
            sql("SELECT [DISTINCT] {*, column [alias],…}\nFROM tableName\n [ WHERE condition (s)]\n [ ORDER BY {column, expr} [ASC|DESC]]", "Syntax"),
            syn([("ORDER  BY", "specifies the order in which the retrieved rows are displayed"), ("ASC", "orders the rows in ascending order (this is the default order)"), ("DESC", "orders the rows in descending order")]),
            bullets(["No guaranteed order of rows without " + c("ORDER  BY"), "Use of " + c("ORDER  BY") + " guarantees the sort order of the result",
                     "Last clause to be logically processed", "Sorts all NULLs together"], c("ORDER  BY") + " sorts rows in results for presentation purposes"),
            para("Declare sort order with " + c("ASC") + " or " + c("DESC")))
    + V["order"]
    + block(bhead("02", "ORDER BY Clause Syntax"),
            para("Writing " + c("ORDER  BY") + " using column names:"),
            sql("SELECT <select list>\nFROM <table source>\nORDER BY <column1_name>, <column2_name>", "Syntax"),
            para("Writing " + c("ORDER  BY") + " using column aliases:"),
            sql("SELECT <column> AS <alias>\nFROM <table source>\nORDER BY <alias>", "Syntax"),
            para("Specifying sort order in the " + c("ORDER  BY") + " clause:"),
            sql("SELECT <column> AS <alias>\nFROM <table source>\nORDER BY <column|alias> ASC|DESC", "Syntax"))
    + block(bhead("03", "Default Ordering of Data"),
            para("The default sort order is ascending:"),
            bullets(["Numeric values are displayed with the lowest values first<br>—for example, 1-999.",
                     "Date values are displayed with the earliest value first<br>—for example: 0l-JAN-92 before 0l-JAN-95.",
                     "Character values are displayed in alphabetical order<br>—for example: A first and Z last.",
                     "Null values are displayed last for ascending sequences and first for descending sequences."]),
            sql("SELECT LastName, FirstName, HireDate\nFROM   Employees\nORDER BY HireDate"),
            result(["LastName", "FirstName", "HireDate"], [["Leverling", "Janet", "1992-04-01"], ["Davolio", "Nancy", "1992-05-01"], ["Fuller", "Andrew", "1992-08-14"], ["Peacock", "Margaret", "1993-05-03"], "…"], "(9 row(s) affected)"),
            para("The example sorts the result by the earliest hired employee"))
    + block(bhead("04", "Sorting in Descending Order"),
            para("To reverse the order in which rows are displayed, specify the keyword " + c("DESC") + " after the column name in the " + c("ORDER  BY") + " clause"),
            sql("SELECT LastName, FirstName, HireDate\nFROM   Employees\nORDER BY HireDate DESC"),
            result(["LastName", "FirstName", "HireDate"], [["Dodsworth", "Anne", "1994-11-15"], ["Callahan", "Laura", "1994-03-05"], ["King", "Robert", "1994-01-02"], ["Buchanan", "Steven", "1993-10-17"], "…"], "(9 row(s) affected)"),
            para("The example sorts the result by the most recently hired employee"))
    + block(bhead("05", "Sorting by Column Aliases"),
            para("You can use a column alias in the " + c("ORDER  BY") + " clause."),
            sql("SELECT LastName, FirstName, Title AS Job\nFROM   Employees\nORDER BY Job"),
            result(["LastName", "FirstName", "Job"], [["Callahan", "Laura", "Inside Sales Coordinator"], ["Buchanan", "Steven", "Sales Manager"], ["Suyama", "Michael", "Sales Representative"], ["King", "Robert", "Sales Representative"], "…"], "(9 row(s) affected)"),
            para("The example sorts the result by job of employee"))
    + block(bhead("06", "Sorting by Multiple Columns"),
            para("You can sort query results by more than one column. The sort limit is the number of columns in the given table. In the " + c("ORDER  BY") + " clause, specify the columns, and separate the column names using commas. If you want to reverse the order of a column, specify " + c("DESC") + " after its name."),
            note("<strong>NOTE:</strong> You can sort columns that are not included in the " + c("SELECT") + " clause."),
            sql("SELECT LastName, FirstName, Title\nFROM   Employees\nORDER BY FirstName, Title DESC"),
            result(["LastName", "FirstName", "Title"], [["Fuller", "Andrew", "Vice President, Sales"], ["Dodsworth", "Anne", "Sales Representative"], ["Leverling", "Janet", "Sales Representative"], ["Callahan", "Laura", "Inside Sales Coordinator"], "…"], "(9 row(s) affected)"))
    + pledges("ASSESSMENT/ACTIVITIES GUIDE QUESTION/s · Guide Questions", [
        "Create a query to display the ID, name and unit price of products which cost more than 120.",
        "Create a query to display the employee ID, name and Title for employee ID 8.",
        "Create a query to display the ID, name and unit price of products which not in the range of 150 and 200.",
        "Display the employee ID name, title and hired date of employees hired between January 20. 1994, and May 1. 1994. Order the query in ascending order by start date.",
        "Display the ID, name and category ID of all products in category ID 2 and 6 in alphabetical order by name",
        "List the name and unit price of products that cost more than 150 and are in category ID 4 or 8. Label the columns Product and Unit Cost, respectively.",
        "Display the name and job title of all employees who do not have a manager.",
        "Display the first names of all employees where the third letter of their name is an N.",
        "Display the last names of all employees who have two Ls in their last name and are in the country of USA or their manager is 2.",
        "Display the name, category ID and unit price for all products whose category ID is 1 or 3 and unit price it not equal to 50, 100 and 150"])
)

# ======================================================================= LESSON 6
S11 = (
    lede("Functions make the basic query block more powerful and are used to manipulate data values. This lesson will focus on single-row character, number, and date functions, as well as those functions that convert data from one type to another—for example, character data to numeric.")
    + h4("Learning Outcomes")
    + bullets(["Describe various types of functions available in SQL", "Use character, number, and date functions in SELECT statements", "Describe the use of conversion functions"],
              "After completing this lesson,   you should be able to do the following:")
    + block(bhead("01", "What Is a Function?", "Unit 1 · Functions"),
            diagram(FN_SVG, [
                ("Function", "", "<p>A function is a programming unit returning a single value, allowing values to be passed in as parameters.</p>", 1),
                ("Input", "arg 1, arg 2 … arg n", "<p>The parameters can change the outcome or return the result of a function.</p>", 0),
                ("Output", "Result value", "<p>SQL functions may accept arguments and always return a value.</p>", 2),
                ("Function performs action", "", "<p>The beauty of a function is that it is self-contained and can thus be embedded in an expression.</p>", 1)],
                caption="Input · Function · Output"))
    + block(bhead("02", "SQL Functions"),
            bullets(["Perform calculations on data", "Modify individual data items", "Manipulate output for groups of rows", "Format dates and numbers for display", "Convert column datatypes"],
                    "Functions are a very powerful feature of SQL and can be used to do the following:"))
    + block(bhead("03", "Types of Functions"),
            para("There are two distinct types of functions:"),
            V["flow"],
            bullets(["String", "Number", "Date", "Conversion"], "Single-row functions:"))
)

S12 = (
    lede("Single-row functions are used to manipulate data items. They accept one or more arguments and return one value for each row returned by the query.")
    + bullets(["User-supplied constant", "Variable value", "Column name", "Expression"], "An argument can be one of the following:")
    + bullets(["Act on each row returned in the query", "Return one result per row", "May return a data value of a different type than that referenced",
               "May expect one or more arguments", "Can be used in " + c("SELECT,  WHERE") + ", and " + c("ORDER  BY") + " clauses; can be nested"], "Features of single-row functions:")
    + sql("function_name (column|expression, [arg1, arg2,...])", "Syntax")
    + syn([("function_name", "is the name of the function"), ("column", "is any named database column"), ("expression", "is any character string or calculated expression"), ("arg1, arg2", "is any argument to be used by the function")])
    + block(bhead("01", "Single row functions are grouped as follows:", "Unit 2 · Single-Row Functions"),
            bullets(["String functions: Accept character input and can return both character and number values",
                     "Number functions: Accept numeric input and return numeric values",
                     "Date functions: Operate on values of the date datatype",
                     "Conversion functions: Convert a value from one datatype to another"]))
    + block(bhead("02", "String Functions"),
            para("String functions are used to perform an operation on input string and return an output string."),
            h4("Case Conversion Functions"),
            para("Convert case for character strings"),
            optable(["Function", "Description", "Syntax"], [["LOWER", "Converts a string to lower-case", c("LOWER(char_expr)")], ["UPPER", "Converts a string to upper-case", c("UPPER(char_expr)")]]),
            V["case"],
            sql("SELECT UPPER (LastName) LName,\n       LOWER (FirstName) FName\nFROM   Employees"),
            result(["LName", "FName"], [["FULLER", "andrew"], ["DODSWORTH", "anne"], ["LEVERLING", "janet"], ["CALLAHAN", "laura"], "…"], "(9 row(s) affected)"))
)

S13 = (
    V["str"]
    + block(bhead("01", "LEN"),
          para("Returns the number of characters of the specified string expression"),
          sql("LEN(char_expr)", "Syntax"),
          sql("SELECT DISTINCT Title,\n       LEN (Title) Length\nFROM   Employees"),
          result(["Title", "Length"], [["Inside Sales Coordinator", "24"], ["Sales Manager", "13"], ["Sales Representative", "20"], ["Vice President, Sales", "21"]]))
    + block(bhead("02", "LEFT"),
            para("Returns the part of a character string starting at a specified number of characters from the left"),
            sql("LEFT(char_expr, integer_expr)", "Syntax"),
            sql("SELECT Title,\n       LEFT (Title,4)\nFROM   Employees"),
            result(["Title", "(No column name)"], [["Vice President, Sale", "Vice"], ["Inside Sales Coordinator", "Insi"], ["Sales Manager", "Sale"], ["Sales Representative", "Sale"]]))
    + block(bhead("03", "RIGHT"),
            para("Returns the part of a character string starting at a specified number of characters from the right"),
            sql("RIGHT(char_expr, integer_expr)", "Syntax"),
            sql("SELECT Title,\n       RIGHT (Title,4)\nFROM   Employees"),
            result(["Title", "(No column name)"], [["Vice President, Sale", "ale"], ["Inside Sales Coordinator", "ato"], ["Sales Manager", "ager"], ["Sales Representative", "tive"]]))
    + block(bhead("04", "LTRIM"),
            para("Returns a character expression after removing leading blanks"),
            sql("LTRIM(char_expr)", "Syntax"),
            sql("SELECT LTRIM (‘     abcde’)"))
    + block(bhead("05", "RTRIM"),
            para("Returns a character expression after removing trailing blanks"),
            sql("RTRIM(char_expr)", "Syntax"),
            sql("SELECT RTRIM (‘abcde   ’)"))
    + block(bhead("06", "REPLACE"),
            para("Replaces all occurrences of the second given string expression in the first string expression with a third expression."),
            sql("REPLACE('str_expr1', 'str_expr2’, 'str_expr3')", "Syntax"),
            syn([("str_expr1", "string to be searched"), ("str_expr2", "string try to find"), ("str_expr3", "replacement string")]),
            sql("SELECT REPLACE (‘abcdefghicde’)"),
            result(["(No column name)"], [["abxxxfghixxx"]]))
    + block(bhead("07", "REPLICATE"),
            para("Repeats a character expression for a specified number of times"),
            sql("REPLICATE(char_expr, integer_expr)", "Syntax"),
            sql("SELECT REPLICATE (FirstName,2)\nFROM   Employees"),
            result(["FirstName"], [["NancyNancy"], ["AndrewAndrew"], ["JanetJanet"], ["MargaretMargaret"], "…"], "(9 row(s) affected)"))
    + block(bhead("08", "SUBSTRING"),
            para("Returns part of a character, binary, text, or image expression"),
            sql("SUBSTRING(char_expr, start, length)", "Syntax"),
            syn([("char_expr", "string"), ("start", "beginning position of the substring to be extracted"), ("length", "length of the string extracted")]),
            sql("SELECT FirstName ,\n       SUBSTRING (FirstName,2,5)\nFROM   Employees"),
            result(["FirstName", "(No column name)"], [["Nancy", "ancy"], ["Andrew", "ndrew"], ["Janet", "anet"], ["Margaret", "argar"], "…"], "(9 row(s) affected)"))
    + block(bhead("09", "CHARINDEX"),
            para("Returns the starting position of a string specify"),
            sql("CHARINDEX(expr1, expr2 [,start])", "Syntax"),
            syn([("expr1", "string to be found"), ("expr2", "string to be searched"), ("start", "expression at which the search starts")]),
            sql("SELECT DISTINCT Title ,\n       CHARINDEX (‘ale’,title)\nFROM   Employees"),
            result(["Title", "(No column name)"], [["Vice President, Sale", "18"], ["Inside Sales Coordinator", "9"], ["Sales Manager", "2"], ["Sales Representative", "2"]]))
)

S14 = (
    lede("Number functions operate on values of number class datatype. These functions accept and return just numeric values.")
    + V["num"]
    + block(bhead("01", "ABS"), para("Return the absolute value of the number"), sql("ABS (-1.0)              1.0", "Example"))
    + block(bhead("02", "POWER"), para("Returns the value of the given expression to the specified power"),
            sql("POWER (2,2)             4\nPOWER (3,4)             81", "Example"))
    + block(bhead("03", "CEILING"), para("Returns the smallest integer greater than, or equal to, the given numeric expression."),
            sql("CEILING (123.45)        124\nCEILING (-123.45)       -123\nCEILING (0)             0", "Example"))
    + block(bhead("04", "FLOOR"), para("Returns the largest integer less than, or equal to, the given numeric expression"),
            sql("FLOOR (123.45)          123\nFLOOR (-123.45)         -124\nFLOOR (0)               0", "Example"))
    + block(bhead("05", "ROUND"), para("Returns a numeric expression, rounded to the specified length or precision"),
            sql("ROUND(748.58, -1)          750.00\nROUND(748.58, -2)          700.00\nROUND(748.58, -3)          1000.00\nROUND(123.4545, 2)         123.4500\nROUND(123.45, -2)          100.00", "Example"),
            sql("SELECT ROUND(45.923,2) ‘ROUND(45.923,2)’ ,\n       ROUND (45.923,0) ‘ROUND(45.923,0)’,\n       ROUND (45.923,-1) ‘ROUND(45.923,-1)’"),
            result(["ROUND(45.923,2)", "ROUND(45.923,0)", "ROUND(45.923,-1)"], [["45.92", "46", "50"]]),
            lab("round", "ROUND, CEILING and FLOOR"))
)

S15 = (
    bullets(["datename", "datepart", "dateadd", "datediff"], "Sometimes we only want a portion of a date or we want to do date arithmetic.  To do this, we need the following functions:")
    + V["time"]
    + block(bhead("01", "GETDATE"),
            para("Returns the current system date and time in the Microsoft® SQL Server™ standard internal format for datetime values."),
            sql("GETDATE()", "Syntax"), sql("SELECT GETDATE()"))
    + block(bhead("02", "DATEADD"),
            para("Returns a new datetime value based on adding an interval to the specified date."),
            sql("DATEADD (datepart,number,date)", "Syntax"),
            optable(["Datepart", "Abbreviation", "Datepart", "Abbreviation"],
                    [["Year", "<b>yy, yyyy</b>", "Day", "<b>dd, d</b>"], ["quarter", "<b>qq, q</b>", "Week", "<b>wk, ww</b>"], ["Month", "<b>mm, m</b>", "Hour", "<b>hh</b>"], ["", "", "Minute", "<b>mi, n</b>"]], mono_first=False),
            sql("SELECT Hiredate, DATEADD(dd,3,Hiredate) AddDays,\n       DATEADD(mm,2,Hiredate)AddMonth,\n       DATEADD(yy,1,Hiredate) AddYear\nFROM Employees"),
            result(["Hiredate", "AddDays", "AddMonth", "AddYear"], [["1992-05-01", "1992-05-04", "1992-07-01", "1993-05-01"], ["1992-08-14", "1992-08-17", "1992-10-14", "1993-08-14"],
                                                                     ["1992-04-01", "1992-04-04", "1992-06-01", "1993-04-01"], ["1993-05-03", "1993-05-06", "1993-07-03", "1994-05-03"], "…"], "(9 row(s) affected)"))
    + block(bhead("03", "DATEDIFF"),
            para("Returns the number of date and time boundaries crossed between two specified dates"),
            sql("DATEADD (datepart,startdate,enddate)", "Syntax"),
            sql("SELECT Hiredate,\n  DATEDIFF(dd,Hiredate,GETDATE()) DiffDays,\n  DATEDIFF(mm,Hiredate,GETDATE())DiffMonth,\n  DATEDIFF(yy,HIREDATE,GETDATE()) DiffYear\nFROM Employees"),
            result(["Hiredate", "DiffDays", "DiffMonth", "DiffYear"], [["1992-05-01", "10341", "339", "28"], ["1992-08-14", "10236", "336", "28"], ["1992-04-01", "10371", "340", "28"], ["1993-05-03", "9974", "327", "27"], "…"], "(9 row(s) affected)"))
    + V["dparts"]
    + block(bhead("04", "DATENAME"),
            para("Returns a character string representing the specified datepart of the specified date."),
            sql("DATENAME (datepart,date)", "Syntax"), sql("SELECT DATENAME(MM, GETDATE())"),
            para("In the example, the datepart used was MM, thus this will return the current month"))
    + block(bhead("05", "DATEPART"),
            para("Returns an integer representing the specified datepart of the specified date"),
            sql("DATEPART (datepart,date)", "Syntax"),
            sql("SELECT DATEPART (mm, GETDATE()) AS 'Month',\n       DATEPART (dd, GETDATE()) AS 'Day',\n       DATEPART (yyyy, GETDATE()) AS 'Year'"),
            para("In the example, the integer representing the current month, day and year will be returned"),
            note("<strong>NOTE:</strong> You can also use a straight forward function for the datepart such as " + c("MONTH") + ", " + c("YEAR") + " and " + c("DAY") + " functions"))
)

S16 = (
    lede("Sometimes we need to convert data between different SQL data types. In addition to working with data, there are some built-in functions can be used to convert the data")
    + para(c("CAST") + " and " + c("CONVERT") + " are used to explicitly convert data to other data type.")
    + block(bhead("01", "CAST"),
            para("Converts a value (of any type) into a specified datatype."),
            sql("CAST (expr AS datatype)", "Syntax"),
            syn([("expr", "Required. The value to convert"), ("datatype", "Is the target system-supplied data type")]),
            sql("SELECT birthdate,\n       CAST(birthdate AS VARCHAR(11))\nFROM Employees"),
            result(["birthdate", "(No column name)"], [["1948-12-08", "Dec  8 1948"], ["1952-02-19", "Feb 19 1952"], ["1963-08-30", "Aug 30 1963"], "…"], "(9 row(s) affected)"),
            h4("What is Wrong with this Statement?"),
            V["cast"],
            sql("SELECT ProductName +' unit price is '\n      + UnitPrice AS 'Products Price'\nFROM Products"),
            result(["Error Message"], [["Cannot convert a char value to money"]], label="Error"),
            para("We’ve discussed that (+) operator is used to concatenate strings.  Notice that datatype of ProductName is varchar while the Unit price is money.  Thus, SQL does not allow to concatenate non string datatype.  To solve the error, we should convert the Unit Price data type to varchar."),
            sql("SELECT ProductName +' unit price is '\n      + CAST(UnitPrice AS VARCHAR(20)) AS 'Products Price'\nFROM Products"),
            result(["Products Price"], [["Chai unit price is 18.00"], ["Chang unit price is 19.00"], ["Aniseed Syrup unit price is 10.00"], "…"], "(77 row(s) affected)"))
    + block(bhead("02", "CONVERT"),
            para("Converts a value (of any type) into a specified datatype."),
            sql("CONVERT (datatype[length],expr[,style])", "Syntax"),
            V["convert"],
            syn([("datatype", "Is the target system-supplied data type"), ("length", "Optional. The length of the resulting data type (for char, varchar, nchar, nvarchar, binary and varbinary)"),
                 ("expr", "Required. The value to convert"), ("style", "Is the style of date format used to convert datetime or smalldatetime data to character data")]),
            sql("SELECT CONVERT(varchar(20), birthdate,1)'mm/dd/yy',\n       CONVERT(varchar(20), birthdate,3) 'dd/mm/yy',\n       CONVERT(varchar(20), birthdate,6) 'dd mmm yy',\n       CONVERT(varchar(11), birthdate,9) 'mmm dd yyyy'\nFROM   Employees"),
            result(["mm/dd/yy", "dd/mm/yy", "dd mmm yy", "mmm dd yyyy"], [["12/08/48", "08/12/48", "08 Dec 48", "Dec  8 1948"], ["02/19/52", "19/02/52", "19 Feb 52", "Feb 19 1952"], ["08/30/63", "30/08/63", "30 Aug 63", "Aug 30 1963"], "…"], "(9 row(s) affected)"))
)

CH = [
    dict(id="l4", num="I", nav="Basic SQL", title="Basic SQL on Single Tables", sub="Lesson 4", accent="#2457c5",
         hero="agri", pos="50% 45%", s0=1.4, s1=1.0,
         lessons=[("s1", "Capabilities of SQL SELECT Statements", "Introduction · Learning Outcomes", S1, "carddiv"),
                  ("s2", "Basic SELECT Statement", "", S2, "puncher"),
                  ("s3", "Arithmetic Expressions", "", S3, "burroughs"),
                  ("s4", "Column Aliases", "Concatenation Operator · Literal Character Strings", S4, "ssacard"),
                  ("s5", "Duplicate Rows", "Eliminating Duplicate Rows · Guide Questions", S5, "hcard")]),
    dict(id="l5", num="II", nav="Restricting &amp; Sorting", title="Restricting and Sorting Data", sub="Lesson 5", accent="#b4501c",
         hero="cardstore", pos="50% 50%", s0=1.4, s1=1.0,
         lessons=[("s6", "Limiting Rows Using a Selection", "Introduction · Learning Outcomes", S6, "sorter"),
                  ("s7", "Comparison Operators", "", S7, "ssa"),
                  ("s8", "Other Comparison Operators", "BETWEEN · IN · LIKE · IS NULL", S8, "tabcensus"),
                  ("s9", "Logical Operators", "AND · OR · NOT · Rules of Precedence", S9, "carddiv2"),
                  ("s10", "The ORDER BY Clause", "Unit 2 · Guide Questions", S10, "reading")]),
    dict(id="l6", num="III", nav="SQL Functions", title="SQL Functions", sub="Lesson 6", accent="#1f7a5a",
         hero="univac1105", pos="60% 40%", s0=1.4, s1=1.0,
         lessons=[("s11", "What Is a Function?", "Introduction · Types of Functions", S11, "univac1"),
                  ("s12", "Single-Row Functions", "Case Conversion Functions", S12, "eniac"),
                  ("s13", "Character Manipulation Functions", "LEN · LEFT · RIGHT · LTRIM · RTRIM · REPLACE · REPLICATE · SUBSTRING · CHARINDEX", S13, "eniactube"),
                  ("s14", "Numeric Functions", "ABS · POWER · CEILING · FLOOR · ROUND", S14, "ames"),
                  ("s15", "Date Functions", "GETDATE · DATEADD · DATEDIFF · DATENAME · DATEPART", S15, "univac1108"),
                  ("s16", "Conversion Functions", "CAST · CONVERT", S16, "ibm2030")]),
]

if __name__ == "__main__":
    build(META, CH)
