import os
import json

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  

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

if __name__ == "__main__":
    source_folder = os.path.join(PROJECT_ROOT, "tests_json_vault")
    delete_empty_json_files(source_folder)