"2024-09-24-01-47-45-427"
"删除unit为生物化学的章节"

var record 

function hasNullValue(obj) {  
    // 检查对象是否为 null  
    if (obj === null) {  
        return true;  
    }  

    // 检查对象是否为数组  
    if (Array.isArray(obj)) {  
        return obj.some(hasNullValue); // 对数组中的每个元素递归检查  
    }  

    // 检查对象的每个属性  
    if (typeof obj === 'object' && obj !== null) {  
        console.log(obj)
        return Object.values(obj).some(hasNullValue); // 对对象的每个值递归检查  
    }  

    // 如果不是对象或数组，返回 false  
    return false;  
}  

function get_cls(){  
    let discuss = id("com.yikaobang.yixue:id/include_title_center").findOne(5000);  
    if(discuss==null){
        reset()
        return get_cls()
    }else{
        let cls = discuss.text();
        console.log(cls);  
        return cls;  
    }
}  

function get_frame(){  
    let layoutlist = [];  
    let option_div = className("android.widget.LinearLayout").find();  
    for (let i = 0; i < option_div.length; i++) {  
        let element = option_div[i];  
        if (element.childCount() > 0) { // 判断是否有子元素  
            for (let j = 0; j < element.children().length; j++) {  
                let child = element.children()[j];  
                if(child!=null){
                    if (child.id() == "com.yikaobang.yixue:id/qlistview") {  
                        layoutlist.push(element);  
                    }     
                } 
            }  
        }  
    }  
    return layoutlist;  
}  

function get_unit(){
    let discuss = id("questiondetails_tv_title").findOne(500)
    if(discuss!=null){
        console.log(discuss.text())
        return(discuss.text())
    }else{
        return(null)
    }
}


function get_mode(frame){  
    for (let i = 0; i < frame.children().length; i++) {  
        let a = frame.children()[i];  
        if (a!=null&&a.className() == "android.view.ViewGroup" && a.childCount() > 0) { // 检查子元素数量  
            for (let j = 0; j < a.children().length; j++) {  
                let b = a.children()[j];  
                if (b!=null&&b.childCount() > 0) { // 检查子元素数量  
                    for (let k = 0; k < b.children().length; k++) {  
                        let c = b.children()[k];  
                        if (c!=null&&c.id() == "com.yikaobang.yixue:id/typeStr") {  
                            console.log(c.text());  
                            return c.text();  
                        }  
                    }  
                }  
            }  
        }  
    }  
}  

function get_test(frame){  
    for (let i = 0; i < frame.children().length; i++) {  
        let a = frame.children()[i];  
        if (a!=null&&a.className() == "android.view.ViewGroup" && a.childCount() > 0) { // 检查子元素数量  
            for (let j = 0; j < a.children().length; j++) {  
                let b = a.children()[j];  
                if (b!=null&&b.childCount() > 0) { // 检查子元素数量  
                    for (let k = 0; k < b.children().length; k++) {  
                        let c = b.children()[k];  
                        if (c!=null&&c.id() == "com.yikaobang.yixue:id/titletv") {  
                            console.log(c.text());  
                            return c.text();  
                        }  
                    }  
                }  
            }  
        }  
    }  
}  

function get_answer(frame){  
    for (let i = 0; i < frame.children().length; i++) {  
        let a = frame.children()[i];  
        if (a!=null&&a.className() == "android.widget.LinearLayout" && a.childCount() > 0) { // 检查子元素数量  
            for (let j = 0; j < a.children().length; j++) {  
                let b = a.children()[j];  
                if (b!=null&&b.className() == "android.widget.RelativeLayout" && b.childCount() > 0) { // 检查子元素数量  
                    for (let k = 0; k < b.children().length; k++) {  
                        let d = b.children()[k];  
                        if (d!=null&&d.id() == "com.yikaobang.yixue:id/questiondetails_tv_Answer") {
                            console.log(d.text());  
                            return d.text().replace("答案：","");  
                        }  
                    }  
                }  
            }  
        }  
    }  

    return(null)
}  

function get_option(frame){  
    let options = [];  
    for (let i = 0; i < frame.children().length; i++) {  
        let a = frame.children()[i];  
        if (a!=null&&a.className() == "androidx.recyclerview.widget.RecyclerView" && a.childCount() > 0) { // 检查子元素数量  
            for (let j = 0; j < a.children().length; j++) {  
                let b = a.children()[j];  
                if (b!=null&&b.childCount() > 0) { // 检查子元素数量  
                    for (let k = 0; k < b.children().length; k++) {  
                        let c = b.children()[k];  
                        if (c!=null&&c.className() == "android.widget.TextView") {  
                            console.log(c.text());  
                            options.push(c.text());  
                        }  
                    }  
                }  
            }  
        }  
    }  
    return options;  
}  

function dd_text(frame, id){  
    if (frame.childCount() > 0) {  
        for (let i = 0; i < frame.length; i++) {  
            let a = frame[i];  
            if (a.id() == id) {  
                return a.text();  
            } else {  
                let result = dd_text(a, id);  
                if (result !== null) {  
                    return result; // 找到后返回结果  
                }  
            }  
        }  
    }  
    return null;  
}  

function get_point(frame){  
    for (let i = 0; i < frame.children().length; i++) {  
        let a = frame.children()[i];  
        if (a!=null&&a.className() == "android.widget.LinearLayout" && a.childCount() > 0) { // 检查子元素数量  
            for (let j = 0; j < a.children().length; j++) {  
                let b = a.children()[j];  
                if (b!=null && b.className() == "android.widget.LinearLayout" && b.childCount() > 0) { // 检查子元素数量  
                    for (let k = 0; k < b.children().length; k++) {  
                        let c = b.children()[k];  
                        if(c!=null){
                            if (c.className() == "android.widget.LinearLayout" && c.childCount() > 0) { // 检查子元素数量  
                                for (let l = 0; l < c.children().length; l++) {  
                                    let d = c.children()[l];  
                                    if (d!=null&&d.id() == "com.yikaobang.yixue:id/questiondetails_tv_content_ques1") {  
                                        console.log(d.text());  
                                        return d.text();  
                                    }  
                                }  
                            } 
                        } 
                    }  
                }  
            }  
        }  
    }  
    return "";  
}  

function get_discuss(frame){  
    for (let i = 0; i < frame.children().length; i++) {  
        let a = frame.children()[i];  
        if (a!=null&&a.className() == "android.widget.LinearLayout" && a.childCount() > 0) { // 检查子元素数量  
            for (let j = 0; j < a.children().length; j++) {  
                let b = a.children()[j];  
                if (b!=null&&b.className() == "android.widget.LinearLayout" && b.childCount() > 0) { // 检查子元素数量  
                    for (let k = 0; k < b.children().length; k++) {  
                        let c = b.children()[k];  
                        if (c!=null&&c.className() == "android.widget.LinearLayout" && c.childCount() > 0) { // 检查子元素数量  
                            for (let l = 0; l < c.children().length; l++) {  
                                let d = c.children()[l];  
                                if (d!=null&&  d.id() == "com.yikaobang.yixue:id/questiondetails_tv_contents") {  
                                    console.log(d.text());  
                                    return d.text();  
                                }  
                            }  
                        }  
                    }  
                }  
            }  
        }  
    }  
    return "";  
}  

function get_numb(){
    let number = id("pagenumtv").findOne(3000)
    if(number!=null){
        let numlist =  number.text().replace(" ","").split("/")
        console.log(numlist[0])
        return(numlist[0])
    }else{
        return(null)
    }
}

function getFormattedTimestamp() {  
    const now = new Date();  
    const year = now.getFullYear();  
    const month = String(now.getMonth() + 1).padStart(2, '0');  
    const day = String(now.getDate()).padStart(2, '0');  
    const hours = String(now.getHours()).padStart(2, '0');  
    const minutes = String(now.getMinutes()).padStart(2, '0');  
    const seconds = String(now.getSeconds()).padStart(2, '0');  
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');  
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`;  
}  

function fetch(f){  
    console.log("开始拉取");  
    let timestamp = getFormattedTimestamp();  
    let test = {  
        name: timestamp,  
        cls: get_cls(), 
        numb: get_numb(), 
        unit: get_unit(f),  
        mode: get_mode(f),  
        test: get_test(f),  
        option: get_option(f),  
        answer: get_answer(f),  
        point: get_point(f),  
        discuss: get_discuss(f)  
    };  
    return test;  
}  

function savejson(test){  
    let name = "/sdcard/tests/"+test.name+".json"  
    record = test
    const jsonData = JSON.stringify(test, null, 2); // 第二个参数用于格式化，2 表示缩进两个空格  
    files.create(name);  
    files.write(name, jsonData)  
    console.log("\n####保存成功####\n\n\n")  
    return(jsonData)  
}  

function exit(){
    app.openAppSetting(app.getPackageName("医考帮"))
text("强行停止").findOne().click()
text("确定").findOne().click()
sleep(3000)
    // while(!(text("确定").exists()||text("关闭应用").exists())){
    //     sleep(500)
    //     if(id("close").exists()){
    //         console.log("广告")
    //         id("close").findOne().click()
    //     }  
    //     back()
    // }
    // if(text("关闭应用").exists()){
    //     text("关闭应用").findOne().click()
    // }

    // if(text("确定").exists()){
    //     text("确定").findOne().click()
    // }
    

}



function sim_click(text){
    let uniter = textContains(text).findOne(250)
    while(uniter==null){
        swipe(700,2000 ,700 ,1800 ,500)
        sleep(250)
        uniter = textContains(text).findOne(250)
    }
    let uniter1 = uniter.parent().bounds()
    console.log(uniter1.centerY())

    while(uniter1.centerY()>device.height-200){
        swipe(700,2000 ,700 ,1600 ,1000)
        uniter1 = textContains(text).findOne().parent().bounds()
        sleep(500)
    }

    sleep(1000)
    // let uniter2 = textContains(text).findOne().parent().bounds()
    // console.log(uniter2.centerY())
    click(uniter1.centerX()/2,uniter1.centerY())
}

function sim_self_click(text){
    let uniter = textContains(text).findOne(250)
    while(uniter==null){
        swipe(700,2000 ,700 ,1800 ,500)
        sleep(250)
        uniter = textContains(text).findOne(250)
    }
    let uniter1 = uniter.bounds()
    console.log(uniter1.centerY())

    sleep(1000)
    // let uniter2 = textContains(text).findOne().parent().bounds()
    // console.log(uniter2.centerY())
    click(uniter1.right,uniter1.centerY())
}

function reset(){
    console.log("重置")
    if(id("close").exists()){
        console.log("广告")
        id("close").findOne().click()
    }   
    exit()
    app.launchApp("医考帮")
    while(!(id("close").exists() || text("错题").exists())){
        sleep(250)
        if(text("点击刷新页面").exists()){
            sim_click("点击刷新页面")
        }
        
    }
    
    sleep(3000)    
    if(id("close").exists()){
            console.log("广告")
            id("close").findOne().click()
    }
    // click(720,179)
    sleep(1000)
    
    text("大二期末").findOne().parent().parent().click()//调整学期
    console.log("点击横栏项目")

    sleep(5000)
    if(id("close").exists()){
        console.log("广告")
        id("close").findOne().click()

    }
    console.log(record)
    console.log(record.cls)
    sim_click(record.cls)
    console.log(record.unit)
    sleep(1000)
    if(id("close").exists()){
        console.log("广告")
        id("close").findOne().click()

    }

    sim_click(record.unit)
    sleep(1000)
    if(id("close").exists()){
        console.log("广告")
        id("close").findOne().click()

    }
    let numb = record.numb.split("/")[0]
    console.log(numb)
    sleep(3000)
    sim_click(numb)
    sleep(3000)

}

function main(){ 
    var numb = 1
    var json = null
    for (let i = 0; i <10000; i++) {  
        if(id("close").exists()){
            console.log("!!!resetB!!!")
            reset()
        }
        if(text("背题模式").exists()){
            console.log(json)
            console.log("!!!resetA!!!")
            reset()
        }

        if(text("进入下一章").exists()){
            console.log("切换章节")
            text("进入下一章").findOne().click()
            sleep(5000)
            
            text("1").findOne(8000).parent().click()
        // click(160,657)
            sleep(500)

        }

        // if(id("banner"))

        let frame = get_frame();  
        for (let i = 0; i < frame.length; i++) {  
            let f = frame[i];  
            json = fetch(f);  
            console.log(json);  
            if(hasNullValue(json)){
                console.log("\n跳过保存\n\n")
                continue;

            } else{
                savejson(json); 
            } 
        }  
        sleep(25);  
        swipe(1000, 1000, 700, 1000, 100);  
        sleep(100);  
        if (text("进入下一章").exists()) {  

            console.log("切换章节");  
            text("进入下一章").findOne().click();  
            sleep(2000);  
            //判断是否存在章节脱节
            text("1").findOne(3000).parent().click()
            // click(156, 721);  
            sleep(500);  
            if(get_unit()==record.unit){  
                console.log("!!!发现章节脱落!!!")
                reset()
            }
        }  
    }  
}  

app.launchApp("医考帮");  
files.create("/sdcard/tests/");  
main();