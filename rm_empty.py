import os  
import json  

def delete_empty_json_files(directory):  
    # 遍历指定目录  
    for filename in os.listdir(directory):  
        # 检查文件是否为JSON文件  
        if filename.endswith('.json'):  
            file_path = os.path.join(directory, filename)  
            # 检查文件大小  
            if os.path.getsize(file_path) == 0:  
                print(f"Deleting empty file: {file_path}")  
                os.remove(file_path)  
            else:  
                # 尝试加载JSON文件以检查是否为空  
                try:  
                    with open(file_path, 'r') as file:  
                        data = json.load(file)  
                        if not data:  # 如果数据为空  
                            print(f"Deleting empty JSON content file: {file_path}")  
                            os.remove(file_path)  
                except json.JSONDecodeError:  
                    print(f"File is not a valid JSON: {file_path}")  

# 指定目录路径  
source_folder = './tests'  # 替换为源文件夹路径  
delete_empty_json_files(source_folder)