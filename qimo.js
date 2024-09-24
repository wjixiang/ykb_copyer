"2024-09-24-01-47-45-427"

let record 

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
        return Object.values(obj).some(hasNullValue); // 对对象的每个值递归检查  
    }  

    // 如果不是对象或数组，返回 false  
    return false;  
}  

function get_cls(){  
    let discuss = id("com.yikaobang.yixue:id/include_title_center").findOne(5000);  
    console.log(discuss.text());  
    return discuss.text();  
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

// function get_unit(frame){  
//     let unitText = null;  
//     let parent = frame.parent()
//     let children
//     if(parent==null||parent.childCount()<1){
//         return(null)
//     }else{
//         children = parent.children();  
//     }
//     for (let i = 0; i < children.length; i++) {  
//         let a = children[i];  
//         if (a!=null&&a.className() == "android.widget.RelativeLayout" && a.childCount() > 0) { // 检查子元素数量  
//             let unit = a.children();  
//             if(a.length>0){
//                 // for(let j = 0; j < children.length; j++){

//                 // }

//                 console.log(unit[0].text());  
//             unitText = unit[0].text();  
//             break; // 找到后退出循环  
//             }
//         }  
//     }  
//     return unitText;  
// }  

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
    const jsonData = JSON.stringify(test, null, 2); // 第二个参数用于格式化，2 表示缩进两个空格  
    files.create(name);  
    files.write(name, jsonData)  
    console.log("####保存成功####")  
    return(jsonData)  
}  

function reset(){
    exit()
}

function main(){  
    for (let i = 0; i < 1000; i++) {  

        if(text("进入下一章").exists()){
            console.log("切换章节")
            text("进入下一章").findOne().click()
            sleep(2000)
            text("1").findOne(500).parent().click()
        // click(160,657)
            sleep(500)
            console.log(1233)

        }

        // if(id("banner"))

        let frame = get_frame();  
        for (let i = 0; i < frame.length; i++) {  
            let f = frame[i];  
            let json = fetch(f);  
            console.log(json);  
            if(hasNullValue(json)){
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
            click(156, 721);  
            sleep(500);  
        }  
    }  
}  

app.launchApp("医考帮");  
files.create("/sdcard/tests/");  
main();