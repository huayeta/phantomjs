
var webpage=require('webpage');
var system = require('system');

var page=webpage.create();
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36';
page.onConsoleMessage = function(msg) {
  console.log(msg);
}
page.onUrlChanged = function(targetUrl) {
  // console.log('New URL: ' + targetUrl);
  if(targetUrl=='http://user.shikee.com/buyer'){
      console.log('登录成功');
      page.close();
      //获取
      console.log('开始获得地址');
      getList(function(){
          finish();
      });
  }
};
page.open('http://login.shikee.com/',function(status){
     console.log('开始登录');
    if(status!=='success'){
        console.log('登录页面请求失败');
        console.log(status);
        return finish();
    }
    page.evaluate(function(){
        var $doc=$(document);
        var $username=$doc.find('#J_userName').val('用户名');
        var $password=$doc.find('#J_pwd').val('密码');
        var $submit=$doc.find('#J_submit');
        $submit.trigger('click');
    })
    // phantom.exit();
})

function getList(cb){
    var newPage=webpage.create();
    newPage.onUrlChanged=function(targetUrl){
        console.log(targetUrl);
    }
    newPage.onConsoleMessage = function(msg) {
      console.log(msg);
    }
    var url='http://fashion.shikee.com/lists/index/?con_state=2';
    newPage.open(url,function(status){
      if(status!=='success')return console.log('失败');
       newPage.includeJs('http://static.shikee.com/common/js/jquery-1.10.2.min.js',function(){
           var urls=newPage.evaluate(function(){
               var $box=$(document).find('.J_ImgLoad a');
               var urls=[];
               $box.each(function(){
                   var $this=$(this);
                   urls.push($this.attr('href'));
               })
               return urls;
           });
           console.log('得到网址：'+urls.length);
           if(urls.length==0)return cb();
           var OBJ={num:urls.length};
           var fn_arr=urls.map(function(url){
               return createpage.bind(this,url,OBJ,cb);
           })
           delay(fn_arr,6500);
        //    urls.forEach(function(url){
            //    createpage(url,OBJ,cb);
        //    });
           newPage.close();
       })
    })
}

/**
 * 延迟函数
 * @params fn_arr 函数数组
 * @params time 延迟参数ms
 * @returns void
 */
 function delay(fn_arr,time){
     if(fn_arr.length==0){
        return;
     }
     var fn=fn_arr.pop();
     setTimeout(function(){
         fn();
         delay(fn_arr,time);
     },time)
 }

function createpage(url,OBJ,cb){
    var newPage=webpage.create();
    newPage.onUrlChanged=function(targetUrl){
        // console.log(targetUrl);
    }
    newPage.onResourceRequested = function (req) {

    }
    newPage.onResourceTimeout=function(request){
        console.log('请求超时');
        OBJ.num--;
        if(OBJ.num==0){
            cb();
        }else{
            console.log('还剩下：'+OBJ.num);
        }
    }
    newPage.onConsoleMessage = function(msg) {
      console.log(msg);
    }
    newPage.open(url,function(status){
      if(status!=='success')return console.log('失败');
      newPage.includeJs('http://static.shikee.com/common/js/jquery-1.10.2.min.js',function(){
          newPage.evaluate(function(){
            $('.J_TryBtn').click();
          });
          OBJ.num--;
          if(OBJ.num==0){
              cb();
          }else{
              console.log('还剩下：'+OBJ.num);
          }
          setTimeout(function(){
              newPage.close();
        },6000)
      })
    })
}

function finish(){
    phantom.exit();
}
