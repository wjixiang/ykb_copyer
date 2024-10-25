import os  
import json  
import re  

def clean_json_file(file_path):  
    try:  
        # 读取文件内容  
        with open(file_path, 'r', encoding='utf-8') as file:  
            content = file.read()  

        # 使用正则表达式找到所有完整的JSON对象  
        # 匹配以 { 开始，} 结束的内容  
        json_objects = re.findall(r'({[^{]*})', content)  

        if json_objects:  
            # 只保留第一个JSON对象  
            first_json = json_objects[0]  
            
            try:  
                # 验证JSON格式是否正确  
                parsed_json = json.loads(first_json)  
                
                # 将清理后的JSON写回文件  
                with open(file_path, 'w', encoding='utf-8') as file:  
                    json.dump(parsed_json, file, ensure_ascii=False, indent=2)  
                
                print(f"成功清理文件: {file_path}")  
                
            except json.JSONDecodeError as e:  
                print(f"JSON解析错误 {file_path}: {e}")  
        else:  
            print(f"未找到有效的JSON对象 {file_path}")  
            
    except Exception as e:  
        print(f"处理文件时出错 {file_path}: {e}")  

def process_directory(directory_path):  
    # 遍历指定目录下的所有文件  
    for root, _, files in os.walk(directory_path):  
        for file in files:  
            if file.endswith('.json'):  
                file_path = os.path.join(root, file)  
                clean_json_file(file_path)  

if __name__ == "__main__":  
    # 指定要处理的目录路径  
    directory_path = "./undefined"  # 替换为您的实际路径  
    
    # 确认目录是否存在  
    if os.path.exists(directory_path):  
        process_directory(directory_path)  
    else:  
        print(f"目录不存在: {directory_path}")