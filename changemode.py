import os  
import json  

def replace_mode_in_json_files(directory):  
    """  
    递归处理指定目录下所有JSON文件中的mode字段  
    
    Args:  
        directory (str): 要处理的目录路径  
    """  
    # 替换规则字典  
    mode_replacements = {  
        "A1型题": "A1",  
        "A2型题": "A2",  
        "A3型题": "A3",  
        "A4型题": "A4",  
        "B型题": "B",  
        "X型题": "X",  
        "单选题": "A1",  
        "多选题": "X"  
    }  

    # 统计处理的文件数量  
    processed_files = 0  
    modified_files = 0  

    # 递归遍历目录  
    for root, dirs, files in os.walk(directory):  
        for file in files:  
            if file.endswith('.json'):  
                file_path = os.path.join(root, file)  
                processed_files += 1  

                try:  
                    # 读取JSON文件  
                    with open(file_path, 'r', encoding='utf-8') as f:  
                        data = json.load(f)  

                    # 检查是否存在mode字段并需要替换  
                    if 'mode' in data and data['mode'] in mode_replacements:  
                        old_mode = data['mode']  
                        new_mode = mode_replacements[old_mode]  
                        data['mode'] = new_mode  
                        modified_files += 1  

                        # 写回文件  
                        with open(file_path, 'w', encoding='utf-8') as f:  
                            json.dump(data, f, ensure_ascii=False, indent=4)  

                        print(f"已处理文件: {file_path}")  
                        print(f"替换: {old_mode} -> {new_mode}")  
                        print("-" * 50)  

                except json.JSONDecodeError as e:  
                    print(f"错误: 无法解析JSON文件 {file_path}")  
                    print(f"错误信息: {str(e)}")  
                    print("-" * 50)  
                except Exception as e:  
                    print(f"处理文件 {file_path} 时发生错误")  
                    print(f"错误信息: {str(e)}")  
                    print("-" * 50)  

    # 打印处理结果  
    print("\n处理完成!")  
    print(f"总共处理的JSON文件数: {processed_files}")  
    print(f"实际修改的文件数: {modified_files}")  

def main():  
    # 获取用户输入的目录路径  
    while True:  
        directory = input("请输入要处理的目录路径: ").strip()  
        if os.path.isdir(directory):  
            break  
        print("输入的路径不是有效的目录，请重新输入。")  

    # 确认是否继续  
    print(f"\n将要处理目录: {directory}")  
    confirm = input("是否继续? (y/n): ").strip().lower()  
    if confirm != 'y':  
        print("操作已取消")  
        return  

    # 执行替换操作  
    print("\n开始处理文件...")  
    replace_mode_in_json_files(directory)  

if __name__ == "__main__":  
    main()