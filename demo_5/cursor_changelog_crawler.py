import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import re

def extract_version(text):
    # 提取版本号的正则表达式模式
    patterns = [
        r'v?(\d+\.\d+\.\d+(?:-[a-zA-Z]+)?)',  # 标准版本号
        r'(\d+\.\d+\.\d+)-nightly',            # nightly版本
        r'VS Code (\d+\.\d+\.\d+)',            # VS Code版本
        r'v(\d+\.\d+\.\d+)',                   # v前缀版本
        r'版本 (\d+\.\d+\.\d+)',               # 中文版本号
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None

def crawl_cursor_changelog():
    # 目标URL
    url = 'https://www.cursor.com/changelog'
    
    try:
        # 发送HTTP请求
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # 检查请求是否成功
        
        # 使用BeautifulSoup解析HTML
        soup = BeautifulSoup(response.text, 'lxml')
        
        # 查找所有更新记录
        changelog_items = []
        
        # 获取所有更新条目（使用更简单的选择器）
        articles = soup.find_all(['article', 'div'])
        
        for article in articles:
            item = {}
            
            # 获取标题和版本
            title_element = article.find(['h1', 'h2', 'h3'])
            if title_element:
                title_text = title_element.get_text().strip()
                item['title'] = title_text
                
                # 从标题中提取版本号
                version = extract_version(title_text)
                if version:
                    item['version'] = version
                
                # 提取发布日期
                date_patterns = [
                    r'\((\d{4}-\d{2}-\d{2})\)',           # (2023-03-14)
                    r'(\d{4}-\d{2}-\d{2})',               # 2023-03-14
                    r'(\d{4}\.\d{2}\.\d{2})',             # 2023.03.14
                    r'(\d{2}/\d{2}/\d{4})',               # 03/14/2023
                ]
                
                for pattern in date_patterns:
                    date_match = re.search(pattern, title_text)
                    if date_match:
                        item['release_date'] = date_match.group(1)
                        break
            
            # 获取日期
            date_element = article.find('time')
            if date_element:
                item['date'] = date_element.get_text().strip()
                datetime_attr = date_element.get('datetime')
                if datetime_attr:
                    item['datetime'] = datetime_attr
            
            # 获取内容
            content_element = article.find(['div', 'p'])
            if content_element:
                content_text = content_element.get_text().strip()
                if len(content_text) > 0:  # 只保存非空内容
                    item['content'] = content_text
                    # 如果标题中没有找到版本号，尝试从内容中提取
                    if 'version' not in item:
                        version = extract_version(content_text)
                        if version:
                            item['version'] = version
            
            # 只添加有标题的条目
            if 'title' in item:
                changelog_items.append(item)
        
        # 生成输出文件名（包含时间戳）
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_filename = f'cursor_changelog_{timestamp}.json'
        
        # 将数据保存到JSON文件
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(changelog_items, f, ensure_ascii=False, indent=2)
            
        print(f'爬取完成！数据已保存到 {output_filename}')
        print(f'共爬取到 {len(changelog_items)} 条更新记录')
        
    except requests.RequestException as e:
        print(f'爬取过程中发生错误: {e}')
    except Exception as e:
        print(f'处理数据时发生错误: {e}')

if __name__ == '__main__':
    crawl_cursor_changelog() 