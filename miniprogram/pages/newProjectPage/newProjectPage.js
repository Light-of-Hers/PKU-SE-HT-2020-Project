const client = require('../../service/client')
const fs = require('../../service/filesys')
const phom0 = "您好，欢迎来到“我的创作空间”之摄影作品。这个文档存放您的作品简介。您可以将您对作品的说明、描述、发布文案的各个版本进行上传。从最初草稿到最终定稿，体现您的创作思路，记录您的创作足迹。"
const phom1 = "/manual/Pho/Main/mywork.png"
const phos0 = "您好，欢迎来到“我的创作空间”之摄影作品。在【辅助文档-参数记录】文件夹中，您可以对作品的各种参数进行记录。通过新建文件夹，可以对参数记录进行分类。通过新建文字文档，可以增添参数记录。通过新建图片文档，可以上传参数记录的截图。"
const phos1 = "您好，欢迎来到“我的创作空间”之摄影作品。本文档记录了您的摄影作品的调色参数。您可以将对作品调色过程中的各个参数版本上传至本文档中，记录您的创作思路，体现您的创作过程。"
const phos2 = "您好，欢迎来到“我的创作空间”之摄影作品。本文档记录了您的摄影作品的硬件参数。您可以将可交换图像文件格式（EXIF）的详细信息上传至本文档中，方便日后的查看和使用。"
const phos3 = "您好，欢迎来到“我的创作空间”之摄影作品。在【辅助文档-灵感碎片】文件夹下，您可以管理和上传作品的灵感碎片。通过新建文件夹，可以对灵感碎片进行分类。通过新建文字文档，可以增添灵感碎片。通过新建图片文档，可以上传手稿的截图、灵感来源的照片等。灵光乍现的瞬间，是您原创作品的源泉。"

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
    let text = {};
    let image = {};
    user.createProject(self.data.proname)
    .then((newPro)=>{
      const root = newPro.FSRoot; 
      Promise.all([
        newPro.createMainDocument("作品简介", "text"),
        text["text"] = phom0,
        newPro.mainDocuments[0].createVersion(text),
        newPro.createMainDocument("作品", "image"),
        image["path"] = phom1,
        newPro.mainDocuments[1].createVersion(image),
        newPro.createSubDocument("参数记录", "text", "/参数记录/"),
        newPro.createSubDocument("参数记录", "text", "/参数记录/参数记录帮助手册.txt"),
        text["text"] = phos0,
        newPro.subDocuments[1].createVersion(text),
        newPro.createSubDocument("调色参数", "text", "/参数记录/调色参数.txt"),
        text["text"] = phos1,
        newPro.subDocuments[2].createVersion(text),
        newPro.createSubDocument("硬件参数", "text", "/参数记录/硬件参数.txt"),
        text["text"] = phos2,
        newPro.subDocuments[3].createVersion(text),
        newPro.createSubDocument("灵感碎片", "text", "/灵感碎片/"),
        newPro.createSubDocument("灵感碎片帮助手册", "text", "/灵感碎片/灵感碎片帮助手册.txt"),
        text["text"] = phos3,
        newPro.subDocuments[5].createVersion(text),
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
        //client.getUser().deleteProject(newPro.id);
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

