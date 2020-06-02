const client = require('../../service/client')
const fs = require('../../service/filesys')

Page({
  data: {
    proname:''
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "新建作品"
    })
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
      wx.showToast({title: "新建默认作品成功！", time:2000});
      wx.navigateBack({//返回
        delta: 1
      });
    })
    .catch((e) =>{
      wx.showToast({title: "新建默认作品失败!", time:2000})
    })
  }
  ,

  newPho: function(){
  },

  newArt: function(){
  },

  newReal: function(){
  },

  newVir: function(){
    const self = this;
    var user = client.getUser();
    user.createProject(self.data.proname)
    .then((newPro)=>{
      newPro.FSRoot = fs.buildFS(newPro.subDocuments);
      const root = newPro.FSRoot;
      newPro.createMainDocument("小说简介", "text")
      newPro.createMainDocument("第一章", "text")
      newPro.createSubDocument("大纲", "text", root.getPath()+"大纲/").then((newDir1)=>{
          root.addChild(newDir1);
      }).catch(()=>{
            wx.showToast({title: "8新建作品失败!", time:2000})
          })
    })
    .catch((e) =>{
      wx.showToast({title: "新建虚构文学作品失败!", time:2000})
    })
  }
})