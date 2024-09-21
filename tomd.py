import os  
import json  

def json_to_md(folder_path, output_folder):  
    # 确保输出文件夹存在  
    os.makedirs(output_folder, exist_ok=True)  

    # 遍历文件夹中的所有 JSON 文件  
    for filename in os.listdir(folder_path):  
        if filename.endswith('.json'):  
            file_path = os.path.join(folder_path, filename)  
            
            # 读取 JSON 文件  
            with open(file_path, 'r') as file:  
                try:  
                    data = json.load(file)  
                    print(data)
                    # 拼接所有键值为一个字符串  
                    mode = data["mode"]
                    if(mode=="C"):
                        mode = "A1"
                    if(mode=="A3/A4"):
                        mode = "A3"

                    option = ""
                    for i in data["option"]:
                        option = option + i + "\n"
                    
                    unit = data["unit"].replace(' ','-')
                    unit = unit.replace("\xa0","-")
                    markdown_content = f"""---
class: {data["cls"]}
mode: {mode}
tags:
  - 真题
  - 医考帮
  - {unit}
---

# Q
{data["test"]}
{option}
# A
{data["answer"]}
# D
```ad-note
title:课本出处
collapse:false
{data["point"]}
```

```ad-summary
title:解析
collapse:false
{data["discuss"]}
```

"""

                    # 创建 Markdown 文件名  
                    md_filename = f"{os.path.splitext(filename)[0]}.md"  
                    md_file_path = os.path.join(output_folder, md_filename)  
                    
                    # 保存拼接的字符串到 Markdown 文件  
                    with open(md_file_path, 'w') as md_file:  
                        md_file.write(markdown_content)  
                    
                    print(f"已保存: {md_file_path}")  
                except json.JSONDecodeError:  
                    print(f"无法解析文件: {filename}")  

# 示例用法  
folder_path = './tests'  # 替换为您的 JSON 文件夹路径  
output_folder = './md'  # 替换为您希望保存 Markdown 文件的文件夹路径  
json_to_md(folder_path, output_folder)