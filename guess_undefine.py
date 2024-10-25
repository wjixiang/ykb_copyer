import os
import json
import re

def guess(folder_path): 
    lenth = []
    for filename in os.listdir(folder_path): 
        if filename.endswith('.json'):
            file_path = os.path.join(folder_path, filename)  
            with open(file_path, 'r+') as file:  
                try:  
                    data = json.load(file)  
                    answer = data.get('answer') 

                    if len(answer) not in lenth:
                        lenth.append(len(answer))

                    if len(answer) != 1:
                        print(filename)

                    #res = re.match(r"正确答案\s[A-Z]+",answer)
                    pattern = r"正确答案"
                    if re.search(pattern,answer):
                        print(filename)

                    data['mode'] = 'A1'
                    json.dump(data,file,indent=4)
                    
                except json.JSONDecodeError:  
                    print(f"无法解析文件: {filename}") 

    # print(lenth)


folder_path = './undefined'  # 替换为您的文件夹路径  
guess(folder_path)