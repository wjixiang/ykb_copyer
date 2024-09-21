import os  
import json  

def remove_duplicate_json_files(folder_path):  
    # 用于存储唯一的 "test" 值  
    unique_test_values = {}  
    
    # 遍历文件夹中的所有文件  
    for filename in os.listdir(folder_path):  
        if filename.endswith('.json'):  
            file_path = os.path.join(folder_path, filename)  
            
            # 读取 JSON 文件  
            with open(file_path, 'r') as file:  
                try:  
                    data = json.load(file)  
                    test_value = data.get('test')  
                    
                    # 检查 "test" 值是否已存在  
                    if test_value in unique_test_values:  
                        # 如果存在，删除该文件  
                        os.remove(file_path)  
                        print(f"删除重复文件: {filename}")  
                    else:  
                        # 如果不存在，记录该值并保留文件  
                        unique_test_values[test_value] = filename  
                        # 可选：重命名保留的文件  
                        new_filename = f"{filename}"  
                        new_file_path = os.path.join(folder_path, new_filename)  
                        os.rename(file_path, new_file_path)  
                        print(f"保留文件并重命名: {new_filename}")  
                except json.JSONDecodeError:  
                    print(f"无法解析文件: {filename}")  

# 示例用法  
folder_path = './tests'  # 替换为您的文件夹路径  
remove_duplicate_json_files(folder_path)