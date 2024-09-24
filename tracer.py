import frida  
import sys  

# Frida 脚本  
script_code = """  
Java.perform(function() {  
    var textView = Java.use("android.widget.TextView");  
    textView.getText.implementation = function() {  
        var text = this.getText(); // 调用原始 getText 方法  
        console.log('TextView text: ' + text.toString()); // 输出文本  
        return text; // 返回原始文本  
    };  
});  
"""  

# 连接到设备  
def on_message(message, data):  
    if message['type'] == 'log':  
        print(message['payload'])  

# 目标应用的包名  
package_name = "com.yikaobang.yixue"  # 替换为你的目标应用包名  

# 启动应用并注入脚本  
def main():  
    # 启动应用  
    process = frida.get_usb_device().spawn([package_name])  
    session = frida.get_usb_device().attach(process)  

    # 创建并加载脚本  
    script = session.create_script(script_code)  
    script.on('message', on_message)  
    script.load()  

    # 恢复应用  
    frida.get_usb_device().resume(process)  
    print(f"[*] {package_name} started. Press Ctrl+C to exit.")  

    # 保持脚本运行  
    try:  
        sys.stdin.read()  
    except KeyboardInterrupt:  
        print("\n[*] Exiting...")  
        session.detach()  

if __name__ == "__main__":  
    main()
