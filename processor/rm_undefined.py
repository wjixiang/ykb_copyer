import os
import json
import shutil

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  

def move_json_files_without_mode(source_folder, destination_folder):  
    # 确保目标文件夹存在  
    os.makedirs(destination_folder, exist_ok=True)  

    # 遍历源文件夹中的所有文件  
    for filename in os.listdir(source_folder):  
        if filename.endswith('.json'):  
            file_path = os.path.join(source_folder, filename)  
            try:  
                # 读取JSON文件  
                with open(file_path, 'r', encoding='utf-8') as file:  
                    data = json.load(file)  

                # 检查是否缺失键名为“mode”  
                if 'mode' not in data:  
                    # 移动文件到目标文件夹  
                    shutil.move(file_path, os.path.join(destination_folder, filename))  
                    print(f'Moved: {filename}')  
            except (json.JSONDecodeError, FileNotFoundError) as e:  
                print(f'Error processing file {filename}: {e}')  

if __name__ == "__main__":
    source_folder = os.path.join(PROJECT_ROOT, "tests_json_vault")
    destination_folder = os.path.join(PROJECT_ROOT, "undefined")
    move_json_files_without_mode(source_folder, destination_folder)