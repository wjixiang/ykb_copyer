Java.perform(function() {
    var textView = Java.use("android.widget.TextView");
    textView.getText.implementation = function() {  
        var text = this.getText(); // 调用原始 getText 方法  
        console.log('TextView text: ' + text.toString()); // 输出文本  
        return text; // 返回原始文本  
    };  
    })
    