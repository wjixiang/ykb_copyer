Java.perform(function() {  
    // Hook HttpURLConnection  
    var HttpURLConnection = Java.use("java.net.HttpURLConnection");  
    
    HttpURLConnection.connect.implementation = function() {  
        console.log("Connecting to: " + this.getURL().toString());  
        return this.connect(); // 调用原始 connect 方法  
    };  

    HttpURLConnection.getInputStream.implementation = function() {  
        console.log("Getting InputStream for: " + this.getURL().toString());  
        var inputStream = this.getInputStream(); // 调用原始 getInputStream 方法  
        return inputStream;  
    };  

    // Hook OkHttp  
    var OkHttpClient = Java.use("okhttp3.OkHttpClient");  
    var Call = Java.use("okhttp3.Call");  
    
    Call.execute.implementation = function() {  
        var request = this.request();  
        console.log("OkHttp Request URL: " + request.url().toString());  
        var response = this.execute(); // 调用原始 execute 方法  
        console.log("OkHttp Response Code: " + response.code());  
        return response;  
    };  
});