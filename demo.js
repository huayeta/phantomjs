var child_process = require('child_process');

var keywords=['茶','垫','乌龙茶','铁观音','蜂蜜','钢化膜','iphone+数据线','苹果+数据线']

function getKw(){
    var kw=keywords.shift();
    console.log(kw);
    child_process.exec('phantomjs shike.js '+kw,function(err,stdout,stderr){
        console.log(stdout);
    })
        .on('close',function(code){
            if(keywords.length>0){
                getKw();
            }
        })
}
getKw();
