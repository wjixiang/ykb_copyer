import os  
import shutil  

def move_md_files_with_string(source_folder, destination_folder, search_string):  
    # 确保目标文件夹存在  
    os.makedirs(destination_folder, exist_ok=True)  

    # 遍历源文件夹中的所有文件  
    for filename in os.listdir(source_folder):  
        if filename.endswith('.md'):  # 只处理 .md 文件  
            file_path = os.path.join(source_folder, filename)  
            try:  
                with open(file_path, 'r', encoding='utf-8') as file:  
                    content = file.read()  
                    if search_string in content:  # 检查是否包含指定字符串  
                        # 移动文件到目标文件夹  
                        shutil.move(file_path, os.path.join(destination_folder, filename))  
                        print(f"移动文件: {filename} 到 {destination_folder}")  
            except Exception as e:  
                print(f"处理文件 {filename} 时出错: {e}")  

# 使用示例  
source_folder = '/Users/a123/Obsidian Vault/test_bank'  # 替换为源文件夹路径  
destination_folder = './backup'  # 替换为目标文件夹路径  
search_string = '医考帮'  

#move_md_files_with_string(source_folder, destination_folder, search_string)