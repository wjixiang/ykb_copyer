function get_unit(){
    let discuss = id("questiondetails_tv_title").findOne(500)
    if(discuss!=null){
        console.log(discuss.text())
        return(discuss.text())
    }else{
        return(null)
    }
}

if(get_unit=="")