

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

function get_mode(){
    let mode_componant = id("typeStr").findOne()
    let mode = mode_componant.text().replace("型题","")
    console.log(mode)
    return(mode)
}

function get_test(){
    const title_componant = id("titletv").findOne()
    console.log(title_componant.text())
    return(title_componant.text())

}

function get_option(){
    const options = id("QuestionOptions_item_tv_content").find()
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
    // console.log(options.text())
}

function get_answer(){
    const answer_parent = id("ll_answer").findOne().children().forEach(child=>{
        //console.log(child.text())
    })

    let answer = id("ll_answer").findOne().children()
    let ans = answer[0].text().replace("答案：","")
    console.log(ans)
    return(ans)
}

function get_point(){
    let point = id("questiondetails_tv_content_ques1").findOne().text()
    console.log(point)
    return(point)
}

function get_discuss(){
    let discuss = id("questiondetails_tv_contents").findOne().text()
    console.log(discuss)
    return(discuss)
}

function get_cls(){
    let discuss = id("include_title_center").findOne().text()
    console.log(discuss)
    return(discuss)
}

function get_unit(){
    let discuss = id("questiondetails_tv_title").findOne().text()
    console.log(discuss)
    return(discuss)
}

app.launchApp("医考帮")
function fetch(){
    sleep(1)
    timestamp = getFormattedTimestamp()
    let test = {
        name:timestamp,
        cls:get_cls(),
        unit:get_unit(),
        mode:get_mode(),
        test:get_test(),
        option:get_option(),
        answer:get_answer(),
        point:get_point(),
        discuss:get_discuss()
    }
    let name = "/sdcard/tests/"+timestamp+".json"
    const jsonData = JSON.stringify(test, null, 2); // 第二个参数用于格式化，2 表示缩进两个空格  
    files.create(name);
    files.write(name, jsonData)

}

// fetch()
function main(){
    sleep(3000)


    for(let i=0;i<1869;i++){
        fetch()
        sleep(250)
        swipe(1000, 1000, 700, 1000, 250)
        sleep(250)

        if(text("进入下一章").exists()){
            console.log("切换章节")
            text("进入下一章").findOne().click()
            sleep(500)
            while(!id("typeStr").exists()){
                click(156,721)
                sleep(500)
            }
        }
    }
}

main()