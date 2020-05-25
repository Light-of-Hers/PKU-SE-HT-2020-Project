const client = require('../../service/client')

Page({
  data: {
    proname:''
  },

  onLoad: function (options) {

  },

  bindProNameInput: function(e){
    const self = this;
    self.data.proname = e.detail.value;
  },

  newPro: function(){
    const self = this;
    var user = client.getUser();
    user.createProject(self.data.proname)
    .then((newPro)=>{
      wx.showToast({title: "新建作品成功！", time:2000});
      wx.navigateBack({//返回
        delta: 1
      });
    })
    .catch((e) =>{
      wx.showToast({title: "新建作品失败!", time:2000})
    })
  }
 
})