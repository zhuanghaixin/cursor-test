#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sqlite3
import pandas as pd

def query_students_over_18():
    """
    查询年龄大于18岁的学生信息并导出为Excel
    """
    # 连接到数据库（如果不存在则创建）
    conn = sqlite3.connect('students.db')
    cursor = conn.cursor()
    
    # 创建学生表（如果不存在）
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        grade TEXT
    )
    ''')
    
    # 插入一些示例数据（实际应用中可能已有数据）
    sample_data = [
        (1, '张三', 16, '高一'),
        (2, '李四', 17, '高二'),
        (3, '王五', 18, '高三'),
        (4, '赵六', 19, '大一'),
        (5, '钱七', 20, '大二'),
    ]
    
    cursor.executemany('INSERT OR IGNORE INTO students VALUES (?, ?, ?, ?)', sample_data)
    conn.commit()
    
    # 执行查询：查找年龄大于18的学生
    sql_query = '''
    SELECT * FROM students WHERE age > 18
    '''
    
    cursor.execute(sql_query)
    results = cursor.fetchall()
    
    # 打印结果
    print("年龄大于18岁的学生信息：")
    print("ID\t姓名\t年龄\t年级")
    for student in results:
        print(f"{student[0]}\t{student[1]}\t{student[2]}\t{student[3]}")
    
    # 将结果转换为DataFrame并导出为Excel
    columns = ['ID', '姓名', '年龄', '年级']
    df = pd.DataFrame(results, columns=columns)
    excel_file = 'students_over_18.xlsx'
    df.to_excel(excel_file, index=False)
    print(f"\nExcel文件已保存: {excel_file}")
    
    # 关闭连接
    conn.close()
    
    return results

if __name__ == "__main__":
    query_students_over_18() 