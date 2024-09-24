const { emitWarning } = require("process");
let json = null

function hasSameFirstChar(str, list) {  
    if (str.length === 0) {  
        return false; // 如果字符串为空，返回 false  
    }  

    const firstChar = str.charAt(0); // 获取字符串的第一个字符  

    // 遍历列表，检查是否有与第一个字符相同的元素  
    for (let i = 0; i < list.length; i++) {  
        if (list[i].charAt(0) === firstChar) {  
            return true; // 找到相同的字符，返回 true  
        }  
    }  

    return false; // 如果没有找到，返回 false  
} 

function getFormattedTimestamp() {  
    const now = new Date();  

    // 获取各个部分  
    const year = now.getFullYear();  
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从0开始  
    const day = String(now.getDate()).padStart(2, '0');  
    const hours = String(now.getHours()).padStart(2, '0');  
    const minutes = String(now.getMinutes()).padStart(2, '0');  
    const seconds = String(now.getSeconds()).padStart(2, '0');  
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');  

    // 生成格式化的时间戳  
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`;  
}  

// 示例用法  
// const timestamp = getFormattedTimestamp();  
// console.log(timestamp);

function get_number(){
    let number = id("pagenumtv").findOne(3000)
    if(number!=null){
        let numlist =  number.text().replace(" ","").split("/")
        console.log(numlist[0])
        return(numlist[0])
    }else{
        return(null)
    }
}

function get_mode(){
    let mode_componant = id("typeStr").findOne(3000)
    if(mode_componant!=null){
        let mode = mode_componant.text().replace("型题","")
        console.log(mode)
        return(mode)
    }else{
        return(null)
    }
}

function get_test(){
    const title_componant = id("titletv").findOne(3000)

    if(title_componant!=null){
        console.log(title_componant.text())
        return(title_componant.text())
    }else{
        return(null)
    }

}

function get_option(){
    const options = id("QuestionOptions_item_tv_content").find()
    if(options!=null){
        var opton_list = []
        for(let i=1 ;i<=options.length/2;i++){
            // console.log(options[i])
            //console.log(option.text())
            if(!hasSameFirstChar(options[i-1].text(),opton_list)){
                opton_list.push(options[i-1].text())
                console.log(options[i-1].text())
            }
        }
    
        return(opton_list)
    }else{
        return(null)
    }
    // console.log(options.text())
}

function get_answer(){
    let answers = id("ll_answer").findOne(500)
    if(answers!=null){
        let answer = answers.children()
        let ans = answer[0].text().replace("答案：","")
        console.log(ans)
        return(ans)
    }else{
        return(null)
    }
}

function get_point(){
    let point = id("questiondetails_tv_content_ques1").findOne(500)
    if(point != null){
        console.log(point.text())
        return(point.text())
    }else{
        return("")
    }
}

function get_discuss(){
    let discuss = id("questiondetails_tv_contents").findOne(1000)
    if(discuss != null){
        console.log(discuss.text())
        return(discuss.text())
    }else{
        return("")
    }
}

function get_cls(){
    let discuss = id("include_title_center").findOne(3000)
    if(discuss!=null){
        console.log(discuss.text())
        return(discuss.text())
    }else{
        console.log("：未找到CLS")
        reset()
        sleep(1000)
        get_cls()
    }
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


function fetch(){
    // sleep(1)
    console.log("开始拉取")
    timestamp = getFormattedTimestamp()
    let test = {
        name:timestamp,
        cls:get_cls(),
        number:get_number(),
        unit:get_unit(),
        mode:get_mode(),
        test:get_test(),
        option:get_option(),
        answer:get_answer(),
        point:get_point(),
        discuss:get_discuss()
    }
    // let name = "/sdcard/tests/"+timestamp+".json"
    // const jsonData = JSON.stringify(test, null, 2); // 第二个参数用于格式化，2 表示缩进两个空格  
    // files.create(name);
    // files.write(name, jsonData)
    // console.log("####爬取成功####")

    if(hasNullValue(test)){
        console.log("未拉取成功")
        reset()
        let result = fetch()
        return(result)
    }else{
        return(test)
    }
}

function savejson(test){
    let name = "/sdcard/tests/"+test.name+".json"
    const jsonData = JSON.stringify(test, null, 2); // 第二个参数用于格式化，2 表示缩进两个空格  
    files.create(name);
    files.write(name, jsonData)
    console.log("####保存成功####")
    // reset()
    return(jsonData)
}

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

function twn(json){
    json= fetch()
    if(hasNullValue(json)){
        console.log("e1")
        reset()
        sleep(1000)
        console.log("重拉起")
        twn(json)
    }else{
        return(json)
    }
}

function nextfetch(record_json){
    console.log("A")
    let json= fetch();

    //console.log("hello")
    // let jsonData = JSON.stringify(json, null, 2)
    // let record_jsonData = JSON.stringify(record_json, null, 2)
    if(record_json!=null){
        if(json.test==record_json.test){
            console.log("\n\n发现重复\n\n")
            id("include_btn_left").findOne().click()
            // id("include_btn_left").findOne().click()
            sleep(500)
            click(55,117)
            console.log(json.unit)
            sleep(500)
            text(json.unit).findOne().parent().click()
            console.log(json.number)
            let recap = text(String(Number(json.number)+1)).findOne(500)
            if(recap!=null){
                recap.parent().click()
            }else{
                text(String(Number(json.number))).findOne(500).click()
                swipe(1000, 1000, 700, 1000, 200)
                sleep(1000)
                // text("进入下一章").findOne().click()
                sleep(2000)
            }
            sleep(2000)
            nextfetch(json)
        }else{
            console.log(json.test)
            // console.log(name,jsonData,"##########$$$$$$$$$")
            savejson(json)
            // record = jsonData
            return(json)
        }
    }else{
        savejson(json)
        // record = jsonData
        return(json)
    }
}


function main(){
    sleep(3000)
    // let record = "";
    // let name = "";

    for(let i=0;i<1000;i++){
        json = fetch(json)
        savejson(json)
        sleep(50)
        swipe(1000, 1000, 700, 1000, 200)
        // scrollLeft(0)
        sleep(50)

        if(text("进入下一章").exists()){
            console.log("切换章节")
            text("进入下一章").findOne().click()
            sleep(2000)
            click(156,721)
            sleep(500)

        }
    }
}

function reset(){
    console.log("reset")
    if( text("进入下一章").exists()){
        console.log("resetD")
        text("进入下一章").findOne(500).click()
        sleep(2000)
        text("1").findOne(500).parent().click()
        // click(160,657)
        sleep(500)
        console.log(1233)
        // text("1").findOne(500).click()
    }

    if(text("背题模式").exists()){
        console.log("resetB")
        text("1").findOne(500).parent().click()
    }
    // console.log("reset")
    // if(id("close").exists){
    //     id("close").click()
    //     console.log("resetA")
    // }


    if(text("选择题").exists()){
        console.log("resetC")
        if(json!=null){
            console.log("已经返回主页面")
            text("大四期末").findOne(500).parent().click()
            text(json.unit).findOne(500).click()

        }
    }
    console.log("reset over")
}

app.launchApp("医考帮")
files.create("/sdcard/tests/")
main()