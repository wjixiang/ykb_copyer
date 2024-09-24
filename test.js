while(!text("确定").exists()){
    sleep(300)
    back()
}

text("确定").findOne().click()