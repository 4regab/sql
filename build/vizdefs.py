"""vizdefs.py: data + states for every animated visualisation. Step text is verbatim handout wording;
sample rows are the handout's own Northwind Employees / Products examples."""
from components import viz

EMP = [
    dict(id="e1", EmployeeID="1", LastName="Davolio", FirstName="Nancy", Title="Sales Representative", City="Seattle", HireDate="1992-05-01", ReportsTo="2"),
    dict(id="e2", EmployeeID="2", LastName="Fuller", FirstName="Andrew", Title="Vice President, Sales", City="Tacoma", HireDate="1992-08-14", ReportsTo="NULL"),
    dict(id="e3", EmployeeID="3", LastName="Leverling", FirstName="Janet", Title="Sales Representative", City="Kirkland", HireDate="1992-04-01", ReportsTo="2"),
    dict(id="e4", EmployeeID="4", LastName="Peacock", FirstName="Margaret", Title="Sales Representative", City="Redmond", HireDate="1993-05-03", ReportsTo="2"),
    dict(id="e5", EmployeeID="5", LastName="Buchanan", FirstName="Steven", Title="Sales Manager", City="London", HireDate="1993-10-17", ReportsTo="2"),
    dict(id="e6", EmployeeID="6", LastName="Suyama", FirstName="Michael", Title="Sales Representative", City="London", HireDate="1993-10-17", ReportsTo="5"),
    dict(id="e7", EmployeeID="7", LastName="King", FirstName="Robert", Title="Sales Representative", City="London", HireDate="1994-01-02", ReportsTo="5"),
    dict(id="e8", EmployeeID="8", LastName="Callahan", FirstName="Laura", Title="Inside Sales Coordinator", City="Seattle", HireDate="1994-03-05", ReportsTo="2"),
    dict(id="e9", EmployeeID="9", LastName="Dodsworth", FirstName="Anne", Title="Sales Representative", City="London", HireDate="1994-11-15", ReportsTo="5"),
]
IDS = [e["id"] for e in EMP]
def emp(*keys, only=None):
    return [{k: e[k] for k in ("id",) + keys} for e in EMP if only is None or e["id"] in only]
def col(k, label=None, w=1.0, num=False):
    return dict(k=k, label=label or k, w=w, num=num)
def marks(pred):
    return {e["id"]: ("ok" if pred(e) else "no") for e in EMP}
def fails(pred):
    return [e["id"] for e in EMP if not pred(e)]
def c(x): return f"<code>{x}</code>"

V = {}

# ---- L4 S1: selection / projection / join
V["caps"] = viz("blocks", [dict(mode="sel"), dict(mode="proj"), dict(mode="join")], [
    ("Selection", None, "You can use the selection capability in SQL to choose the rows in a table that you want returned by a query. You can use various criteria to selectively restrict the rows that you see."),
    ("Projection", None, "You can use the projection capability in SQL to choose the columns in a table that you want returned by your query. You can choose as few or as many columns of the table as you require."),
    ("Join", None, "You can use the join capability in SQL to bring together data that is stored in different tables by creating a link through a column that both the tables share. You will learn more about joins in a later lesson.")],
    caption="Table 1 · Table 2")

# ---- L4 S2: anatomy of SELECT
ALL6 = ["EmployeeID", "LastName", "FirstName", "Title", "City", "HireDate"]
V["anatomy"] = viz("table", [
    dict(cols=ALL6, dim=IDS),
    dict(cols=ALL6, hlc=ALL6),
    dict(cols=["EmployeeID", "LastName", "FirstName", "Title"], hlc=["EmployeeID", "LastName", "FirstName", "Title"]),
    dict(cols=["Title", "LastName"], hlc=["Title", "LastName"])], [
    ("FROM", "FROM Employees", "A " + c("FROM") + " clause, which specifies the table containing the columns listed in the <em>SELECT</em> clause."),
    ("SELECT *", "SELECT *\nFROM Employees", "You can display all columns of data in a table by following the <em>SELECT</em> keyword with an asterisk (*)."),
    ("Selecting Specific Columns", "SELECT EmployeeID, LastName,\n       FirstName,Title\nFROM Employees", "You can use the <em>SELECT</em> statement to display specific columns of the table by specifying the column names, separated by commas."),
    ("Column order", "SELECT Title, LastName\nFROM Employees", "In the " + c("SELECT") + " clause, specifiy the columns that you want to see, in the order in which you want them to appear in the output.")],
    cols=[col("EmployeeID", w=.9, num=True), col("LastName", w=1.25), col("FirstName", w=1.15), col("Title", w=2.2), col("City", w=1.1), col("HireDate", w=1.3)],
    rows=emp(*ALL6))

# ---- L4 S3: arithmetic + null
PRODS = [dict(id="p1", ProductID="1", ProductName="Chai", UnitPrice="18.00", calc="28.00"),
         dict(id="p2", ProductID="2", ProductName="Chang", UnitPrice="19.00", calc="29.00"),
         dict(id="p3", ProductID="3", ProductName="Aniseed Syrup", UnitPrice="10.00", calc="20.00"),
         dict(id="p4", ProductID="4", ProductName="Chef Anton's Cajun", UnitPrice="22.00", calc="32.00"),
         dict(id="p5", ProductID="5", ProductName="Chef Anton's Gumbo", UnitPrice="21.35", calc="31.35"),
         dict(id="p6", ProductID="6", ProductName="Grandma's Boysenberry", UnitPrice="NULL", calc="NULL")]
V["arith"] = viz("table", [
    dict(cols=["ProductID", "ProductName", "UnitPrice"]),
    dict(cols=["ProductID", "ProductName", "UnitPrice", "calc"], hlc=["calc"], stag="calc"),
    dict(cols=["ProductID", "ProductName", "UnitPrice", "calc"], hl=["p6"], bad=["p6|UnitPrice", "p6|calc"]),
    dict(cols=["ProductName", "UnitPrice", "calc"], head={"calc": "NewPrice"}, hlc=["calc"])], [
    ("Column values", "SELECT ProductID, ProductName,\n       Unitprice\nFROM Products", "An arithmetic expression may contain column names, constant numeric values, and the arithmetic operators."),
    ("UnitPrice +10", "SELECT ProductID, ProductName,\n       Unitprice , UnitPrice +10\nFROM Products", "The example uses the addition operator to calculate unit price increase of 10 for all products. The column which is the result of " + c("UnitPrice +10") + " is not a new column in the " + c("Products") + " table."),
    ("Null Values in Arithmetic Expressions", "SELECT ProductID, ProductName,\n       Unitprice , UnitPrice +10\nFROM Products", "Arithmetic expressions containing a null value evaluate to null."),
    ("Column Aliases", "SELECT ProductName,\n       Unitprice , UnitPrice +10 AS NewPrice\nFROM Products", "Is useful with calculations")],
    cols=[col("ProductID", w=.9, num=True), col("ProductName", w=2.3), col("UnitPrice", "Unitprice", w=1.1, num=True), col("calc", "(No column name)", w=1.5, num=True)],
    rows=PRODS)

# ---- L4 S4: aliases + concatenation
V["alias"] = viz("table", [
    dict(cols=["employeeid", "firstname", "lastname"]),
    dict(cols=["employeeid", "firstname", "lastname"], head={"employeeid": "Emp No.", "firstname": "fname", "lastname": "Last Name"}, hlc=["employeeid", "firstname", "lastname"])], [
    ("Original headings", "SELECT employeeid, firstname, lastname\nFROM   Employees", "Specify the alias after the column in the SELECT list using a space as a separator."),
    ("Aliases applied", "SELECT employeeid AS ‘Emp No.’,\n        fname = firstname,\n        lastname [Last Name]\nFROM   Employees", "Since the alias contains special characters such as space and period, the alias should be enclosed with single quote or square bracket.")],
    cols=[col("employeeid", w=1, num=True), col("firstname", w=1.3), col("lastname", w=1.5)],
    rows=[{"id": e["id"], "employeeid": e["EmployeeID"], "firstname": e["FirstName"], "lastname": e["LastName"]} for e in EMP[:3]])

R3 = EMP[:3]
J1 = [[dict(t=e["LastName"], ty="LastName"), dict(t=e["Title"], ty="Title")] for e in R3]
J2 = [[dict(t=e["FirstName"], ty="firstName"), dict(t="  ", ty="literal", lit=True), dict(t=e["LastName"], ty="lastName"),
       dict(t=" is a ", ty="literal", lit=True), dict(t=e["Title"], ty="Title")] for e in R3]
V["concat"] = viz("chips", [
    dict(rows=J1, head="LastName+Title"), dict(rows=J1, head="EmployeeJob", merge=True),
    dict(rows=J2, head="firstName+'  '+lastName+' is a '+Title"), dict(rows=J2, head="EmpDetail", merge=True)], [
    ("Concatenation Operator", "SELECT LastName+Title AS EmployeeJob\nFROM   Employees", "You can link columns to other columns, arithmetic expressions, or constant values to create a character expression by using the concatenation operator ( + )"),
    ("A single output column", "SELECT LastName+Title AS EmployeeJob\nFROM   Employees", "Columns on either side of the operator are combined to make a single output column."),
    ("Literal Character Strings", "SELECT firstName+'  '+lastName+' is a '+Title\n      AS EmpDetail\nFROM   Employees", "A literal is a character, expression, or number included in the SELECT list. Date and character literal values must be enclosed within single quotation marks."),
    ("EmpDetail", "SELECT firstName+'  '+lastName+' is a '+Title\n      AS EmpDetail\nFROM   Employees", "Each character string is output once for each row returned")])

# ---- L4 S5: DISTINCT
REP = [e["id"] for e in EMP if e["Title"] == "Sales Representative"]
MERGE = {i: "e1" for i in REP if i != "e1"}
V["distinct"] = viz("table", [
    dict(cols=["Title"]),
    dict(cols=["Title"], hl=REP),
    dict(cols=["Title"], merge=MERGE, badge={"e1": "×6"}, hl=["e1"]),
    dict(cols=["Title"], merge=MERGE, order=["e8", "e5", "e1", "e2"])], [
    ("Duplicate Rows", "SELECT Title\nFROM   Employees", "The default display of queries is all rows, including duplicate rows."),
    ("Six identical titles", "SELECT Title\nFROM   Employees", "Unless you indicate otherwise, it will displays results of a query without eliminating duplicate rows."),
    ("DISTINCT", "SELECT DISTINCT Title\nFROM   Employees", "Specifies that only unique rows can appear in the result set."),
    ("Four unique titles", "SELECT DISTINCT Title\nFROM   Employees", "In the example, the " + c("Employees") + " table actually contains 9 rows but there are only four unique " + c("Title") + " in the table.")],
    cols=[col("Title", w=1)], rows=emp("Title"))

# ---- L5 S6: WHERE
isRep = lambda e: e["Title"] == "Sales Representative"
isKing = lambda e: e["LastName"] == "King"
V["where"] = viz("table", [
    dict(cols=["EmployeeID", "LastName", "Title"]),
    dict(cols=["EmployeeID", "LastName", "Title"], hlc=["Title"], mark=marks(isRep), scan=True),
    dict(cols=["EmployeeID", "LastName", "Title"], hlc=["Title"], hide=fails(isRep)),
    dict(cols=["EmployeeID", "LastName", "FirstName", "Title"], hlc=["LastName"], mark=marks(isKing), scan=True),
    dict(cols=["EmployeeID", "LastName", "FirstName", "Title"], hlc=["LastName"], hide=fails(isKing))], [
    ("Limiting Rows Selected", "SELECT EmployeeID, LastName,Title\nFROM Employees", "You want to restrict query results to a subset of rows in the table that interest you."),
    ("Test every row", "SELECT EmployeeID, LastName,Title\nFROM Employees\nWHERE Title = ‘Sales Representative’", c("WHERE") + " restricts the query to rows that meet a condition"),
    ("Only matching rows return", "SELECT EmployeeID, LastName,Title\nFROM Employees\nWHERE Title = ‘Sales Representative’", "A " + c("WHERE") + " clause contains a condition that must be met, and it directly follows the " + c("FROM") + " clause."),
    ("Character Strings and Dates", "SELECT EmployeeID, LastName,\n   FirstName, Title\nFROM   Employees\nWHERE LastName = ‘King’", "Character strings and dates in the " + c("WHERE") + " clause must be enclosed in single quotation marks (' '). Number constants, however, should not."),
    ("LastName = 'King'", "SELECT EmployeeID, LastName,\n   FirstName, Title\nFROM   Employees\nWHERE LastName = ‘King’", "")],
    cols=[col("EmployeeID", w=.9, num=True), col("LastName", w=1.3), col("FirstName", w=1.2), col("Title", w=2.3)], rows=emp("EmployeeID", "LastName", "FirstName", "Title"))

# ---- L5 S7/S8: number line for comparisons and BETWEEN
PTS = [dict(label="Aniseed Syrup", v=10), dict(label="Chai", v=18), dict(label="Chang", v=19), dict(label="Gumbo", v=21.35),
       dict(label="Cajun", v=22), dict(label="Manjimup", v=53), dict(label="Raclette", v=55), dict(label="Carnarvon", v=62.5),
       dict(label="Sir Rodney's", v=81), dict(label="Mishi Kobe Niku", v=97)]
V["gt"] = viz("line", [dict(min=0, max=110, tick=10), dict(min=0, max=110, tick=10, gt=15, band="UnitPrice > 15")], [
    ("Comparison Operators", "SELECT ProductName, UnitPrice\nFROM   Products", "Comparison operators are used in conditions that compare one expression to another."),
    ("Greater than", "SELECT ProductName, UnitPrice\nFROM   Products\nWHERE UnitPrice > 15", c("SELECT") + " statement retrieves the " + c("ProductName") + " and " + c("UnitPrice") + " of all Products that Unit price is greater than 15")],
    caption="UnitPrice", points=PTS)
V["between"] = viz("line", [dict(min=0, max=110, tick=10), dict(min=0, max=110, tick=10, between=[50, 100], band="BETWEEN 50 AND 100")], [
    ("A lower range and an upper range", "SELECT ProductName, UnitPrice\nFROM   Products", "You can display rows based on a range of values using the " + c("BETWEEN") + " operator. The range that you specify contains a lower range and an upper range."),
    ("Inclusive", "SELECT ProductName, UnitPrice\nFROM   Products\nWHERE UnitPrice BETWEEN 50 AND 100", "Values specified with the " + c("BETWEEN") + " operator are inclusive. You must specify the lower limit first.")],
    caption="UnitPrice", points=PTS)

inCity = lambda e: e["City"] in ("Tacoma", "Kirkland", "Redmond")
isNull = lambda e: e["ReportsTo"] == "NULL"
C4 = ["LastName", "FirstName", "City", "ReportsTo"]
V["innull"] = viz("table", [
    dict(cols=["LastName", "FirstName", "City"], hlc=["City"], mark=marks(inCity), scan=True),
    dict(cols=["LastName", "FirstName", "City"], hlc=["City"], hide=fails(inCity)),
    dict(cols=["LastName", "ReportsTo"], hlc=["ReportsTo"], mark=marks(isNull), scan=True, bad=["e2|ReportsTo"]),
    dict(cols=["LastName", "ReportsTo"], hlc=["ReportsTo"], hide=fails(isNull), bad=["e2|ReportsTo"])], [
    ("Using the IN Operator", "SELECT LastName, FirstName, City\nFROM   Employees\nWHERE City IN ('Tacoma', 'Kirkland', 'Redmond')", "Use the " + c("IN") + " operator to test for values in a list."),
    ("Tacoma, Kirkland or Redmond", "SELECT LastName, FirstName, City\nFROM   Employees\nWHERE City IN ('Tacoma', 'Kirkland', 'Redmond')", "The " + c("IN") + " operator can be used with any datatype."),
    ("The IS NULL Operator", "SELECT LastName, ReportsTo\nFROM   Employees\nWHERE ReportsTo IS NULL", "The " + c("IS  NULL") + " operator tests for values that are null."),
    ("Not with =", "SELECT LastName, ReportsTo\nFROM   Employees\nWHERE ReportsTo IS NULL", "Therefore, you cannot test with (=) because a null value cannot be equal or unequal to any value.")],
    cols=[col("LastName", w=1.3), col("FirstName", w=1.2), col("City", w=1.2), col("ReportsTo", w=1.1, num=True)], rows=emp(*C4))

V["like"] = viz("like", [dict(p="D%"), dict(p="%g"), dict(p="%ha%"), dict(p="_E%")], [
    ("LIKE 'D%'", "SELECT LastName\nFROM   Employees\nWHERE LastName LIKE 'D%'", "% denotes zero or many characters."),
    ("LIKE '%g'", "SELECT LastName\nFROM   Employees\nWHERE LastName LIKE '%g'", "The " + c("SELECT") + " statement above returns the employee last name from the " + c("Employees") + "  table for any employee whose last name ends with an \"g”."),
    ("LIKE '%ha%'", "SELECT LastName\nFROM   Employees\nWHERE LastName LIKE '%ha%'", "The " + c("SELECT") + " statement above returns the employee last name from the " + c("Employees") + "  table for any employee whose last name contains the word \"ha”."),
    ("LIKE '_E%'", "SELECT LastName\nFROM   Employees\nWHERE LastName LIKE '_E%'", "_ denotes one character")],
    names=[e["LastName"] for e in EMP])

# ---- L5 S9: logical operators
PEOPLE = [dict(n=e["LastName"], a=e["Title"] == "Sales Representative", b=e["City"] == "London") for e in EMP]
V["venn"] = viz("venn", [dict(sel=None), dict(sel="and"), dict(sel="or"), dict(sel="not")], [
    ("Two component conditions", "SELECT LastName, Title, City\nFROM   Employees", "A logical operator combines the result of two component conditions to produce a single result based on them or to invert the result of a single condition."),
    ("Using the AND Operator", "SELECT LastName, Title, City\nFROM   Employees\nWHERE Title = 'Sales Representative'\n   AND  City = 'London'", c("AND") + " requires both conditions to be TRUE."),
    ("Using the OR Operator", "SELECT LastName, Title, City\nFROM   Employees\nWHERE Title = 'Sales Representative'\n   OR  City = 'London'", c("OR") + " requires either condition to be TRUE"),
    ("Using the NOT Operator", "SELECT LastName, Title\nFROM   Employees\nWHERE NOT Title = 'Sales Representative'", "The " + c("NOT") + " operator displays a record if the condition(s) is NOT TRUE.")],
    la="Title = 'Sales Representative'", lb="City = 'London'", people=PEOPLE)

TOK = [dict(t="(", k="p"), dict(t="Title = 'Sales Representative'", k="c"), dict(t="OR", k="op"), dict(t="Title = 'Sales Manager'", k="c"),
       dict(t=")", k="p"), dict(t="AND", k="op"), dict(t="City = 'London'", k="c")]
REPS = [e["LastName"] for e in EMP if e["Title"] == "Sales Representative"]
V["prec"] = viz("prec", [
    dict(paren=False, groups=[]),
    dict(paren=False, groups=[[3, 6, "1"], [1, 6, "2"]], pass_=None),
    dict(paren=True, groups=[[0, 4, "1"], [0, 6, "2"]])], [
    ("Rules of Precedence", "SELECT LastName, Title, City\nFROM   Employees\nWHERE Title = 'Sales Representative'\n      OR Title = 'Sales Manager'\n      AND  City = 'London'", "Override rules of precedence by using parentheses."),
    ("AND before OR", "SELECT LastName, Title, City\nFROM   Employees\nWHERE Title = 'Sales Representative'\n      OR Title = 'Sales Manager'\n      AND  City = 'London'", "\"Select the row if an employee is a Sales Manager and city is London or if the employee is a Sales Representative \""),
    ("Using Parentheses", "SELECT LastName, Title, City\nFROM   Employees\nWHERE (Title = 'Sales Representative'\n      OR Title = 'Sales Manager')\n      AND  City = 'London'", "\"Select the row if an employee is a Sales Manager or Sales Representative  and city is London\"")],
    tokens=TOK, people=[e["LastName"] for e in EMP])
# pass lists (computed with real SQL logic)
import json as _j
_p1 = sorted(set(REPS) | {e["LastName"] for e in EMP if e["Title"] == "Sales Manager" and e["City"] == "London"}, key=[e["LastName"] for e in EMP].index)
_p2 = [e["LastName"] for e in EMP if e["Title"] in ("Sales Representative", "Sales Manager") and e["City"] == "London"]
V["prec"] = V["prec"].replace('"pass_": null', '"pass": ' + _j.dumps(_p1)).replace('"groups": [[0, 4, "1"], [0, 6, "2"]]', '"groups": [[0, 4, "1"], [0, 6, "2"]], "pass": ' + _j.dumps(_p2))

# ---- L5 S10: ORDER BY
O_ASC = ["e3", "e1", "e2", "e4", "e5", "e6", "e7", "e8", "e9"]
O_DESC = ["e9", "e8", "e7", "e5", "e6", "e4", "e2", "e1", "e3"]
O_JOB = ["e8", "e5", "e6", "e7", "e1", "e3", "e4", "e9", "e2"]
O_FN = ["e2", "e9", "e3", "e8", "e4", "e6", "e1", "e7", "e5"]
C3 = ["LastName", "FirstName", "HireDate"]; C3b = ["LastName", "FirstName", "Title"]
V["order"] = viz("table", [
    dict(cols=C3), dict(cols=C3, order=O_ASC, hlc=["HireDate"]), dict(cols=C3, order=O_DESC, hlc=["HireDate"]),
    dict(cols=C3b, order=O_JOB, head={"Title": "Job"}, hlc=["Title"]), dict(cols=C3b, order=O_FN, hlc=["FirstName", "Title"])], [
    ("Undefined order", "SELECT LastName, FirstName, HireDate\nFROM   Employees", "The order of rows returned in a query result is undefined."),
    ("ORDER BY HireDate", "SELECT LastName, FirstName, HireDate\nFROM   Employees\nORDER BY HireDate", c("ASC") + " orders the rows in ascending order (this is the default order)"),
    ("Sorting in Descending Order", "SELECT LastName, FirstName, HireDate\nFROM   Employees\nORDER BY HireDate DESC", c("DESC") + " orders the rows in descending order"),
    ("Sorting by Column Aliases", "SELECT LastName, FirstName, Title AS Job\nFROM   Employees\nORDER BY Job", "You can use a column alias in the " + c("ORDER  BY") + " clause."),
    ("Sorting by Multiple Columns", "SELECT LastName, FirstName, Title\nFROM   Employees\nORDER BY FirstName, Title DESC", "You can sort query results by more than one column.")],
    cols=[col("LastName", w=1.3), col("FirstName", w=1.2), col("Title", w=2.2), col("HireDate", w=1.3)], rows=emp("LastName", "FirstName", "Title", "HireDate"))

# ---- L6 S11: single-row vs multiple-row
V["flow"] = viz("flow", [dict(mode="single", fn="UPPER"), dict(mode="multi", fn="Function", out="Result value")], [
    ("Single-row functions", "SELECT UPPER (LastName) LName\nFROM   Employees", "Single row functions can be used to execute an operation on each row of a query. In other words, a single row function can be used to execute the same operation for every row a query retrieves."),
    ("Multiple-row functions", None, "These functions manipulate groups of rows to give one result per group of rows.")],
    ins=["Fuller", "Dodsworth", "Leverling", "Callahan"], outs=["FULLER", "DODSWORTH", "LEVERLING", "CALLAHAN"])

# ---- L6 S12: case conversion
R4 = ["e2", "e9", "e3", "e8"]
V["case"] = viz("table", [
    dict(cols=["LastName", "FirstName"]),
    dict(cols=["LastName", "FirstName"], hlc=["LastName"], head={"LastName": "LName"}, stag="LastName", txt={f"{i}|LastName": e["LastName"].upper() for e in EMP for i in [e["id"]] if i in R4}),
    dict(cols=["LastName", "FirstName"], hlc=["FirstName"], head={"LastName": "LName", "FirstName": "FName"}, stag="FirstName",
         txt={**{f"{e['id']}|LastName": e["LastName"].upper() for e in EMP if e["id"] in R4}, **{f"{e['id']}|FirstName": e["FirstName"].lower() for e in EMP if e["id"] in R4}})], [
    ("Case Conversion Functions", "SELECT LastName, FirstName\nFROM   Employees", "Convert case for character strings"),
    ("UPPER", "SELECT UPPER (LastName) LName,\n       FirstName\nFROM   Employees", "Converts a string to upper-case"),
    ("LOWER", "SELECT UPPER (LastName) LName,\n       LOWER (FirstName) FName\nFROM   Employees", "Converts a string to lower-case")],
    cols=[col("LastName", w=1.4), col("FirstName", w=1.4)], rows=[r for r in emp("LastName", "FirstName") if r["id"] in R4])

# ---- L6 S13: character manipulation
V["str"] = viz("str", [
    dict(fn="LEN (Title)", s="Sales Manager", mode="len", out="13"),
    dict(fn="LEFT (Title,4)", s="Inside Sales Coordinator", mode="pick", pick=[0, 4], out="Insi"),
    dict(fn="RIGHT (Title,4)", s="Sales Manager", mode="pick", pick=[9, 4], out="ager"),
    dict(fn="LTRIM (‘     abcde’)", s="     abcde", mode="trim", drop=[0, 1, 2, 3, 4], out="abcde"),
    dict(fn="RTRIM (‘abcde   ’)", s="abcde   ", mode="trim", drop=[5, 6, 7], out="abcde"),
    dict(fn="REPLACE", s="abcdefghicde", mode="replace", find="cde", rep="xxx", out="abxxxfghixxx"),
    dict(fn="REPLICATE (FirstName,2)", s="Nancy", mode="rep", out="NancyNancy"),
    dict(fn="SUBSTRING (FirstName,2,5)", s="Margaret", mode="pick", pick=[1, 5], out="argar"),
    dict(fn="CHARINDEX (‘ale’,title)", s="Sales Manager", mode="find", find="ale", out="2")], [
    ("LEN", "SELECT DISTINCT Title,\n       LEN (Title) Length\nFROM   Employees", "Returns the number of characters of the specified string expression"),
    ("LEFT", "SELECT Title,\n       LEFT (Title,4)\nFROM   Employees", "Returns the part of a character string starting at a specified number of characters from the left"),
    ("RIGHT", "SELECT Title,\n       RIGHT (Title,4)\nFROM   Employees", "Returns the part of a character string starting at a specified number of characters from the right"),
    ("LTRIM", "SELECT LTRIM (‘     abcde’)", "Returns a character expression after removing leading blanks"),
    ("RTRIM", "SELECT RTRIM (‘abcde   ’)", "Returns a character expression after removing trailing blanks"),
    ("REPLACE", "SELECT REPLACE (‘abcdefghicde’)", "Replaces all occurrences of the second given string expression in the first string expression with a third expression."),
    ("REPLICATE", "SELECT REPLICATE (FirstName,2)\nFROM   Employees", "Repeats a character expression for a specified number of times"),
    ("SUBSTRING", "SELECT FirstName ,\n       SUBSTRING (FirstName,2,5)\nFROM   Employees", "Returns part of a character, binary, text, or image expression"),
    ("CHARINDEX", "SELECT DISTINCT Title ,\n       CHARINDEX (‘ale’,title)\nFROM   Employees", "Returns the starting position of a string specify")])

# ---- L6 S14: numeric
V["num"] = viz("line", [
    dict(min=-2, max=2, tick=.5, points=False, pairs=[dict(v=-1, label="-1.0", to=[dict(v=1, label="ABS (-1.0)  1.0")])]),
    dict(min=122, max=125, tick=.25, points=False, pairs=[dict(v=123.45, label="123.45", to=[dict(v=124, label="CEILING (123.45)  124")])]),
    dict(min=122, max=125, tick=.25, points=False, pairs=[dict(v=123.45, label="123.45", to=[dict(v=123, label="FLOOR (123.45)  123")])]),
    dict(min=-125, max=-122, tick=.25, points=False, pairs=[dict(v=-123.45, label="-123.45", to=[dict(v=-123, label="CEILING  -123"), dict(v=-124, label="FLOOR  -124")])]),
    dict(min=600, max=1100, tick=50, points=False, pairs=[dict(v=748.58, label="748.58", to=[dict(v=750, label="ROUND(748.58, -1)  750.00"), dict(v=700, label="ROUND(748.58, -2)  700.00"), dict(v=1000, label="ROUND(748.58, -3)  1000.00")])])], [
    ("ABS", "ABS (-1.0)", "Return the absolute value of the number"),
    ("CEILING", "CEILING (123.45)", "Returns the smallest integer greater than, or equal to, the given numeric expression."),
    ("FLOOR", "FLOOR (123.45)", "Returns the largest integer less than, or equal to, the given numeric expression"),
    ("CEILING (-123.45) · FLOOR (-123.45)", "CEILING (-123.45)\nFLOOR (-123.45)", ""),
    ("ROUND", "ROUND(748.58, -1)\nROUND(748.58, -2)\nROUND(748.58, -3)", "Returns a numeric expression, rounded to the specified length or precision")],
    points=[])

# ---- L6 S15: dates
V["time"] = viz("time", [
    dict(frm=None, **{"from": "1992-04-26", "to": "1992-05-08"}, unit="d", base="1992-05-01", add=dict(label="DATEADD(dd,3,Hiredate)", to="1992-05-04")),
    dict(**{"from": "1992-04-10", "to": "1992-08-20"}, unit="m", base="1992-05-01", add=dict(label="DATEADD(mm,2,Hiredate)", to="1992-07-01")),
    dict(**{"from": "1992-03-01", "to": "1993-07-15"}, unit="m", base="1992-05-01", add=dict(label="DATEADD(yy,1,Hiredate)", to="1993-05-01")),
    dict(**{"from": "1991-03-01", "to": "today"}, unit="y", base="1992-05-01", diff=True)], [
    ("DATEADD · dd", "SELECT Hiredate, DATEADD(dd,3,Hiredate) AddDays\nFROM Employees", "Returns a new datetime value based on adding an interval to the specified date."),
    ("DATEADD · mm", "SELECT Hiredate, DATEADD(mm,2,Hiredate)AddMonth\nFROM Employees", ""),
    ("DATEADD · yy", "SELECT Hiredate, DATEADD(yy,1,Hiredate) AddYear\nFROM Employees", ""),
    ("DATEDIFF", "SELECT Hiredate,\n  DATEDIFF(dd,Hiredate,GETDATE()) DiffDays,\n  DATEDIFF(mm,Hiredate,GETDATE())DiffMonth,\n  DATEDIFF(yy,HIREDATE,GETDATE()) DiffYear\nFROM Employees", "Returns the number of date and time boundaries crossed between two specified dates")])
V["dparts"] = viz("dparts", [dict(mode="get"), dict(mode="name"), dict(mode="part")], [
    ("GETDATE", "SELECT GETDATE()", "Returns the current system date and time in the Microsoft® SQL Server™ standard internal format for datetime values."),
    ("DATENAME", "SELECT DATENAME(MM, GETDATE())", "Returns a character string representing the specified datepart of the specified date."),
    ("DATEPART", "SELECT DATEPART (mm, GETDATE()) AS 'Month',\n       DATEPART (dd, GETDATE()) AS 'Day',\n       DATEPART (yyyy, GETDATE()) AS 'Year'", "Returns an integer representing the specified datepart of the specified date")])

# ---- L6 S16: conversion
P3 = [("Chai", "18.00"), ("Chang", "19.00"), ("Aniseed Syrup", "10.00")]
CR = [[dict(t=n, ty="varchar"), dict(t=" unit price is ", ty="varchar", lit=True), dict(t=p, ty="money")] for n, p in P3]
V["cast"] = viz("chips", [
    dict(rows=CR, head="Products Price"),
    dict(rows=CR, head="Products Price", err=dict(i=2, msg="Cannot convert a char value to money")),
    dict(rows=CR, head="Products Price", morph=dict(i=2, ty="varchar(20)")),
    dict(rows=CR, head="Products Price", morph=dict(i=2, ty="varchar(20)"), merge=True)], [
    ("varchar + money", "SELECT ProductName +' unit price is '\n      + UnitPrice AS 'Products Price'\nFROM Products", "We’ve discussed that (+) operator is used to concatenate strings.  Notice that datatype of ProductName is varchar while the Unit price is money."),
    ("Error Message", "SELECT ProductName +' unit price is '\n      + UnitPrice AS 'Products Price'\nFROM Products", "Thus, SQL does not allow to concatenate non string datatype."),
    ("CAST", "SELECT ProductName +' unit price is '\n      + CAST(UnitPrice AS VARCHAR(20)) AS 'Products Price'\nFROM Products", "To solve the error, we should convert the Unit Price data type to varchar."),
    ("Products Price", "SELECT ProductName +' unit price is '\n      + CAST(UnitPrice AS VARCHAR(20)) AS 'Products Price'\nFROM Products", "Converts a value (of any type) into a specified datatype.")])

BD = [("e1", "1948-12-08", ["12/08/48", "08/12/48", "08 Dec 48", "Dec  8 1948"]), ("e2", "1952-02-19", ["02/19/52", "19/02/52", "19 Feb 52", "Feb 19 1952"]),
      ("e3", "1963-08-30", ["08/30/63", "30/08/63", "30 Aug 63", "Aug 30 1963"])]
STY = [("1", "mm/dd/yy", 20), ("3", "dd/mm/yy", 20), ("6", "dd mmm yy", 20), ("9", "mmm dd yyyy", 11)]
V["convert"] = viz("table",
    [dict(cols=["birthdate"])] + [dict(cols=["birthdate", "out"], head={"out": lab}, hlc=["out"], stag="out", txt={f"{i}|out": v[k] for i, _, v in BD}) for k, (_, lab, _) in enumerate(STY)],
    [("CONVERT", "SELECT birthdate\nFROM   Employees", "Is the style of date format used to convert datetime or smalldatetime data to character data")] +
    [(f"Style {s} · {lab}", f"SELECT birthdate,\n       CONVERT(varchar({n}), birthdate,{s}) '{lab}'\nFROM   Employees", "") for s, lab, n in STY],
    cols=[col("birthdate", w=1.2), col("out", "(No column name)", w=1.4)], rows=[{"id": i, "birthdate": b, "out": ""} for i, b, _ in BD])
