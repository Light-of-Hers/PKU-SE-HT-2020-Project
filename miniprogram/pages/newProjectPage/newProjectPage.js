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
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '新建默认作品成功！',
        success (res) {
          if (res.confirm) {
            wx.navigateBack({//返回
              delta: 1
            });
          }
        }
      })
    })
    .catch((e) =>{
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '新建默认作品失败！',
      })
    })
  }
  ,

  newPho: function(){
    const self = this;
    var user = client.getUser();
    user.createProject(self.data.proname)
    .then((newPro)=>{
      const root = newPro.FSRoot; 
      Promise.all([
        newPro.createMainDocument("作品简介", "text"),
        newPro.createMainDocument("作品", "image"),
        newPro.createSubDocument("调色参数", "text", "/调色参数/"),
        newPro.createSubDocument("硬件参数", "text", "/硬件参数/"),
        newPro.createSubDocument("灵感来源", "text", "/灵感来源/"),
        newPro.createSubDocument("灵感来源帮助手册", "text", "/灵感来源/灵感来源帮助手册.txt"),
        newPro.createSubDocument("其他", "text", "/其他/")
      ]).then(()=>{
        newPro.FSRoot = fs.buildFS(newPro.subDocuments);
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '新建摄影作品成功！',
          success (res) {
            if (res.confirm) {
              wx.navigateBack({//返回
                delta: 1
              });
            }
          }
        })
      }).catch(()=>{
        user.deleteProject(newPro.id);
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '新建摄影作品失败！'
        })
      })
    })
    .catch((e) =>{
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '新建摄影作品失败！'
      })
    })
  },

  newArt: function(){ 
    const self = this;
    var user = client.getUser();
    user.createProject(self.data.proname)
    .then((newPro)=>{
      const root = newPro.FSRoot; 
      Promise.all([
        newPro.createMainDocument("作品简介", "text"),
        newPro.createMainDocument("作品1", "image"),
        newPro.createSubDocument("灵感碎片", "text", "/灵感碎片/"),
        newPro.createSubDocument("灵感碎片帮助手册", "text", "/灵感碎片/灵感碎片帮助手册.txt"),
        newPro.createSubDocument("其他", "text", "/其他/")
      ]).then(()=>{
        newPro.FSRoot = fs.buildFS(newPro.subDocuments);
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '新建绘画作品成功！',
          success (res) {
            if (res.confirm) {
              wx.navigateBack({//返回
                delta: 1
              });
            }
          }
        })
      }).catch(()=>{
        user.deleteProject(newPro.id);
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '新建绘画作品失败！'
        })
      })
    })
    .catch((e) =>{
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '新建绘画作品失败！'
      })
    })
  },

  newReal: function(){
    const self = this;
    var user = client.getUser();
    user.createProject(self.data.proname)
    .then((newPro)=>{
      const root = newPro.FSRoot; 
      Promise.all([
        newPro.createMainDocument("作品简介", "text"),
        newPro.createMainDocument("作品内容1", "text"),
        newPro.createSubDocument("灵感来源", "text", "/灵感来源/"),
        newPro.createSubDocument("灵感来源帮助手册", "text", "/灵感来源/灵感来源帮助手册.txt"),
        newPro.createSubDocument("灵感来源示例", "image", "/灵感来源/灵感来源示例.txt"),
        newPro.createSubDocument("查询资料", "text", "/查询资料/"),
        newPro.createSubDocument("查询资料帮助手册", "text", "/查询资料/查询资料帮助手册.txt"),
        newPro.createSubDocument("访谈原稿", "text", "/访谈原稿/"),
        newPro.createSubDocument("访谈原稿帮助手册", "text", "/访谈原稿/访谈原稿帮助手册.txt"),
        newPro.createSubDocument("其他", "text", "/其他/")
      ]).then(()=>{
        newPro.FSRoot = fs.buildFS(newPro.subDocuments);
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '新建纪实文学作品成功！',
          success (res) {
            if (res.confirm) {
              wx.navigateBack({//返回
                delta: 1
              });
            }
          }
        })
      }).catch(()=>{
        user.deleteProject(newPro.id);
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '新建纪实文学作品失败！'
        })
      })
    })
    .catch((e) =>{
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '新建纪实文学作品失败！'
      })
    })
  },

  newVir: function(){
    const self = this;
    var user = client.getUser();
    user.createProject(self.data.proname)
    .then((newPro)=>{
      const root = newPro.FSRoot; 
      Promise.all([
        newPro.createMainDocument("小说简介", "text"),
        newPro.createMainDocument("第一章", "text"),
        newPro.createSubDocument("大纲", "text", "/大纲/"),
        newPro.createSubDocument("大纲帮助手册", "text", "/大纲/大纲帮助手册.txt"),
        newPro.createSubDocument("人物小传", "text", "/人物小传/"),
        newPro.createSubDocument("人物小传帮助手册", "text", "/人物小传/人物小传帮助手册.txt"),
        newPro.createSubDocument("灵感碎片", "text", "/灵感碎片/"),
        newPro.createSubDocument("灵感碎片帮助手册", "text", "/灵感碎片/灵感碎片帮助手册.txt"),
        newPro.createSubDocument("其他", "text", "/其他/")
      ]).then(()=>{
        newPro.FSRoot = fs.buildFS(newPro.subDocuments);
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '新建虚构文学作品成功！',
          success (res) {
            if (res.confirm) {
              wx.navigateBack({//返回
                delta: 1
              });
            }
          }
        })
      }).catch(()=>{
        user.deleteProject(newPro.id);
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '新建虚构作品失败！'
        })
      })
    })
    .catch((e) =>{
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '新建虚构作品失败！'
      })
    })
  }
})