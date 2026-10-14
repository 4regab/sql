/* content.js: the five lessons. Source: PUP "Database Administration" handout, Lessons 2 to 6.
   Text style: **bold** and `code` only. Block types: h, p, list, note, code, table, html, demo, lab, try, tables. */

const T = (a, b) => ['table', a, { rows: b }];
const IMG = (src, alt, w, h, cap) => ['html', `<figure class="pic"><img src="img/${src}" alt="${alt}" width="${w}" height="${h}" loading="lazy"><figcaption>${cap}</figcaption></figure>`];
const RO = ['note', 'The practice database on this site is read-only. Statements that create or change things are shown here to read and copy into SQL Server. They do not run on this page.', { label: 'Read, don’t run' }];

/* ====================================================================== LESSON 2 */
const L2 = {
  id: 'l2', n: 2, title: 'Introduction to SQL',
  blurb: 'What SQL is, how to create and manage a database, SQL Server data types, keys, and creating and changing tables.',
  outcomes: ['Concisely define each of the following key terms: relational DBMS (RDBMS), database, field, record, table, data definition language (DDL), data manipulation language (DML), data control language (DCL)', 'Define a database and tables using the SQL data definition language', 'Identify the different data types in SQL'],
  sections: [
    {
      id: 'l2s1', title: 'Structured Query Language',
      sub: 'Pronounced “S-Q-L” by some and “sequel” by others, SQL has become the de facto standard language for creating and querying relational databases. (Can the next standard be the sequel to SQL?) The primary purpose of this lesson is to introduce SQL, the most common language for relational systems.',
      blocks: [
        ['p', '**Structured Query Language (SQL)** is an industry-standard programming language used to insert, retrieve, modify, and delete data in a relational database. It also contains statements for defining and administering the objects in a database. SQL enables a programmer or database administrator to do the following:'],
        ['list', ['execute queries against a database', 'retrieve data from a database', 'insert records in a database', 'update records in a database', 'delete records from a database', 'create new databases', 'create new tables in a database', 'create stored procedures in a database', 'create views in a database', 'set permissions on tables, procedures, and views']],
        ['h', 'A brief history of SQL'],
        T(['Year', 'Event'], [['1970', 'E. Codd develops relational database concept'], ['1974–1979', 'System R with Sequel (later SQL) created at IBM Research Lab'], ['1979', 'Oracle markets first relational DB with SQL'], ['1986', 'ANSI SQL standard released'], ['1989, 1992, 1999, 2003', 'Major ANSI standard updates'], ['Current', 'SQL is supported by most major database vendors']]),
        ['h', 'What is a relational database?'],
        ['p', 'A **relational database** is a database divided into logical units called tables, where tables are related to one another within the database. Relational database allows data to be broken down into logical, smaller, and manageable units for easier maintenance and better performance.'],
        ['p', '**Tables** are collections of rows and columns. Tables are related to one another through common keys or fields in a relational database system. That is why, even though the desired data may exist in more than one table, you can easily join multiple tables together to get a combined data set using a single query.'],
        ['p', 'A **field** or **column** is a single characteristic, attribute or property that provides information about an object, while a **record** or **row** is a complete set of all the fields/attributes combined together for a particular object.'],
        ['tables'],
        ['h', 'Three categories of SQL'],
        T(['Category', 'What its commands do', 'Sample commands'], [
          ['**Data Definition Language (DDL)**', 'Commands used to define a database, including those for creating, altering, and dropping tables and establishing constraints.', '`CREATE`, `ALTER`, `DROP`'],
          ['**Data Manipulation Language (DML)**', 'Commands used for updating, inserting, modifying, and querying the data in the database.', '`INSERT`, `UPDATE`, `DELETE`, `SELECT`'],
          ['**Data Control Language (DCL)**', 'Commands that help a DBA control the database; they include commands to grant or revoke privileges to access the database or particular objects within the database and to store or remove transactions that would affect the database.', '`GRANT`, `REVOKE`']
        ]),
        ['note', 'The handout does not list sample DCL commands. GRANT and REVOKE are the commands that grant or revoke privileges.', { label: 'Note' }]
      ],
      quiz: [
        { q: 'Which category of SQL do `CREATE`, `ALTER` and `DROP` belong to?', o: ['Data Definition Language (DDL)', 'Data Manipulation Language (DML)', 'Data Control Language (DCL)', 'None of these'], a: 0, why: 'DDL commands define the database.' },
        { q: 'Which category does `SELECT` belong to?', o: ['DML', 'DDL', 'DCL', 'None of these'], a: 0, why: 'The handout lists INSERT, UPDATE, DELETE and SELECT as DML.' },
        { q: 'Commands to grant or revoke privileges belong to…', o: ['DCL', 'DDL', 'DML', 'None of these'], a: 0, why: 'DCL helps a DBA control the database.' },
        { q: 'A single characteristic, attribute or property of an object is a…', o: ['field or column', 'record or row', 'table', 'database'], a: 0, why: 'A record is the complete set of fields for one object.' },
        { q: 'Who developed the relational database concept, in 1970?', o: ['E. Codd', 'Oracle', 'ANSI', 'IBM Research Lab'], a: 0, why: 'IBM later created System R with Sequel.' },
        { q: 'In what year was the ANSI SQL standard first released?', o: ['1986', '1970', '1979', '2003'], a: 0, why: 'Updates followed in 1989, 1992, 1999 and 2003.' },
        { q: 'Tables in a relational database are related through common keys or fields.', o: ['True', 'False'], a: 0, why: 'That is what lets one query join several tables.' }
      ]
    },
    {
      id: 'l2s2', title: 'Managing databases',
      sub: 'Before doing anything with the data we must create a database first. It is assumed that you already have SQL Server available for your use.',
      blocks: [
        RO,
        ['h', 'Creating a database'],
        ['p', 'The basic syntax for creating a database can be given with:'],
        ['code', 'CREATE DATABASE databasename', { cap: 'Syntax' }],
        ['p', 'The following SQL statement creates a database named demo:'],
        ['code', 'CREATE DATABASE demo'],
        ['p', 'A DBMS can manage multiple databases on one computer. Therefore, we need to select the database that we want to use. Once the database is selected, we can proceed with creating tables or querying data. Write the following SQL statement for using the database:'],
        ['code', 'USE demo'],
        ['h', 'Renaming a database'],
        ['p', 'To rename a database in SQL Server, use the command `sp_renamedb`.'],
        ['code', "sp_renamedb [@dbname=] 'old_name' , [@newname =] 'new_name'", { cap: 'Syntax' }],
        ['p', 'The following SQL statement renames the accounting database to financial:'],
        ['code', "sp_renamedb 'accounting', 'financial'"],
        ['h', 'Deleting a database'],
        ['p', 'To delete an existing database in SQL Server, use the command `DROP DATABASE`.'],
        ['code', 'DROP DATABASE databasename', { cap: 'Syntax' }],
        ['note', 'Be careful before dropping a database. Deleting a database will result in loss of complete information stored in the database!', { label: 'Note' }]
      ],
      quiz: [
        { q: 'Which statement creates a database named demo?', o: ['CREATE DATABASE demo', 'NEW DATABASE demo', 'USE demo', 'MAKE demo'], a: 0, why: 'The syntax is CREATE DATABASE databasename.' },
        { q: 'Why do we need `USE demo`?', o: ['A DBMS can manage multiple databases, so we select the one we want to use', 'It creates the database', 'It deletes the database', 'It renames the database'], a: 0, why: 'After USE, tables are created and queried in that database.' },
        { q: 'Which command renames a database in SQL Server?', o: ['sp_renamedb', 'sp_rename', 'ALTER DATABASE RENAME', 'RENAME DATABASE'], a: 0, why: 'sp_renamedb takes the old name, then the new name.' },
        { q: 'What does `DROP DATABASE` do to the information stored in the database?', o: ['It is completely lost', 'It is kept in a backup automatically', 'It moves to another database', 'Nothing'], a: 0, why: 'That is why the handout says to be careful.' }
      ]
    },
    {
      id: 'l2s3', title: 'Tables and data types',
      sub: 'Tables are database objects that store data in a collection of rows and columns. Each row represents a unique record, and each column represents a field within the record.',
      blocks: [
        ['h', 'Naming tables and columns'],
        ['list', ['Spaces and other symbols may be used if delimited by double quotation marks or brackets `[ ]`. This is not recommended, as the delimiter must always be used when referencing that name. Example: `"First Name"` or `[First Name]`.', 'Table names can be up to 128 characters.', 'Table names must begin with an alphabetic character and can also contain underscores (`_`), “at” symbols (`@`), pound signs (`#`), and numerals.', 'Each table can have up to 1,024 columns.']],
        ['h', 'Data types'],
        ['p', 'A **data type** is an attribute that specifies the type of data that the column can store. The data type of an attribute decides the operations that can be performed on the data of that attribute. For example, arithmetic operations can be performed on numeric data but not on character data. Commonly used data types in SQL Server are numeric types (exact and approximate), date and time types, character string and Unicode character string types, and miscellaneous types.'],
        IMG('sql-server-data-types.png', 'Mind map of SQL Server data types. Exact numerics: bigint, bit, decimal, int, money, numeric, smallint, smallmoney, tinyint. Approximate numerics: float, real. Date and time: date, datetime2, datetime, datetimeoffset, smalldatetime, time. Character strings: char, text, varchar. Unicode character strings: nchar, ntext, nvarchar. Binary strings: binary, image, varbinary. Others: cursor, hierarchyid, sql_variant, spatial geometry types, table, rowversion, uniqueidentifier, xml, spatial geography types.', 952, 976, 'SQL Server Data Types System'),
        ['h', 'Exact numeric data types'],
        ['p', 'Exact numeric data types store exact numbers such as integer, decimal, or monetary amount.'],
        ['list', ['The `bit` stores one of three values: 0, 1, and NULL.', 'The `int`, `bigint`, `smallint`, and `tinyint` data types store integer data.', 'The `decimal` and `numeric` data types store numbers that have fixed precision and scale. Note that decimal and numeric are synonyms.', 'The `money` and `smallmoney` data types store currency values.']],
        T(['Data type', 'Range', 'Storage (bytes)'], [
          ['`tinyint`', '0 to 255', '1'],
          ['`smallint`', '-32,768 to 32,767', '2'],
          ['`int`', '-2^31 (-2,147,483,648) to 2^31-1 (2,147,483,647)', '4'],
          ['`bigint`', '-2^63 (-9,223,372,036,854,775,808) to 2^63-1 (9,223,372,036,854,775,807)', '8'],
          ['`bit`', '1, 0 or NULL', '1'],
          ['`decimal`/`numeric`', '-10^38 +1 through 10^38 – 1 when maximum precision is used', '5-17'],
          ['`money`', '-922,337,203,685,477.5808 to 922,337,203,685,477.5807', '8'],
          ['`smallmoney`', '-214,748.3648 to 214,748.3647', '4']
        ]),
        ['h', 'Approximate numeric data types'],
        ['p', 'The approximate numeric data type stores floating point numeric data. They are often used in scientific calculations. Values of float are truncated when converted to integer types.'],
        T(['Data type', 'Range', 'Storage (bytes)'], [
          ['`float(n)`', '-1.79E+308 to -2.23E-308, 0 and 2.23E-308 to 1.79E+308', 'Depends on value of n, 4 or 8 bytes'],
          ['`real`', '-3.40E+38 to -1.18E-38, 0 and 1.18E-38 to 3.40E+38', '4']
        ]),
        ['h', 'Date and time data types'],
        ['p', 'The date and time data types store date and time data, and the date time offset (specific date and time zone).'],
        T(['Data type', 'Storage (bytes)', 'Date range', 'Accuracy', 'Recommended entry format'], [
          ['`DATETIME`', '8', 'January 1, 1753 to December 31, 9999', '3-1/3 milliseconds', '‘YYMMDD hh:mm:ss:nnn’'],
          ['`SMALLDATETIME`', '4', 'January 1, 1900 to June 6, 2079', '1 minute', '‘YYMMDD hh:mm:ss:nnn’'],
          ['`DATETIME2`', '6 to 8', 'January 1, 0001 to December 31, 9999', '100 nanoseconds', '—'],
          ['`DATE`', '3', 'January 1, 0001 to December 31, 9999', '1 day', '‘YYYY-MM-DD’'],
          ['`TIME`', '3 to 5', '—', '100 nanoseconds', '‘hh:mm:ss:nnnnnnn’'],
          ['`DATETIMEOFFSET`', '8 to 10', 'January 1, 0001 to December 31, 9999', '100 nanoseconds', '‘YYYY-MM-DD hh:mm:ss:nnnnnnn [+|-]hh:mm’']
        ]),
        ['h', 'Character string data types'],
        ['p', 'Character data consists of any combination of letters, symbols, and numeric characters. Character string data types allow you to store either fixed-length (`char`) or variable-length data (`varchar`).'],
        T(['Data type', 'Range', 'Storage'], [['`CHAR(n)`', '1-8000 characters', 'n bytes, padded'], ['`VARCHAR(n)`', '1-8000 characters', 'n bytes'], ['`VARCHAR(MAX)`', '1-2^31-1 characters', 'Actual length + 2']]),
        ['h', 'Unicode character string data types'],
        ['p', 'Unicode character string data types store either fixed-length (`nchar`) or variable-length (`nvarchar`) Unicode character data.'],
        T(['Data type', 'Range', 'Storage'], [['`NCHAR(n)`', '1-4000 characters', 'n bytes, padded'], ['`NVARCHAR(n)`', '1-4000 characters', 'n bytes']]),
        ['h', 'Binary string data types'],
        ['p', 'The binary data types store fixed and variable length binary data.'],
        T(['Data type', 'Range', 'Storage'], [['`BINARY`', '0-8000 bytes', 'n bytes, padded'], ['`VARBINARY`', '0-8000 bytes', 'Actual length + 2']]),
        ['note', '`CHAR(10)` always uses 10 bytes. The value “Ana” is padded with spaces to fill them. `VARCHAR(10)` stores “Ana” as just its 3 characters. Use CHAR when every value has the same length, such as a code. Use VARCHAR when lengths vary, such as names.', { label: 'CHAR or VARCHAR?' }]
      ],
      quiz: [
        { q: 'How many characters can a table name have, at most?', o: ['128', '64', '1,024', '8,000'], a: 0, why: 'Table names can be up to 128 characters.' },
        { q: 'How many columns can each table have, at most?', o: ['1,024', '128', '255', '8,000'], a: 0, why: 'Each table can have up to 1,024 columns.' },
        { q: 'Which is a valid way to name a column that has a space in it?', o: ['[First Name]', 'First Name', '(First Name)', '{First Name}'], a: 0, why: 'Use double quotation marks or square brackets.' },
        { q: 'Which values can a `bit` column hold?', o: ['0, 1 and NULL', 'Any whole number', 'TRUE and FALSE text', '0 to 255'], a: 0, why: 'bit stores one of three values: 0, 1 and NULL.' },
        { q: 'Which data type has the range 0 to 255 and uses 1 byte?', o: ['tinyint', 'smallint', 'bit', 'int'], a: 0, why: 'tinyint is the smallest integer type.' },
        { q: '`decimal` and `numeric` are synonyms.', o: ['True', 'False'], a: 0, why: 'Both store numbers with fixed precision and scale.' },
        { q: 'Which data types store currency values?', o: ['money and smallmoney', 'float and real', 'int and bigint', 'char and varchar'], a: 0, why: 'money and smallmoney are exact numeric types for currency.' },
        { q: 'What is the difference between `CHAR(n)` and `VARCHAR(n)`?', o: ['CHAR is fixed-length and padded; VARCHAR is variable-length', 'CHAR stores numbers; VARCHAR stores text', 'CHAR is Unicode; VARCHAR is not', 'There is no difference'], a: 0, why: 'CHAR(n) uses n bytes, padded. VARCHAR stores variable-length data.' },
        { q: 'Which type stores variable-length **Unicode** character data?', o: ['nvarchar', 'varchar', 'nchar', 'varbinary'], a: 0, why: 'nchar is fixed-length Unicode. nvarchar is variable-length Unicode.' },
        { q: 'Which date type has an accuracy of 1 day and the entry format ‘YYYY-MM-DD’?', o: ['DATE', 'DATETIME', 'SMALLDATETIME', 'TIME'], a: 0, why: 'DATE uses 3 bytes and stores only the date.' }
      ]
    },
    {
      id: 'l2s4', title: 'NULL, primary key and foreign key',
      sub: 'Three ideas you need before you create a table: NULL, the primary key, and the foreign key.',
      blocks: [
        ['h', 'Null'],
        ['p', 'A value that may be assigned to an attribute when no other value applies or when the applicable value is unknown.'],
        ['p', 'A null value, or NULL, is not the same as zero (0), blank, or a zero-length or empty character string such as “”. NULL means that no entry has been made.'],
        ['h', 'Primary key'],
        ['p', 'A **primary key** is a field or a combination of fields that identifies a record uniquely. The primary key is a column or set of columns that are unique. In other words, every value is unique for a primary key. Every table should have a primary key.'],
        ['p', '**Rules for primary key**'],
        ['list', ['Each table can have only one primary key.', 'All the values are unique and the primary key value can uniquely identify each row.', 'The system will not allow inserting a row with a primary key which already exists in the table.', 'Primary key cannot be NULL.']],
        ['p', 'The diagram below summarizes all the above points for the primary key.'],
        IMG('primary-key.png', 'Diagram. Column 1 is the primary key and all its values (A, B, C, D) are unique. A person tries to enter a new row with D in Column 1. MS SQL refuses with the error: I cannot allow this row to enter, I already have D in my Column 1 which is Primary Key.', 820, 508, 'Primary key: a duplicate value is refused'),
        ['h', 'Foreign key'],
        ['p', 'A **foreign key** provides a way of enforcing referential integrity within SQL Server. In simple words, a foreign key ensures values in one table must be present in another table.'],
        ['p', '**Rules for foreign key**'],
        ['list', ['NULL is allowed in a foreign key.', 'The table being referenced is called the **parent table**.', 'The table with the foreign key is called the **child table** or dependent table.', 'The foreign key in the child table references the primary key in the parent table.', 'This parent-child relationship enforces the rule which is known as “Referential Integrity.”']],
        ['p', 'The diagram below summarizes all the above points for the foreign key.'],
        IMG('foreign-key.png', 'Diagram. The parent table has Column 1 as its primary key with values A, B, C, D. The child table has Column 1 as a foreign key with values A, B and NULL. A person tries to insert a row with G in Column 1 of the child table. MS SQL refuses because G is not in Column 1 of the parent table.', 954, 526, 'Foreign key: a value that is not in the parent table is refused'),
        ['p', 'You can see a real primary key and foreign key in the practice tables: `Products.CategoryID` is a foreign key. It refers to `Categories.CategoryID`, the primary key of Categories. Every product’s category must exist in Categories.'],
        ['demo', 'SELECT CategoryID, CategoryName\nFROM   Categories', { title: 'The parent table', after: 'CategoryID is unique in Categories. It is the primary key.' }]
      ],
      quiz: [
        { q: 'NULL is the same as zero (0).', o: ['True', 'False'], a: 1, why: 'NULL is not zero, blank or an empty string. It means no entry has been made.' },
        { q: 'How many primary keys can a table have?', o: ['Only one', 'One per column', 'Up to 1,024', 'None'], a: 0, why: 'Each table can have only one primary key. It may combine several columns.' },
        { q: 'Can a primary key value be NULL?', o: ['No', 'Yes', 'Only once', 'Only in a child table'], a: 0, why: 'A primary key cannot be NULL.' },
        { q: 'Is NULL allowed in a foreign key?', o: ['Yes', 'No'], a: 0, why: 'The handout’s first rule for foreign keys says NULL is allowed.' },
        { q: 'The table that holds the foreign key is called the…', o: ['child table or dependent table', 'parent table', 'base table', 'view'], a: 0, why: 'The referenced table is the parent.' },
        { q: 'A foreign key in the child table references the ___ in the parent table.', o: ['primary key', 'foreign key', 'first column', 'NULL value'], a: 0, why: 'This parent-child link enforces referential integrity.' },
        { q: 'In the diagram, why is the row with G refused?', o: ['G is not in Column 1 of the parent table', 'G is a duplicate', 'G is NULL', 'The child table is full'], a: 0, why: 'A foreign key value must exist in the parent table.' }
      ]
    },
    {
      id: 'l2s5', title: 'Creating and modifying tables',
      sub: 'Use CREATE TABLE to make a table, ALTER TABLE to change it, sp_rename to rename it or its columns, and DROP TABLE to delete it.',
      blocks: [
        RO,
        ['h', 'Creating a table'],
        ['code', 'CREATE TABLE tableName\n(\n  column_1 datatype [ NULL | NOT NULL ],\n  column_2 datatype [ NULL | NOT NULL ]\n  [ DEFAULT constant_expression ]\n  [ IDENTITY [(seed, increment)] ]\n  [ CONSTRAINT constraint_name ]\n  ...\n)', { cap: 'Syntax' }],
        ['list', ['The parameter `tableName` denotes the name of the table that you are going to create.', 'The parameters `column_1`, `column_2`… denote the columns to be added to the table.', 'A column should be specified as either NULL or NOT NULL. If you don’t specify, SQL Server will take NULL as the default.', 'A **default** value to a column may be assigned but is optional. It is the value you want to be used for the column for any row that is inserted without explicitly supplying a value for that particular column.', 'A column may be an **identity**, but this is optional. An identity column is used to create a column that contains system-generated sequential values to identify each row inserted into a table. The (seed, increment) values will default to (1,1) if not specified.']],
        T(['Term', 'Meaning'], [['Identity seed', 'Provides the starting value for an identity column.'], ['Identity increment', 'Defines how an identity will increase or decrease with each new row added to a table.']]),
        ['h', 'Create a basic table with two columns'],
        ['code', 'CREATE TABLE COURSE\n(\n  CourseID   Numeric NOT NULL,\n  CourseCode Varchar(100) NOT NULL\n)'],
        ['h', 'Create a table with an identity column and a primary key'],
        ['code', 'CREATE TABLE JOB\n(\n  JobID   Numeric IDENTITY (1,1) NOT NULL,\n  JobDesc Varchar(100) NOT NULL,\n  CONSTRAINT PK_Job PRIMARY KEY(JobID)\n)'],
        ['list', ['The table is named JOB and has two columns.', 'JobID has a numeric data type and is an identity column. This means that this column will have system-generated sequential values starting from the seed (1) and will increment by 1.', 'This table assigns JobID as a primary key constraint named PK_Job. The constraint name is user defined.']],
        ['h', 'Create a table that has a primary key, a default value and a foreign key'],
        ['code', 'CREATE TABLE dbo.EMPLOYEES\n(\n  EmpNo NUMERIC NOT NULL\n    CONSTRAINT PK_empID PRIMARY KEY,\n  LName VARCHAR (20) NOT NULL,\n  FName VARCHAR (20) NOT NULL,\n  MName VARCHAR (20),\n  Active_Flag BIT NOT NULL DEFAULT 1,\n  JobID SMALLINT NOT NULL\n    CONSTRAINT FK_jobID FOREIGN KEY\n    REFERENCES dbo.JOBS (JobID)\n)'],
        ['list', ['The table is named EMPLOYEES and has six columns.', 'EmpNo is a numeric data type and also the primary key.', 'LName and FName are both varchar with a length of 20 and do not allow null values.', 'MName is varchar with a size of 20. Since it was not specified as either NULL or NOT NULL, it will take NULL as the default.', 'Active_Flag has a bit data type, which means that the allowed values are only 1 and 0. It also has a default constraint, which means that when the user specifies no value for the column on insert, it will take the default value, which is 1.', 'A foreign key has been assigned to the JobID column. Remember that a foreign key should reference a parent table where it is a primary key. The data type of a foreign key should match the data type of the primary key it references.']],
        ['note', 'The handout says EMPLOYEES has seven columns, but the statement defines six: EmpNo, LName, FName, MName, Active_Flag and JobID.', { label: 'Note' }],
        ['h', 'Modifying a table'],
        ['code', 'ALTER TABLE table_name\n{ [ ALTER COLUMN column_name datatype ]\n  | ADD {[column definition]}\n  | DROP {[CONSTRAINT] constraint_name | COLUMN column}\n}', { cap: 'Syntax' }],
        ['h', 'Alter a table to add a new column'],
        ['code', 'ALTER TABLE table_name\nADD column_1 datatype [ NULL | NOT NULL ]', { cap: 'Syntax' }],
        ['code', 'ALTER TABLE COURSE\nADD CourseDuration VARCHAR(100)', { cap: 'The ALTER statement adds a new column CourseDuration to the COURSE table.' }],
        ['h', 'Alter a table to drop a column'],
        ['code', 'ALTER TABLE table_name\nDROP COLUMN column_name', { cap: 'Syntax' }],
        ['code', 'ALTER TABLE COURSE\nDROP COLUMN CourseDuration', { cap: 'The ALTER statement removes the column CourseDuration from the COURSE table.' }],
        ['h', 'Alter a table to change the data type of a column'],
        ['code', 'ALTER TABLE table_name\nALTER COLUMN column_name datatype', { cap: 'Syntax' }],
        ['code', 'ALTER TABLE COURSE\nALTER COLUMN CourseCode CHAR(20)', { cap: 'The ALTER statement changes the data type of the CourseCode column on the COURSE table to CHAR(20).' }],
        ['h', 'Alter a table to assign a constraint to an existing column'],
        ['code', 'ALTER TABLE table_name\nADD CONSTRAINT constraint_name\nconstraint_type(column_name)', { cap: 'Syntax' }],
        ['code', 'ALTER TABLE COURSE\nADD CONSTRAINT PK_Course\nPRIMARY KEY (CourseID)', { cap: 'The ALTER statement adds a primary key constraint on CourseID to the COURSE table.' }],
        ['h', 'Renaming a table'],
        ['p', 'Use the SQL command `sp_rename` followed by the old table name, then the new table name.'],
        ['code', "sp_rename 'old_table_name', 'new_table_name'", { cap: 'Syntax' }],
        ['code', "sp_rename 'EMPLOYEES', 'EMPLOYEE'", { cap: 'Rename the EMPLOYEES table to EMPLOYEE.' }],
        ['h', 'Renaming a column of a table'],
        ['p', 'Use the SQL command `sp_rename` followed by the old column name, then the new column name, and the last parameter is the keyword `column`.'],
        ['code', "sp_rename 'table_name.old_column_name', 'new_column_name', 'column'", { cap: 'Syntax' }],
        ['code', "sp_rename 'JOB.JobDesc', 'JobDescription', 'column'", { cap: 'Rename the JobDesc column of the JOB table to JobDescription.' }],
        ['h', 'Dropping a table'],
        ['p', 'Use the DROP command to drop or delete a table.'],
        ['code', 'DROP TABLE table_name', { cap: 'Syntax' }],
        ['code', 'DROP TABLE COURSE']
      ],
      quiz: [
        { q: 'If you do not say NULL or NOT NULL for a column, SQL Server takes…', o: ['NULL as the default', 'NOT NULL as the default', 'an error', 'a primary key'], a: 0, why: 'That is why MName in EMPLOYEES allows NULL.' },
        { q: 'What does `IDENTITY (1,1)` mean?', o: ['System-generated values starting at 1 and going up by 1', 'The column must equal 1', 'The column is the first and only column', 'One NULL is allowed'], a: 0, why: 'The first number is the seed, the second the increment.' },
        { q: 'If the seed and increment of an identity are not given, they default to…', o: ['(1,1)', '(0,1)', '(1,0)', '(0,0)'], a: 0, why: 'The handout says (seed, increment) defaults to (1,1).' },
        { q: 'Which statement adds a column CourseDuration to COURSE?', o: ['ALTER TABLE COURSE ADD CourseDuration VARCHAR(100)', 'ALTER COURSE ADD COLUMN CourseDuration', 'UPDATE COURSE ADD CourseDuration', 'CREATE COLUMN CourseDuration ON COURSE'], a: 0, why: 'ALTER TABLE … ADD column datatype.' },
        { q: 'Which statement changes CourseCode to CHAR(20)?', o: ['ALTER TABLE COURSE ALTER COLUMN CourseCode CHAR(20)', 'ALTER TABLE COURSE MODIFY CourseCode CHAR(20)', 'UPDATE COURSE SET CourseCode = CHAR(20)', 'ALTER COLUMN CourseCode CHAR(20)'], a: 0, why: 'In SQL Server the clause is ALTER COLUMN.' },
        { q: 'How do you rename the JobDesc column of JOB to JobDescription?', o: ["sp_rename 'JOB.JobDesc', 'JobDescription', 'column'", "sp_renamedb 'JobDesc', 'JobDescription'", "ALTER TABLE JOB RENAME JobDesc", "sp_rename 'JobDesc', 'JobDescription'"], a: 0, why: 'Give table.old_column, the new name, then the keyword column.' },
        { q: 'In EMPLOYEES, what value does Active_Flag get when an insert gives no value for it?', o: ['1', '0', 'NULL', 'An error'], a: 0, why: 'It has DEFAULT 1.' },
        { q: 'A foreign key’s data type should match the data type of the primary key it references.', o: ['True', 'False'], a: 0, why: 'The handout says this under the EMPLOYEES example.' }
      ]
    }
  ],
  review: {
    intro: 'Practise Lesson 2. Below are the handout’s guide questions. Answer them in your notebook. For questions 6 and 7, write the CREATE TABLE statements and run them in SQL Server. This site’s database is read-only, so it cannot check them. Then take the lesson quiz.',
    guide: [
      'Distinguish among data definition commands, data manipulation commands, and data control commands.',
      'Describe the data types in SQL.',
      'What’s the difference between VARCHAR and CHAR? When would you use one over the other?',
      'Discuss each of the clauses of the CREATE TABLE statement.',
      'What is identity in SQL?',
      'Write SQL statements that will create the following tables: Hotel (HotelNo, HotelName, City); Room (RoomNo, HotelNo, Type, Price); Guest (GuestNo, LastName, FirstName, Address, ContactNo); Booking (BookingNo, HotelNo, GuestNo, DateFrom, DateTo, RoomNo).',
      'Using the relational table, write SQL statements that will create the tables.'
    ],
    quiz: [
      { q: '`INSERT`, `UPDATE` and `DELETE` are…', o: ['data manipulation commands', 'data definition commands', 'data control commands', 'stored procedures'], a: 0, why: 'They change the data, not the structure.' },
      { q: 'Which command would you use to remove a whole table?', o: ['DROP TABLE', 'DELETE TABLE', 'ALTER TABLE … DROP', 'REMOVE TABLE'], a: 0, why: 'DROP is a DDL command.' },
      { q: 'You need a column for a 2-letter country code that is always 2 characters. Which type fits best?', o: ['CHAR(2)', 'VARCHAR(MAX)', 'NVARCHAR(4000)', 'int'], a: 0, why: 'Fixed-length data suits CHAR.' },
      { q: 'You need a column for people’s last names, which vary in length. Which type fits best?', o: ['VARCHAR(50)', 'CHAR(50)', 'bit', 'money'], a: 0, why: 'VARCHAR stores only the actual length.' },
      { q: 'Which is the best data type for a room price such as 2500.00?', o: ['money', 'bit', 'varchar(10)', 'date'], a: 0, why: 'money stores currency values exactly.' },
      { q: 'Which line makes HotelNo the primary key of Hotel?', o: ['CONSTRAINT PK_Hotel PRIMARY KEY (HotelNo)', 'HotelNo PRIMARY', 'KEY HotelNo', 'HotelNo IDENTITY KEY'], a: 0, why: 'A named primary key constraint at the table level.' },
      { q: 'In Room (RoomNo, HotelNo, Type, Price), HotelNo should be…', o: ['a foreign key that references Hotel (HotelNo)', 'the only primary key of Hotel', 'an identity column', 'NULL always'], a: 0, why: 'Each room belongs to a hotel that must exist.' },
      { q: 'An identity column contains system-generated sequential values.', o: ['True', 'False'], a: 0, why: 'That is what identity means in SQL Server.' }
    ]
  }
};

/* ====================================================================== LESSON 3 */
const L3 = {
  id: 'l3', n: 3, title: 'Constraints',
  blurb: 'Keep data accurate with domain, entity and referential integrity, and with PRIMARY KEY, FOREIGN KEY, UNIQUE, DEFAULT and CHECK constraints.',
  outcomes: ['Enforce data integrity', 'Describe constraints', 'Create and maintain constraints'],
  sections: [
    {
      id: 'l3s1', title: 'Data integrity',
      sub: 'Constraints are a very important feature in a relational model. The relational model supports the well-defined theory of constraints on attributes or tables. Constraints are useful because they allow a designer to specify the semantics of data in the database.',
      blocks: [
        ['p', 'The term **data integrity** refers to the overall accuracy, consistency, and completeness of data. Data integrity is usually imposed during the database design phase through the use of standard procedures and rules. Data integrity can be maintained through the use of various error-checking methods and validation procedures.'],
        ['h', 'Categories of data integrity'],
        ['p', 'The following three integrity constraints are used in a relational database structure to achieve data integrity:'],
        ['list', ['Domain Integrity', 'Entity Integrity', 'Referential Integrity']],
        ['h', 'Domain integrity'],
        ['p', 'Also known as **column integrity**, this integrity specifies a set of data values that are valid for a column. This can be defined by the data type, format, data length, nullability, default value and range of allowable values.'],
        ['h', 'Entity integrity'],
        ['p', 'Also known as **row integrity**, this integrity requires that all the rows in a table have a unique identifier, enforced by either a PRIMARY KEY or UNIQUE constraint. The rule states that every table must have its own primary key and that each has to be unique and not null.'],
        ['h', 'Referential integrity'],
        ['p', 'This is the concept of foreign keys: a state in which all foreign key values in the database are valid. For a foreign key to be valid, it must contain either the value NULL, or an existing key value from the PRIMARY KEY or UNIQUE KEY columns referenced by the foreign key. The referenced row cannot be deleted if a FOREIGN KEY refers to it, nor can its key value be changed if a FOREIGN KEY refers to it.'],
        T(['Integrity', 'Also known as', 'Enforced by'], [['Domain', 'column integrity', 'data type, format, length, nullability, default value, range of allowable values (CHECK, DEFAULT)'], ['Entity', 'row integrity', 'PRIMARY KEY or UNIQUE constraint'], ['Referential', '—', 'FOREIGN KEY constraint']])
      ],
      quiz: [
        { q: 'Data integrity refers to the overall ___ of data.', o: ['accuracy, consistency, and completeness', 'size and speed', 'security and encryption', 'format and style'], a: 0, why: 'That is the handout’s definition.' },
        { q: 'Which integrity is also known as **column** integrity?', o: ['Domain integrity', 'Entity integrity', 'Referential integrity', 'Data quality'], a: 0, why: 'It defines the valid values for a column.' },
        { q: 'Which integrity is also known as **row** integrity?', o: ['Entity integrity', 'Domain integrity', 'Referential integrity', 'Check integrity'], a: 0, why: 'Every row needs a unique identifier.' },
        { q: 'Entity integrity is enforced by…', o: ['a PRIMARY KEY or UNIQUE constraint', 'a DEFAULT constraint', 'a CHECK constraint', 'a view'], a: 0, why: 'They make each row uniquely identifiable.' },
        { q: 'For a foreign key to be valid, it must contain…', o: ['NULL, or an existing key value from the referenced columns', 'any value', 'a value that is not in the parent table', 'only numbers'], a: 0, why: 'This is referential integrity.' },
        { q: 'A parent row can be deleted while a FOREIGN KEY still refers to it.', o: ['True', 'False'], a: 1, why: 'The referenced row cannot be deleted, and its key value cannot be changed.' }
      ]
    },
    {
      id: 'l3s2', title: 'Constraints, primary keys and foreign keys',
      sub: 'Constraints are business logic that your database server enforces for you.',
      blocks: [
        ['p', 'Constraints are used to specify rules for the data in a table. Constraints are used to limit the type of data that can go into a table. This ensures the accuracy and reliability of the data in the table. Constraints prevent the deletion of a table if there are dependencies. If there is any violation between the constraint and the data action, the action is aborted.'],
        ['h', 'Constraint guidelines'],
        ['list', ['The constraint can be created within the CREATE TABLE T-SQL command while creating the table, or can be added using the ALTER TABLE T-SQL command after creating the table.', 'Constraints in SQL Server can be defined at the **column level**, where it is specified as part of the column definition and will be applied to that column only, or declared independently at the **table level**. In this case, the constraint rules will be applied to more than one column in the specified table.']],
        ['h', 'Types of constraints'],
        ['p', 'The following constraints are commonly used in SQL:'],
        ['list', ['Primary Key Constraints', 'Foreign Key Constraints', 'Check Constraints', 'Default Constraints', 'Unique Constraints']],
        RO,
        ['h', 'Primary key constraints'],
        ['p', 'A PRIMARY KEY constraint ensures no duplicate values are entered in particular columns and that NULL values are not entered in those columns. If an attempt is made to insert a row of data with a duplicate value or NULL value for the primary key, an error message will result and the insert is not allowed.'],
        ['code', 'CREATE TABLE Student\n( StudentID INT CONSTRAINT PK_Student PRIMARY KEY\n, Name VARCHAR(60) NOT NULL\n, BirthDate DATE\n)', { cap: 'Creating primary key constraints on CREATE TABLE: column level' }],
        ['code', 'CREATE TABLE Student\n( StudentID INT,\n  Name VARCHAR(60) NOT NULL,\n  BirthDate DATE,\n  CONSTRAINT PK_Student PRIMARY KEY (StudentID)\n)', { cap: 'Creating primary key constraints on CREATE TABLE: table level' }],
        ['code', 'ALTER TABLE Student\nADD CONSTRAINT PK_Student PRIMARY KEY (StudentID)', { cap: 'Creating primary key constraints on ALTER TABLE' }],
        ['h', 'Foreign key constraints'],
        ['list', ['A FOREIGN KEY constraint governs the link between the parent or referenced table and the child or referencing table.', 'This constraint enforces referential integrity between tables.', 'The number and data type of the columns in the parent table key must match the number and data type of the columns in the child table.']],
        ['code', 'CREATE TABLE LECTURER\n(\n  LecturerID NUMERIC NOT NULL,\n  LecturerName VARCHAR(20),\n  CourseID NUMERIC\n    CONSTRAINT FK_Lecturer_Course FOREIGN KEY\n    REFERENCES COURSE (CourseID)\n)', { cap: 'Creating foreign key constraints on CREATE TABLE: column level' }],
        ['code', 'CREATE TABLE LECTURER\n(\n  LecturerID NUMERIC NOT NULL,\n  LecturerName VARCHAR(20),\n  CourseID NUMERIC,\n  CONSTRAINT FK_Lecturer_Course FOREIGN KEY (CourseID)\n    REFERENCES COURSE (CourseID)\n)', { cap: 'Creating foreign key constraints on CREATE TABLE: table level' }],
        ['code', 'ALTER TABLE LECTURER\nADD CONSTRAINT FK_Lecturer_Course\nFOREIGN KEY (CourseID)\nREFERENCES COURSE (CourseID)', { cap: 'Creating foreign key constraints on ALTER TABLE' }],
        ['note', 'At column level the constraint sits inside the column’s definition, so it needs no column list. At table level it comes after the columns, so you name the column in brackets: `PRIMARY KEY (StudentID)`, `FOREIGN KEY (CourseID)`.', { label: 'Column level or table level?' }]
      ],
      quiz: [
        { q: 'What happens when data breaks a constraint?', o: ['The action is aborted', 'The data is saved with a warning', 'The constraint is dropped', 'The table is deleted'], a: 0, why: 'If there is any violation, the action is aborted.' },
        { q: 'A constraint declared as part of one column’s definition is defined at the…', o: ['column level', 'table level', 'database level', 'server level'], a: 0, why: 'Table-level constraints are declared separately and can cover several columns.' },
        { q: 'Which is **not** one of the five constraint types in the handout?', o: ['INDEX', 'CHECK', 'DEFAULT', 'UNIQUE'], a: 0, why: 'The five are PRIMARY KEY, FOREIGN KEY, CHECK, DEFAULT and UNIQUE.' },
        { q: 'Which line is a **table-level** primary key?', o: ['CONSTRAINT PK_Student PRIMARY KEY (StudentID)', 'StudentID INT CONSTRAINT PK_Student PRIMARY KEY', 'StudentID PRIMARY', 'PRIMARY StudentID KEY'], a: 0, why: 'At table level you name the column in brackets.' },
        { q: 'Which statement adds a primary key to an existing Student table?', o: ['ALTER TABLE Student ADD CONSTRAINT PK_Student PRIMARY KEY (StudentID)', 'CREATE PRIMARY KEY ON Student', 'UPDATE Student SET PRIMARY KEY = StudentID', 'ALTER Student PRIMARY KEY'], a: 0, why: 'Use ALTER TABLE … ADD CONSTRAINT.' },
        { q: 'In the LECTURER example, which table is the parent?', o: ['COURSE', 'LECTURER', 'Student', 'JOB'], a: 0, why: 'LECTURER.CourseID references COURSE (CourseID).' },
        { q: 'Constraints can prevent the deletion of a table if there are dependencies.', o: ['True', 'False'], a: 0, why: 'The handout says this in its definition of constraints.' }
      ]
    },
    {
      id: 'l3s3', title: 'Unique, default and check constraints',
      sub: 'Three more constraints, and how to list and drop the constraints on a table.',
      blocks: [
        RO,
        ['h', 'Unique constraints'],
        ['list', ['A UNIQUE constraint ensures no duplicate values are entered into specified columns that are not a table’s primary key.', 'It enforces uniqueness in a column or combination of columns. You can attach multiple unique constraints to a table, whereas you can attach only one primary key constraint to a table.']],
        ['code', 'CREATE TABLE DEPARTMENT\n(\n  DeptNo NUMERIC NOT NULL,\n  DeptName VARCHAR(20)\n    CONSTRAINT UQ_DeptName UNIQUE\n)', { cap: 'Creating unique constraints on CREATE TABLE: column level. This creates a unique constraint on the DEPARTMENT table called UQ_DeptName. It consists of the column DeptName.' }],
        ['code', 'CREATE TABLE DEPARTMENT\n(\n  DeptNo Numeric NOT NULL,\n  DeptName Varchar(20),\n  CONSTRAINT UQ_DeptName UNIQUE (DeptName)\n)', { cap: 'Creating unique constraints on CREATE TABLE: table level' }],
        ['code', 'ALTER TABLE EMPLOYEE\nADD CONSTRAINT UQ_EmpName\nUNIQUE (LName, FName, MName)', { cap: 'Creating unique constraints on ALTER TABLE. This one covers a combination of three columns.' }],
        ['h', 'Default constraints'],
        ['p', 'A DEFAULT constraint enables you to define the value that will be supplied for a column whenever a user fails to enter a value.'],
        ['code', 'CREATE TABLE SUBJECT\n(\n  SubjectID NUMERIC NOT NULL,\n  SubjectCode CHAR(10) NOT NULL,\n  SubjectDescription VARCHAR(50),\n  NoUnit NUMERIC NOT NULL DEFAULT 3\n)', { cap: 'Creating default constraints on CREATE TABLE. If the user fails to specify a value for the NoUnit column, it will have a value of 3.' }],
        ['code', 'ALTER TABLE SUBJECT\nADD CONSTRAINT DF_Unit DEFAULT 3 FOR NoUnit', { cap: 'Creating default constraints on ALTER TABLE' }],
        ['h', 'Check constraints'],
        ['list', ['A CHECK constraint is used to enforce domain integrity by restricting the values allowed in a column to specific values.', 'A CHECK constraint contains a Boolean expression that causes the database to evaluate whether the value of an inserted or updated record matches the criteria of the CHECK constraint.', 'If the value is not within the allowed set of values, SQL Server will raise an error.']],
        ['code', 'CREATE TABLE PRODUCT\n(\n  ProductID NUMERIC NOT NULL,\n  ProductDescription VARCHAR(50),\n  UnitPrice MONEY NOT NULL\n    CONSTRAINT CK_UnitPrice CHECK (UnitPrice > 0.00)\n)', { cap: 'Creating check constraints on CREATE TABLE. This creates a check constraint on the PRODUCT table called CK_UnitPrice. It enforces that the UnitPrice value is greater than 0.' }],
        ['code', "ALTER TABLE EMPLOYEE\nADD CONSTRAINT CK_LastName\nCHECK (LastName IN ('Smith', 'Anderson', 'Jones'))", { cap: 'Creating check constraints on ALTER TABLE. This creates a check constraint on the existing EMPLOYEE table called CK_LastName. It ensures that the LastName column only contains the values Smith, Anderson, or Jones.' }],
        ['p', 'The condition inside CHECK is written like a WHERE condition. You can try one on the practice data: the products below are the ones that would **break** `CHECK (UnitPrice > 0.00)` if it were added to Products.'],
        ['demo', 'SELECT ProductName, UnitPrice\nFROM   Products\nWHERE  NOT (UnitPrice > 0.00)', { title: 'Which rows break the check?', after: 'No rows come back. Grandma’s Boysenberry Spread has a NULL price, and NOT (NULL > 0) is unknown, not TRUE. A CHECK constraint lets a row in unless its condition is FALSE, so a NULL passes. Only NOT NULL stops a NULL.' }],
        ['h', 'Viewing a table’s constraints'],
        ['p', 'To list the available constraints on a table, use the command `sp_helpconstraint`.'],
        ['code', "sp_helpconstraint 'table_name'", { cap: 'Syntax. table_name is the table about which constraint information is returned. The table specified must be local to the current database.' }],
        ['code', 'USE northwind\nsp_helpconstraint EMPLOYEE'],
        T(['constraint_type', 'constraint_name', 'constraint_keys'], [['CHECK on column BirthDate', 'CK_Birthdate', '([BirthDate] < getdate())'], ['FOREIGN KEY', 'FK_Employees_Employees', 'ReportsTo REFERENCES Northwind.dbo.Employees (EmployeeID)'], ['PRIMARY KEY (clustered)', 'PK_Employees', 'EmployeeID']]),
        ['h', 'Dropping a constraint'],
        ['p', 'To drop or delete a constraint, alter the table and use the command DROP CONSTRAINT.'],
        ['code', 'ALTER TABLE table_name\nDROP CONSTRAINT constraint_name', { cap: 'Syntax' }],
        ['code', 'ALTER TABLE EMPLOYEE\nDROP CONSTRAINT CK_LastName', { cap: 'This drops the check constraint called CK_LastName on the EMPLOYEE table.' }],
        ['note', 'A constraint cannot be modified or altered. Drop the constraint first, then recreate it.', { label: 'Note' }]
      ],
      quiz: [
        { q: 'How many UNIQUE constraints can a table have?', o: ['More than one', 'Only one', 'None', 'Exactly one per primary key'], a: 0, why: 'You can attach multiple unique constraints, but only one primary key.' },
        { q: 'Which constraint supplies a value whenever a user fails to enter one?', o: ['DEFAULT', 'CHECK', 'UNIQUE', 'FOREIGN KEY'], a: 0, why: 'DEFAULT 3 FOR NoUnit gives NoUnit the value 3.' },
        { q: 'Which constraint enforces **domain** integrity by restricting a column to specific values?', o: ['CHECK', 'UNIQUE', 'PRIMARY KEY', 'FOREIGN KEY'], a: 0, why: 'CHECK holds a Boolean expression that values must meet.' },
        { q: 'Which adds a default of 3 to NoUnit on an existing SUBJECT table?', o: ['ALTER TABLE SUBJECT ADD CONSTRAINT DF_Unit DEFAULT 3 FOR NoUnit', 'ALTER TABLE SUBJECT DEFAULT NoUnit = 3', 'UPDATE SUBJECT SET NoUnit = 3', 'ALTER TABLE SUBJECT ADD DEFAULT (NoUnit, 3)'], a: 0, why: 'DEFAULT value FOR column.' },
        { q: 'Which command lists the constraints on a table?', o: ['sp_helpconstraint', 'sp_rename', 'sp_renamedb', 'SELECT CONSTRAINTS'], a: 0, why: 'sp_helpconstraint returns the type, name and keys of each constraint.' },
        { q: 'How do you change an existing constraint?', o: ['Drop it, then recreate it', 'ALTER CONSTRAINT', 'MODIFY CONSTRAINT', 'sp_rename it'], a: 0, why: 'A constraint cannot be modified or altered.' },
        { q: 'Which keeps UnitPrice above zero?', o: ['CHECK (UnitPrice > 0.00)', 'DEFAULT 0.00', 'UNIQUE (UnitPrice)', 'UnitPrice NOT NULL'], a: 0, why: 'A CHECK constraint tests every inserted or updated value.' }
      ]
    }
  ],
  review: {
    intro: 'Practise Lesson 3. Below are the handout’s guide questions. Answer them in your notebook. Write the ALTER TABLE and CREATE TABLE statements for questions 4 and 5 and run them in SQL Server. This site’s database is read-only, so it cannot check them. Then take the lesson quiz.',
    guide: [
      'What do you call the table that contains the Primary Key in a Foreign Key Constraint?',
      'Why are Foreign Keys important in a database?',
      'What’s the difference between a primary key and a unique key?',
      'Using the tables created in the guide questions of Lesson 2, alter the tables with the following constraints: a. Type must be one of Single, Double, or Family; b. Price must be between 1000 and 10000; c. RoomNo must be between 1 and 100; d. DateFrom and DateTo must be greater than today’s date; e. The same room cannot be double-booked; f. The same guest cannot have overlapping bookings.',
      'Create the following tables: DIRECTOR (DirectorID, DirectorName, DirectorGender); MOVIE (MovieID, MovieTitle, YearReleased, DirectorID, Length, StudioName); REVIEWER (ReviewerID, ReviewerName); RATING (ReviewerID, MovieID, RatingDate, StarsRating). a. Artist_Name, Producer_Name, Film_Year, Part and Start should not be NULL; b. Movie Year must be after 1900; c. Rating stars must be from 1 to 5 only; d. Rating Date must be after 2000 and must not be greater than the current date; e. Director Gender must be M and F value only; f. The length cannot be less than 60 nor more than 250; g. The studio name can only be Disney, Fox, MGM, or Paramount; h. DirectorName and MovieTitle should be unique.'
    ],
    quiz: [
      { q: 'Guide question 1. The table that contains the primary key in a foreign key constraint is the…', o: ['parent table (referenced table)', 'child table', 'dependent table', 'view'], a: 0, why: 'The child table holds the foreign key.' },
      { q: 'Guide question 3. A key difference between a primary key and a unique key is…', o: ['a table can have only one primary key but several unique keys', 'a unique key can never be on more than one column', 'a primary key allows duplicates', 'there is no difference'], a: 0, why: 'Both stop duplicates. A primary key also never allows NULL.' },
      { q: 'Guide question 4a. Which constraint makes Type one of Single, Double, or Family?', o: ["CHECK (Type IN ('Single', 'Double', 'Family'))", "DEFAULT 'Single'", 'UNIQUE (Type)', "CHECK (Type = 'Single' AND Type = 'Double')"], a: 0, why: 'IN lists the allowed values.' },
      { q: 'Guide question 4b. Which constraint keeps Price between 1000 and 10000?', o: ['CHECK (Price BETWEEN 1000 AND 10000)', 'DEFAULT 1000', 'CHECK (Price > 10000)', 'UNIQUE (Price)'], a: 0, why: 'BETWEEN includes both ends.' },
      { q: 'Guide question 4d. Which condition says DateFrom must be greater than today’s date?', o: ['CHECK (DateFrom > GETDATE())', 'CHECK (DateFrom < GETDATE())', 'DEFAULT GETDATE()', 'UNIQUE (DateFrom)'], a: 0, why: 'GETDATE() returns the current date and time.' },
      { q: 'Guide question 5c. Which keeps StarsRating from 1 to 5 only?', o: ['CHECK (StarsRating BETWEEN 1 AND 5)', 'CHECK (StarsRating > 5)', 'DEFAULT 5', 'UNIQUE (StarsRating)'], a: 0, why: 'A CHECK with BETWEEN 1 AND 5.' },
      { q: 'Guide question 5h. Which constraint makes MovieTitle unique?', o: ['UNIQUE (MovieTitle)', 'CHECK (MovieTitle IS NOT NULL)', 'DEFAULT MovieTitle', 'FOREIGN KEY (MovieTitle)'], a: 0, why: 'MOVIE already has MovieID as its primary key, so use UNIQUE.' },
      { q: 'In RATING (ReviewerID, MovieID, …), MovieID should be a FOREIGN KEY that references…', o: ['MOVIE (MovieID)', 'REVIEWER (ReviewerID)', 'DIRECTOR (DirectorID)', 'RATING (MovieID)'], a: 0, why: 'Every rating must be for a movie that exists.' }
    ]
  }
};

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
        { q: 'Projection removes the rows that do not meet a condition.', o: ['True', 'False'], a: 1, why: 'That is selection. Projection works on columns.' },
        { q: 'Projection: show only the `LastName` and `City` columns of every employee.', a: 'SELECT LastName, City FROM Employees', why: 'You chose two columns, so this is projection. Every row is still there.' },
        { q: 'Projection again: show the `CompanyName` and `Country` of every customer.', a: 'SELECT CompanyName, Country FROM Customers' }
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
        { q: 'You write `SELECT Title, LastName FROM Employees`. In what order do the columns appear?', o: ['Title, then LastName', 'LastName, then Title', 'The order they have in the table', 'Alphabetical order'], a: 0, why: 'The columns appear in the order you list them in the SELECT clause.' },
        { q: 'Show every column of the Categories table. Use the asterisk.', a: 'SELECT * FROM Categories', need: ['*'] },
        { q: 'Show the `CompanyName`, `City` and `Country` of every supplier, in that order.', a: 'SELECT CompanyName, City, Country FROM Suppliers' },
        { q: 'Show the title, then the first name, of every employee.', a: 'SELECT Title, FirstName FROM Employees', why: 'The columns come out in the order you list them.' }
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
        { q: 'What is the result of dividing a number by NULL?', o: ['NULL', '0', 'An error', '1'], a: 0, why: 'The answer is NULL (unknown). Only dividing by zero gives an error.' },
        { q: 'Show `ProductName`, `UnitPrice`, and the price after taking off 5 (`UnitPrice` minus 5).', a: 'SELECT ProductName, UnitPrice, UnitPrice - 5 FROM Products', why: 'The product with no price gives NULL, because NULL minus 5 is NULL.' },
        { q: 'Show `ProductName` and the value of the stock: `UnitPrice` times `UnitsInStock`.', a: 'SELECT ProductName, UnitPrice * UnitsInStock FROM Products' },
        { q: 'Show `ProductName` and the price plus 2, then multiplied by 3. The 2 must be added first.', a: 'SELECT ProductName, (UnitPrice + 2) * 3 FROM Products', why: 'Without parentheses, `2 * 3` would be worked out first.' }
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
        { q: 'In `fname = firstname`, what is `fname`?', o: ['An alias for firstname', 'A table', 'A condition', 'A function'], a: 0, why: 'The equals sign form gives the column the heading on the left.' },
        { q: 'Show `ProductName` and `UnitPrice` times 2. Name the second column **Double Price**.', a: "SELECT ProductName, UnitPrice * 2 AS 'Double Price' FROM Products", headers: true, why: 'The alias has a space, so it needs quotes or square brackets.' },
        { q: 'Show one column named **Full Name**: the first name, a space, then the last name of each employee.', a: "SELECT FirstName + ' ' + LastName AS 'Full Name' FROM Employees", headers: true },
        { q: 'Show one column named **Location** for every customer: the city, a comma and a space, then the country (like “Berlin, Germany”).', a: "SELECT City + ', ' + Country AS Location FROM Customers", headers: true }
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
        { q: 'With `SELECT DISTINCT Title, City`, DISTINCT checks…', o: ['the combination of Title and City', 'Title only', 'City only', 'every column in the table'], a: 0, why: 'It works on the selected columns together.' },
        { q: 'Show each different city in the Employees table, once.', a: 'SELECT DISTINCT City FROM Employees', need: ['DISTINCT'] },
        { q: 'Show each different pair of `Country` and `City` in the Suppliers table.', a: 'SELECT DISTINCT Country, City FROM Suppliers', need: ['DISTINCT'] },
        { q: 'Show each different `CategoryID` used in the Products table.', a: 'SELECT DISTINCT CategoryID FROM Products', need: ['DISTINCT'] }
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
      { q: 'Which alias needs quotes or square brackets?', o: ['Hire Date', 'HireDate', 'Cost', 'NewPrice'], a: 0, why: 'It contains a space.' },
      { q: 'Show each different employee title once, with the heading **Job**.', a: 'SELECT DISTINCT Title AS Job FROM Employees', headers: true, need: ['DISTINCT'] },
      { q: 'Show `ProductName` and `UnitPrice` plus 10. Name the second column **New Price**.', a: "SELECT ProductName, UnitPrice + 10 AS 'New Price' FROM Products", headers: true },
      { q: 'Show one column named **Contact** for every supplier: the contact name, a space, then the contact title in brackets, like “Charlotte Cooper (Purchasing Manager)”.', a: "SELECT ContactName + ' (' + ContactTitle + ')' AS Contact FROM Suppliers", headers: true }
    ]
  },
  exam: {
    intro: 'Every question here asks you to type the full query, as in the final exam. Run it as often as you like, then press Check answer. A question scores only if you get it right before you open the model answer.',
    qs: [
      { q: 'Show all the columns and rows of the Region table.', a: 'SELECT * FROM Region', need: ['*'] },
      { q: 'Show the employee ID, first name, last name and city of every employee, in that order.', a: 'SELECT EmployeeID, FirstName, LastName, City FROM Employees' },
      { q: 'Show the product name, unit price, units in stock, and the price times the units in stock with the heading **Stock Value**.', a: "SELECT ProductName, UnitPrice, UnitsInStock, UnitPrice * UnitsInStock AS 'Stock Value' FROM Products", headers: true },
      { q: 'Show each different country in the Customers table.', a: 'SELECT DISTINCT Country FROM Customers', need: ['DISTINCT'] },
      { q: 'Show the company name and phone of every supplier, with the headings **Supplier** and **Phone Number**.', a: "SELECT CompanyName AS Supplier, Phone AS 'Phone Number' FROM Suppliers", headers: true },
      { q: 'Show one column named **Employee** with the title of courtesy, first name and last name, separated by spaces (like “Ms. Nancy Davolio”).', a: "SELECT TitleOfCourtesy + ' ' + FirstName + ' ' + LastName AS Employee FROM Employees", headers: true },
      { q: 'Show the product name and the price increased by 15% (`UnitPrice` × 1.15), with the heading **New Price**.', a: "SELECT ProductName, UnitPrice * 1.15 AS 'New Price' FROM Products", headers: true },
      { q: 'Show each different pair of title and country in the Employees table.', a: 'SELECT DISTINCT Title, Country FROM Employees', need: ['DISTINCT'] },
      { q: 'Show the product name, units in stock, units on order, and the two added together with the heading **Total Units**.', a: "SELECT ProductName, UnitsInStock, UnitsOnOrder, UnitsInStock + UnitsOnOrder AS 'Total Units' FROM Products", headers: true }
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
        { q: 'A WHERE clause can use an alias created in the SELECT clause.', o: ['True', 'False'], a: 1, why: 'WHERE runs before SELECT, so it cannot see aliases. ORDER BY runs after, so it can.' },
        { q: 'Show the `CompanyName` and `City` of customers in Germany.', a: "SELECT CompanyName, City FROM Customers WHERE Country = 'Germany'", need: ['WHERE'] },
        { q: 'Show the `ProductName` and `UnitPrice` of products that cost less than 10.', a: 'SELECT ProductName, UnitPrice FROM Products WHERE UnitPrice < 10', need: ['WHERE'] },
        { q: 'Show the `LastName` and `HireDate` of employees hired on or after January 1, 1994.', a: "SELECT LastName, HireDate FROM Employees WHERE HireDate >= '01-01-1994'", need: ['WHERE'], why: 'Dates go in single quotes. `>=` keeps January 1 itself.' }
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
        { q: 'Which operator is a short way to write several OR tests on one column?', o: ['IN', 'LIKE', 'BETWEEN', 'IS'], a: 0, why: '`City IN (\'A\', \'B\')` means City = \'A\' OR City = \'B\'.' },
        { q: 'Use BETWEEN. Show the `ProductName` and `UnitPrice` of products priced from 20 to 30, both included.', a: 'SELECT ProductName, UnitPrice FROM Products WHERE UnitPrice BETWEEN 20 AND 30', need: ['BETWEEN'] },
        { q: 'Use LIKE. Show the `LastName` of employees whose last name begins with the letter D.', a: "SELECT LastName FROM Employees WHERE LastName LIKE 'D%'", need: ['LIKE'] },
        { q: 'Show the `ProductName` of every product that has no unit price.', a: 'SELECT ProductName FROM Products WHERE UnitPrice IS NULL', need: ['IS NULL'], why: '`= NULL` never matches. Use IS NULL.' }
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
        { q: 'Which is a valid way to write the opposite of IN?', o: ["City NOT IN ('London')", "City IN NOT ('London')", "NOT City ('London')", "City != IN ('London')"], a: 0, why: 'NOT goes before IN, BETWEEN or LIKE.' },
        { q: 'Show the `LastName`, `Title` and `Country` of employees who are Sales Representatives **and** live in the UK.', a: "SELECT LastName, Title, Country FROM Employees WHERE Title = 'Sales Representative' AND Country = 'UK'", need: ['AND'] },
        { q: 'Show the `ProductName`, `CategoryID` and `UnitPrice` of products that are in category 1 or 2 **and** cost more than 30. Watch the precedence.', a: 'SELECT ProductName, CategoryID, UnitPrice FROM Products WHERE (CategoryID = 1 OR CategoryID = 2) AND UnitPrice > 30', why: 'Without parentheses, AND goes first, and every product in category 1 would be kept whatever its price.' },
        { q: 'Use NOT LIKE. Show the `ProductName` of products whose name does not begin with C.', a: "SELECT ProductName FROM Products WHERE ProductName NOT LIKE 'C%'", need: ['NOT LIKE'] }
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
        { q: 'What does this do?', code: 'ORDER BY FirstName, Title DESC', o: ['Sorts by FirstName A to Z, then ties by Title Z to A', 'Sorts by Title only', 'Sorts both columns Z to A', 'It is an error'], a: 0, why: 'DESC applies only to the column it follows.' },
        { q: 'Show the `LastName` and `BirthDate` of every employee, youngest first.', a: 'SELECT LastName, BirthDate FROM Employees ORDER BY BirthDate DESC', ordered: true, need: ['ORDER BY'], why: 'The youngest has the latest birth date, so sort the dates in descending order.' },
        { q: 'Show the `CompanyName`, `Country` and `City` of every customer, sorted by country, then city, then company name.', a: 'SELECT CompanyName, Country, City FROM Customers ORDER BY Country, City, CompanyName', ordered: true, need: ['ORDER BY'] },
        { q: 'Show `ProductName` and `UnitPrice` × `UnitsInStock` with the heading **StockValue**. Sort by that alias, largest first, then by product name.', a: 'SELECT ProductName, UnitPrice * UnitsInStock AS StockValue FROM Products ORDER BY StockValue DESC, ProductName', ordered: true, headers: true, need: ['ORDER BY StockValue'], why: 'ORDER BY runs after SELECT, so it can use the alias.' }
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
      { q: 'In what order does SQL evaluate these, first to last?', o: ['Comparisons, NOT, AND, OR', 'OR, AND, NOT, comparisons', 'AND, OR, NOT, comparisons', 'NOT, comparisons, OR, AND'], a: 0, why: 'This is the rule of precedence. Parentheses override it.' },
      { q: 'Show the `ProductName` and `UnitPrice` of products in category 3 that cost less than 15, cheapest first, then by name.', a: 'SELECT ProductName, UnitPrice FROM Products WHERE CategoryID = 3 AND UnitPrice < 15 ORDER BY UnitPrice, ProductName', ordered: true },
      { q: 'Show the `FirstName` and `LastName` of employees whose first name contains “an” anywhere.', a: "SELECT FirstName, LastName FROM Employees WHERE FirstName LIKE '%an%'", need: ['LIKE'] },
      { q: 'Show the `LastName` and `ReportsTo` of every employee who **has** a manager, in alphabetical order by last name.', a: 'SELECT LastName, ReportsTo FROM Employees WHERE ReportsTo IS NOT NULL ORDER BY LastName', ordered: true, need: ['IS NOT NULL'] }
    ]
  },
  exam: {
    intro: 'Every question here asks you to type the full query, as in the final exam. Run it as often as you like, then press Check answer. A question scores only if you get it right before you open the model answer. Dates are written month-day-year, like `\'12-31-2007\'`.',
    qs: [
      { q: 'Show the company name and contact name of every supplier in Japan.', a: "SELECT CompanyName, ContactName FROM Suppliers WHERE Country = 'Japan'" },
      { q: 'Use BETWEEN. Show the product name and unit price of products priced from 10 to 20, cheapest first, then by name.', a: 'SELECT ProductName, UnitPrice FROM Products WHERE UnitPrice BETWEEN 10 AND 20 ORDER BY UnitPrice, ProductName', ordered: true, need: ['BETWEEN'] },
      { q: 'Show the order ID and order date of every order placed in December 2007.', a: "SELECT OrderID, OrderDate FROM Orders WHERE OrderDate BETWEEN '12-01-2007' AND '12-31-2007'" },
      { q: 'Use IN. Show the company name and city of customers in Berlin, London or Madrid.', a: "SELECT CompanyName, City FROM Customers WHERE City IN ('Berlin', 'London', 'Madrid')", need: ['IN'] },
      { q: 'Show the last name of employees whose last name ends with the letter N.', a: "SELECT LastName FROM Employees WHERE LastName LIKE '%n'", need: ['LIKE'] },
      { q: 'Use NOT IN. Show the product name and category ID of products that are not in category 1, 2 or 3.', a: 'SELECT ProductName, CategoryID FROM Products WHERE CategoryID NOT IN (1, 2, 3)', need: ['NOT IN'] },
      { q: 'Show the last name, title and city of employees who are **not** Sales Representatives and who live in Seattle or London.', a: "SELECT LastName, Title, City FROM Employees WHERE Title <> 'Sales Representative' AND (City = 'Seattle' OR City = 'London')" },
      { q: 'Show the product name and unit price of products in category 8, with the headings **Product** and **Price**. Sort by Price, highest first.', a: 'SELECT ProductName AS Product, UnitPrice AS Price FROM Products WHERE CategoryID = 8 ORDER BY Price DESC', ordered: true, headers: true },
      { q: 'Show the first name, last name and hire date of employees hired in 1993, the most recent hire first, then by last name.', a: "SELECT FirstName, LastName, HireDate FROM Employees WHERE HireDate BETWEEN '01-01-1993' AND '12-31-1993' ORDER BY HireDate DESC, LastName", ordered: true }
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
        { q: 'Functions that give one result per group of rows are called…', o: ['multiple-row functions', 'single-row functions', 'aliases', 'literals'], a: 0, why: 'Multiple-row functions work on groups.' },
        { q: 'Show each employee’s `LastName` and the number of letters in it, with the heading **Letters**.', a: 'SELECT LastName, LEN(LastName) AS Letters FROM Employees', headers: true, need: ['LEN'] },
        { q: 'Show the name of every product in capital letters.', a: 'SELECT UPPER(ProductName) FROM Products', need: ['UPPER'] }
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
        { q: 'A function placed inside another function is…', o: ['nested', 'joined', 'aliased', 'sorted'], a: 0, why: 'For example `UPPER(LEFT(LastName, 3))`.' },
        { q: 'Show each employee’s last name in small letters and first name in capital letters.', a: 'SELECT LOWER(LastName), UPPER(FirstName) FROM Employees', need: ['LOWER', 'UPPER'] },
        { q: 'Use a function in WHERE. Show the `LastName` of employees whose last name is longer than 7 letters.', a: 'SELECT LastName FROM Employees WHERE LEN(LastName) > 7', need: ['LEN'] },
        { q: 'Show the first two letters of each first name in capitals, with the heading **Initials**. Nest one function inside another.', a: 'SELECT UPPER(LEFT(FirstName, 2)) AS Initials FROM Employees', headers: true, need: ['UPPER', 'LEFT'] }
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
        { q: 'What does this return?', code: "SELECT REPLACE('abcdefghicde', 'cde', 'xxx')", o: ['abxxxfghixxx', 'abxxxfghicde', 'xxxabfghixxx', 'abcdefghixxx'], a: 0, why: 'REPLACE changes **all** matches, so both “cde” parts change.' },
        { q: 'Use LEFT. Show each supplier’s `CompanyName` and its first 5 characters.', a: 'SELECT CompanyName, LEFT(CompanyName, 5) FROM Suppliers', need: ['LEFT'] },
        { q: 'Show each different job title with the word “Sales” replaced by “Selling”.', a: "SELECT DISTINCT REPLACE(Title, 'Sales', 'Selling') FROM Employees", need: ['REPLACE', 'DISTINCT'] },
        { q: 'Show each `LastName` and the position of the first letter “a” in it.', a: "SELECT LastName, CHARINDEX('a', LastName) FROM Employees", need: ['CHARINDEX'], why: 'A name with no “a” gives 0.' }
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
        { q: 'What does `ROUND(748.58, -2)` return?', o: ['700', '750', '748', '800'], a: 0, why: 'A length of -2 rounds to the nearest hundred.' },
        { q: 'Show `ProductName` and `UnitPrice` rounded to a whole number, with the heading **Rounded**.', a: 'SELECT ProductName, ROUND(UnitPrice, 0) AS Rounded FROM Products', headers: true, need: ['ROUND'] },
        { q: 'For products in category 2, show `ProductName`, `UnitPrice`, and the price rounded up to the next whole number with the heading **Up**.', a: 'SELECT ProductName, UnitPrice, CEILING(UnitPrice) AS Up FROM Products WHERE CategoryID = 2', headers: true, need: ['CEILING'] },
        { q: 'Use POWER. Show 5 raised to the power of 3.', a: 'SELECT POWER(5, 3)', need: ['POWER'] }
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
        { q: 'What does this return?', code: "SELECT DATEDIFF(yy, '1992-12-31', '1993-01-01')", o: ['1', '0', '2', '365'], a: 0, why: 'DATEDIFF counts boundaries crossed. One day apart, but the year boundary (January 1) is crossed once.' },
        { q: 'Show `LastName`, `HireDate`, and the date one year after hire with the heading **Anniversary**.', a: 'SELECT LastName, HireDate, DATEADD(yy, 1, HireDate) AS Anniversary FROM Employees', headers: true, need: ['DATEADD'] },
        { q: 'Show `LastName` and the year each employee was hired, as a number, with the heading **Hire Year**.', a: "SELECT LastName, YEAR(HireDate) AS 'Hire Year' FROM Employees", headers: true, why: '`DATEPART(yyyy, HireDate)` works too.' },
        { q: 'Use DATENAME. Show `LastName` and the name of the month each employee was born in, with the heading **Birth Month**.', a: "SELECT LastName, DATENAME(mm, BirthDate) AS 'Birth Month' FROM Employees", headers: true, need: ['DATENAME'] }
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
        { q: 'What does this return?', code: "SELECT CONVERT(varchar(20), '1948-12-08', 3)", o: ['08/12/48', '12/08/48', '48/12/08', '1948-12-08'], a: 0, why: 'Style 3 is dd/mm/yy.' },
        { q: 'For products in category 1, show one column named **Info** with text like “Chai costs 18.00”.', a: "SELECT ProductName + ' costs ' + CAST(UnitPrice AS VARCHAR(20)) AS Info FROM Products WHERE CategoryID = 1", headers: true, why: 'UnitPrice is money, so it must be converted to text before `+` can join it.' },
        { q: 'Use CONVERT with a style. Show `LastName` and the birth date as dd/mm/yy, with the heading **Born**.', a: 'SELECT LastName, CONVERT(varchar(20), BirthDate, 3) AS Born FROM Employees', headers: true, need: ['CONVERT'] },
        { q: 'Show one column named **Emp** with the employee ID, a colon and a space, then the last name (like “1: Davolio”).', a: "SELECT CAST(EmployeeID AS VARCHAR(10)) + ': ' + LastName AS Emp FROM Employees", headers: true, why: 'EmployeeID is a number. Convert it to text first.' }
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
      { q: 'What does this return?', code: "SELECT DATEPART(mm, '1992-05-01')", o: ['5', 'May', '1992', '1'], a: 0, why: 'DATEPART gives a number. DATENAME would give “May”.' },
      { q: 'Use DATEDIFF. Show `LastName` and the number of year boundaries between the birth date and the hire date, with the heading **Age At Hire**.', a: "SELECT LastName, DATEDIFF(yy, BirthDate, HireDate) AS 'Age At Hire' FROM Employees", headers: true, need: ['DATEDIFF'] },
      { q: 'Show the `ProductName` and `UnitPrice` of products whose name is longer than 25 characters.', a: 'SELECT ProductName, UnitPrice FROM Products WHERE LEN(ProductName) > 25', need: ['LEN'] },
      { q: 'Show one column named **Name**: the last name in capitals, a comma and a space, then the first name (like “DAVOLIO, Nancy”). Sort by last name.', a: "SELECT UPPER(LastName) + ', ' + FirstName AS Name FROM Employees ORDER BY LastName", headers: true, ordered: true, need: ['UPPER'] }
    ]
  },
  exam: {
    intro: 'Every question here asks you to type the full query, as in the final exam. Run it as often as you like, then press Check answer. A question scores only if you get it right before you open the model answer.',
    qs: [
      { q: 'Use RIGHT. Show each `LastName` and its last three letters, with the heading **Ending**.', a: 'SELECT LastName, RIGHT(LastName, 3) AS Ending FROM Employees', headers: true, need: ['RIGHT'] },
      { q: 'Show the company name of every supplier and the number of characters in it, but only where it is longer than 25 characters.', a: 'SELECT CompanyName, LEN(CompanyName) FROM Suppliers WHERE LEN(CompanyName) > 25', need: ['LEN'] },
      { q: 'Show `ProductName`, `UnitPrice`, and the price rounded to the nearest ten with the heading **Nearest Ten**.', a: "SELECT ProductName, UnitPrice, ROUND(UnitPrice, -1) AS 'Nearest Ten' FROM Products", headers: true, need: ['ROUND'] },
      { q: 'For products in category 4, show `ProductName` and the price rounded down to a whole number, with the heading **Whole Dollars**.', a: "SELECT ProductName, FLOOR(UnitPrice) AS 'Whole Dollars' FROM Products WHERE CategoryID = 4", headers: true, need: ['FLOOR'] },
      { q: "For the orders of customer `'ALFKI'`, show the order ID, the order date, and the date 7 days later with the heading **Due Date**.", a: "SELECT OrderID, OrderDate, DATEADD(dd, 7, OrderDate) AS 'Due Date' FROM Orders WHERE CustomerID = 'ALFKI'", headers: true, need: ['DATEADD'] },
      { q: 'Show `LastName`, `HireDate`, and the number of month boundaries from the hire date to January 1, 2000, with the heading **Months**.', a: "SELECT LastName, HireDate, DATEDIFF(mm, HireDate, '01-01-2000') AS Months FROM Employees", headers: true, need: ['DATEDIFF'] },
      { q: 'For products that cost more than 50, show one column named **Products Price** with text like “Mishi Kobe Niku costs $97.00”.', a: "SELECT ProductName + ' costs $' + CAST(UnitPrice AS VARCHAR(20)) AS 'Products Price' FROM Products WHERE UnitPrice > 50", headers: true },
      { q: 'Use CONVERT. Show `LastName` and the hire date as mm/dd/yy with the heading **Hired**. Sort by hire date, then by last name.', a: 'SELECT LastName, CONVERT(varchar(20), HireDate, 1) AS Hired FROM Employees ORDER BY HireDate, LastName', headers: true, ordered: true, need: ['CONVERT'] },
      { q: 'Show one column named **Name** (first name, a space, last name) and the month name of the birth date named **Month**, for employees born in months 1 to 6.', a: "SELECT FirstName + ' ' + LastName AS Name, DATENAME(mm, BirthDate) AS Month FROM Employees WHERE MONTH(BirthDate) <= 6", headers: true }
    ]
  }
};

export const LESSONS = [L2, L3, L4, L5, L6];
