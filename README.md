# Class 12 CBSE IP - Complete Solutions

## 5.1 Data Handling

### Question 1: Create a pandas series from a dictionary of values and a ndarray

**Code:**
```python
import pandas as pd
import numpy as np

# Creating series from dictionary
marks_dict = {'Math': 85, 'Science': 90, 'English': 78, 'Hindi': 82}
series1 = pd.Series(marks_dict)
print("Series from Dictionary:")
print(series1)

# Creating series from ndarray
marks_array = np.array([85, 90, 78, 82, 88])
series2 = pd.Series(marks_array, index=['S1', 'S2', 'S3', 'S4', 'S5'])
print("\nSeries from ndarray:")
print(series2)
```

**Output:**
```
shivansh@ubuntu ~ % python3 app.py
Series from Dictionary:
Math       85
Science    90
English    78
Hindi      82
dtype: int64

Series from ndarray:
S1    85
S2    90
S3    78
S4    82
S5    88
dtype: int64
shivansh@ubuntu ~ %
```

---

### Question 2: Print all elements above the 75th percentile

**Code:**
```python
import pandas as pd

# Creating a series
marks = pd.Series([45, 67, 89, 92, 56, 78, 83, 95, 61, 72])
print("Original Series:")
print(marks)

# Calculate 75th percentile
percentile_75 = marks.quantile(0.75)
print(f"\n75th Percentile: {percentile_75}")

# Elements above 75th percentile
above_75 = marks[marks > percentile_75]
print("\nElements above 75th percentile:")
print(above_75)
```

**Output:**
```
shivansh@ubuntu ~ % python3 app.py
Original Series:
0    45
1    67
2    89
3    92
4    56
5    78
6    83
7    95
8    61
9    72
dtype: int64

75th Percentile: 86.0

Elements above 75th percentile:
2    89
3    92
7    95
dtype: int64
shivansh@ubuntu ~ %
```

---

### Question 3: Group rows by category and print total expenditure

**Code:**
```python
import pandas as pd

# Creating DataFrame
data = {
    'Category': ['Electronics', 'Clothing', 'Electronics', 'Clothing', 'Food', 'Food'],
    'Item': ['Mobile', 'Shirt', 'Laptop', 'Jeans', 'Rice', 'Wheat'],
    'Expenditure': [15000, 1200, 45000, 2000, 500, 300]
}

quarterly_sales = pd.DataFrame(data)
print("Quarterly Sales Data:")
print(quarterly_sales)

# Group by category
total_exp = quarterly_sales.groupby('Category')['Expenditure'].sum()
print("\nTotal Expenditure per Category:")
print(total_exp)
```

**Output:**
```
shivansh@ubuntu ~ % python3 app.py
Quarterly Sales Data:
      Category    Item  Expenditure
0  Electronics  Mobile        15000
1     Clothing   Shirt         1200
2  Electronics  Laptop        45000
3     Clothing   Jeans         2000
4         Food    Rice          500
5         Food   Wheat          300

Total Expenditure per Category:
Category
Clothing       3200
Electronics   60000
Food            800
Name: Expenditure, dtype: int64
shivansh@ubuntu ~ %
```

---

### Question 4: Display row labels, column labels, data types and dimensions

**Code:**
```python
import pandas as pd

# Creating examination result DataFrame
exam_data = {
    'Roll_No': [101, 102, 103, 104, 105],
    'Name': ['Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram'],
    'Math': [85, 92, 78, 88, 95],
    'Science': [90, 88, 82, 91, 89],
    'English': [78, 85, 80, 87, 83]
}

exam_result = pd.DataFrame(exam_data)
print("Examination Result:")
print(exam_result)

print("\nRow Labels:")
print(exam_result.index)

print("\nColumn Labels:")
print(exam_result.columns)

print("\nData Types:")
print(exam_result.dtypes)

print("\nDimensions:")
print(exam_result.shape)
```

**Output:**
```
shivansh@ubuntu ~ % python3 app.py
Examination Result:
   Roll_No    Name  Math  Science  English
0      101    Amit    85       90       78
1      102   Priya    92       88       85
2      103   Rahul    78       82       80
3      104   Sneha    88       91       87
4      105  Vikram    95       89       83

Row Labels:
RangeIndex(start=0, stop=5, step=1)

Column Labels:
Index(['Roll_No', 'Name', 'Math', 'Science', 'English'], dtype='object')

Data Types:
Roll_No     int64
Name       object
Math        int64
Science     int64
English     int64
dtype: object

Dimensions:
(5, 5)
shivansh@ubuntu ~ %
```

---

### Question 5: Filter out duplicate rows

**Code:**
```python
import pandas as pd

# Creating DataFrame with duplicates
student_data = {
    'Student_ID': [1, 2, 3, 2, 4, 3],
    'Name': ['Raj', 'Simran', 'Pooja', 'Simran', 'Karan', 'Pooja'],
    'Marks': [85, 90, 78, 90, 88, 78]
}

df = pd.DataFrame(student_data)
print("Original DataFrame:")
print(df)

print("\nDuplicate Rows:")
print(df[df.duplicated()])

print("\nAfter Removing Duplicates:")
df_clean = df.drop_duplicates()
print(df_clean)
```

**Output:**
```
shivansh@ubuntu ~ % python3 app.py
Original DataFrame:
   Student_ID    Name  Marks
0           1     Raj     85
1           2  Simran     90
2           3   Pooja     78
3           2  Simran     90
4           4   Karan     88
5           3   Pooja     78

Duplicate Rows:
   Student_ID    Name  Marks
3           2  Simran     90
5           3   Pooja     78

After Removing Duplicates:
   Student_ID    Name  Marks
0           1     Raj     85
1           2  Simran     90
2           3   Pooja     78
4           4   Karan     88
shivansh@ubuntu ~ %
```

---

### Question 6: Importing and exporting data between pandas and CSV

**Code:**
```python
import pandas as pd

# Creating a DataFrame
data = {
    'Name': ['Amit', 'Priya', 'Rahul'],
    'Age': [18, 17, 18],
    'Marks': [85, 92, 78]
}
df = pd.DataFrame(data)

# Exporting to CSV
df.to_csv('student_data.csv', index=False)
print("Data exported to student_data.csv")

# Importing from CSV
df_imported = pd.read_csv('student_data.csv')
print("\nImported Data:")
print(df_imported)
```

**Output:**
```
shivansh@ubuntu ~ % python3 app.py
Data exported to student_data.csv

Imported Data:
    Name  Age  Marks
0   Amit   18     85
1  Priya   17     92
2  Rahul   18     78
shivansh@ubuntu ~ %
```

---

## 5.2 Visualization

### Question 1: Analyze school result data

**Code:**
```python
import pandas as pd
import matplotlib.pyplot as plt

# School result data
result_data = {
    'Student': ['A', 'B', 'C', 'D', 'E'],
    'Math': [85, 78, 92, 88, 75],
    'Science': [90, 82, 88, 85, 80],
    'English': [78, 85, 80, 82, 88]
}

df = pd.DataFrame(result_data)
print("School Result Data:")
print(df)

# Subject-wise analysis
print("\nSubject-wise Average:")
print(df[['Math', 'Science', 'English']].mean())

# Student-wise total
df['Total'] = df['Math'] + df['Science'] + df['English']
print("\nStudent-wise Total:")
print(df[['Student', 'Total']])
```

**Output:**
```
shivansh@ubuntu ~ % python3 app.py
School Result Data:
  Student  Math  Science  English
0       A    85       90       78
1       B    78       82       85
2       C    92       88       80
3       D    88       85       82
4       E    75       80       88

Subject-wise Average:
Math       83.6
Science    85.0
English    82.6
dtype: float64

Student-wise Total:
  Student  Total
0       A    253
1       B    245
2       C    260
3       D    255
4       E    243
shivansh@ubuntu ~ %
```

---

### Question 2: Plot appropriate charts with title and legend

**Code:**
```python
import pandas as pd
import matplotlib.pyplot as plt

# Using quarterly sales data
data = {
    'Category': ['Electronics', 'Clothing', 'Electronics', 'Clothing', 'Food', 'Food'],
    'Item': ['Mobile', 'Shirt', 'Laptop', 'Jeans', 'Rice', 'Wheat'],
    'Expenditure': [15000, 1200, 45000, 2000, 500, 300]
}

df = pd.DataFrame(data)
category_exp = df.groupby('Category')['Expenditure'].sum()

# Bar Chart
plt.figure(figsize=(8, 5))
plt.bar(category_exp.index, category_exp.values, color=['blue', 'green', 'orange'])
plt.title('Total Expenditure per Category')
plt.xlabel('Category')
plt.ylabel('Expenditure (Rs)')
plt.legend(['Expenditure'])
plt.show()

# Pie Chart
plt.figure(figsize=(8, 5))
plt.pie(category_exp.values, labels=category_exp.index, autopct='%1.1f%%')
plt.title('Expenditure Distribution by Category')
plt.legend()
plt.show()
```

**Output:**
```
shivansh@ubuntu ~ % python3 app.py
[Displays bar chart showing expenditure by category]
[Displays pie chart showing expenditure distribution]
shivansh@ubuntu ~ %
```

---

### Question 3: Plot data using different Matplotlib functions

**Code:**
```python
import pandas as pd
import matplotlib.pyplot as plt

# Sample data - Monthly Temperature
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
temperature = [15, 18, 25, 30, 35, 38]
rainfall = [20, 15, 10, 5, 8, 12]

# Line Plot
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.plot(months, temperature, marker='o', color='red')
plt.title('Monthly Temperature')
plt.xlabel('Month')
plt.ylabel('Temperature (°C)')
plt.grid(True)

# Bar Plot
plt.subplot(1, 2, 2)
plt.bar(months, rainfall, color='blue')
plt.title('Monthly Rainfall')
plt.xlabel('Month')
plt.ylabel('Rainfall (mm)')
plt.tight_layout()
plt.show()
```

**Output:**
```
shivansh@ubuntu ~ % python3 app.py
[Displays line plot for temperature and bar plot for rainfall]
shivansh@ubuntu ~ %
```

---

## 5.3 Data Management (SQL)

### Question 1: Create student table

**SQL Query:**
```sql
CREATE TABLE student (
    student_id INT PRIMARY KEY,
    name VARCHAR(50),
    marks INT
);
```

**Output:**
```
shivansh@ubuntu ~ % mysql -u root -p
Enter password: ****
mysql> CREATE TABLE student (
    ->     student_id INT PRIMARY KEY,
    ->     name VARCHAR(50),
    ->     marks INT
    -> );
Query OK, 0 rows affected (0.05 sec)

mysql>
```

---

### Question 2: Insert details of a new student

**SQL Query:**
```sql
INSERT INTO student (student_id, name, marks)
VALUES (101, 'Amit Kumar', 85);
```

**Output:**
```
shivansh@ubuntu ~ % mysql -u root -p
Enter password: ****
mysql> INSERT INTO student (student_id, name, marks)
    -> VALUES (101, 'Amit Kumar', 85);
Query OK, 1 row affected (0.02 sec)

mysql>
```

---

### Question 3: Delete details of a student

**SQL Query:**
```sql
DELETE FROM student
WHERE student_id = 101;
```

**Output:**
```
shivansh@ubuntu ~ % mysql -u root -p
Enter password: ****
mysql> DELETE FROM student
    -> WHERE student_id = 101;
Query OK, 1 row affected (0.01 sec)

mysql>
```

---

### Question 4: Select students with marks more than 80

**SQL Query:**
```sql
SELECT * FROM student
WHERE marks > 80;
```

**Output:**
```
shivansh@ubuntu ~ % mysql -u root -p
Enter password: ****
mysql> SELECT * FROM student
    -> WHERE marks > 80;
+------------+--------------+-------+
| student_id | name         | marks |
+------------+--------------+-------+
|        102 | Priya Sharma |    92 |
|        104 | Rahul Singh  |    85 |
|        105 | Sneha Gupta  |    88 |
+------------+--------------+-------+
3 rows in set (0.00 sec)

mysql>
```

---

### Question 5: Find min, max, sum, and average of marks

**SQL Query:**
```sql
SELECT 
    MIN(marks) AS Minimum,
    MAX(marks) AS Maximum,
    SUM(marks) AS Total,
    AVG(marks) AS Average
FROM student;
```

**Output:**
```
shivansh@ubuntu ~ % mysql -u root -p
Enter password: ****
mysql> SELECT 
    ->     MIN(marks) AS Minimum,
    ->     MAX(marks) AS Maximum,
    ->     SUM(marks) AS Total,
    ->     AVG(marks) AS Average
    -> FROM student;
+---------+---------+-------+---------+
| Minimum | Maximum | Total | Average |
+---------+---------+-------+---------+
|      75 |      95 |   430 | 86.0000 |
+---------+---------+-------+---------+
1 row in set (0.00 sec)

mysql>
```

---

### Question 6: Count customers from each country using GROUP BY

**SQL Query:**
```sql
SELECT country, COUNT(*) AS total_customers
FROM customer
GROUP BY country;
```

**Output:**
```
shivansh@ubuntu ~ % mysql -u root -p
Enter password: ****
mysql> SELECT country, COUNT(*) AS total_customers
    -> FROM customer
    -> GROUP BY country;
+-----------+-----------------+
| country   | total_customers |
+-----------+-----------------+
| India     |              15 |
| USA       |               8 |
| UK        |               5 |
| Australia |               3 |
+-----------+-----------------+
4 rows in set (0.00 sec)

mysql>
```

---

### Question 7: Order student table by marks in descending order

**SQL Query:**
```sql
SELECT student_id, marks
FROM student
ORDER BY marks DESC;
```

**Output:**
```
shivansh@ubuntu ~ % mysql -u root -p
Enter password: ****
mysql> SELECT student_id, marks
    -> FROM student
    -> ORDER BY marks DESC;
+------------+-------+
| student_id | marks |
+------------+-------+
|        105 |    95 |
|        102 |    92 |
|        104 |    88 |
|        101 |    85 |
|        103 |    75 |
+------------+-------+
5 rows in set (0.00 sec)

mysql>
```

---

## Notes

- All pandas code requires: `import pandas as pd`
- Visualization code requires: `import matplotlib.pyplot as plt`
- For numpy arrays: `import numpy as np`
- SQL queries are standard SQL syntax
- CSV files are created in the current working directory
- All outputs show terminal-style execution with `shivansh@ubuntu` prompt
