const client = require('../../service/client')
const fs = require('../../service/filesys')
const phom0 = "您好，欢迎来到“我的创作空间”之摄影作品。这个文档存放您的作品简介。您可以将您对作品的说明、描述、发布文案的各个版本进行上传。从最初草稿到最终定稿，体现您的创作思路，记录您的创作足迹。"
const phom1 = "/manual/Pho/Main/mywork.png"
const phos0 = "您好，欢迎来到“我的创作空间”之摄影作品。在【辅助文档-参数记录】文件夹中，您可以对作品的各种参数进行记录。通过新建文件夹，可以对参数记录进行分类。通过新建文字文档，可以增添参数记录。通过新建图片文档，可以上传参数记录的截图。"
const phos1 = "您好，欢迎来到“我的创作空间”之摄影作品。本文档记录了您的摄影作品的调色参数。您可以将对作品调色过程中的各个参数版本上传至本文档中，记录您的创作思路，体现您的创作过程。"
const phos2 = "您好，欢迎来到“我的创作空间”之摄影作品。本文档记录了您的摄影作品的硬件参数。您可以将可交换图像文件格式（EXIF）的详细信息上传至本文档中，方便日后的查看和使用。"
const phos3 = "您好，欢迎来到“我的创作空间”之摄影作品。在【辅助文档-灵感碎片】文件夹下，您可以管理和上传作品的灵感碎片。通过新建文件夹，可以对灵感碎片进行分类。通过新建文字文档，可以增添灵感碎片。通过新建图片文档，可以上传手稿的截图、灵感来源的照片等。灵光乍现的瞬间，是您原创作品的源泉。"

const artm0 = "您好，欢迎来到“我的创作空间”之绘画作品。这个文档存放您的作品简介。您可以将您对作品的说明、描述、发布文案的各个版本进行上传。从最初草稿到最终定稿，体现您的创作思路，记录您的创作足迹。"
const artm1 = "/manual/Art/Main/我的作品.png"
const arts0 = "您好，欢迎来到“我的创作空间”之绘画作品。在【辅助文档-灵感碎片】文件夹下，您可以管理和上传作品的灵感碎片。通过新建文件夹，可以对灵感碎片进行分类。通过新建文字文档，可以增添灵感碎片。通过新建图片文档，可以上传手稿的截图、灵感来源的照片等。灵光乍现的瞬间，是您原创作品的源泉。"

const realm0 = "您好，欢迎来到“我的创作空间”之纪实文学。这个文档存放文学作品的第一章节，您可以通过新建文字文档来为作品增添新的章节。您可以将每一章节的各个版本进行上传、记录和存证。"
const realm1 = "您好，欢迎来到“我的创作空间”之纪实文学。这个文档存放您的作品简介。您可以将您对作品的说明、描述、文案、简介的各个版本进行上传。从最初草稿到最终定稿，体现您的创作思路，记录您的创作足迹。"
const reals0 = "您好，欢迎来到“我的创作空间”之纪实文学。在【辅助文档-参考资料】文件夹下，您可以管理和上传在创作过程中查询的各种资料。通过新建文件夹，可以对资料进行分类。通过新建文字文档，可以增添资料。通过新建图片文档，可以上传资料的截图或照片。丰富的参考资料，是纪实文学的创作土壤。"
const reals1 = "您好，欢迎来到“我的创作空间”之纪实文学。在【辅助文档-访谈资料】文件夹下，您可以管理和上传在创作过程中的访谈稿件。通过新建文件夹，可以对访谈稿件进行分类。通过新建文字文档，可以增添访谈稿件。通过新建图片文档，可以上传访谈稿件的截图或照片。从录音整理稿到作品中的呈现，体现了您的创作思路，记录了您的创作过程。"
const reals2 = "您好，欢迎来到“我的创作空间”之纪实文学。在【辅助文档-灵感碎片】文件夹下，您可以管理和上传作品的灵感碎片。通过新建文件夹，可以对灵感碎片进行分类。通过新建文字文档，可以增添灵感碎片。通过新建图片文档，可以上传手稿的截图、灵感来源的照片等。文章本天成，妙手偶得之，灵光乍现的瞬间，是您原创作品的源泉。"

const virm0 = "您好，欢迎来到“我的创作空间”之虚构文学。这个文档存放您的小说简介。您可以将小说的文案、简介的各个版本进行上传。从最初草稿到最终定稿，体现您的创作思路，记录您的创作足迹。"
const virm1 = "您好，欢迎来到“我的创作空间”之虚构文学。这个文档存放小说的第一章，您可以通过新建文字文档来为小说作品增添章节。您可以将每一章的各个版本进行上传、记录和存证。"
const virs0 = "您好，欢迎来到“我的创作空间”之虚构文学。在【辅助文档-大纲】文件夹下，您可以管理和上传作品的大纲。通过新建文件夹，可以对大纲文档进行分类。通过新建文字文档，可以增添大纲文档。通过新建图片文档，可以上传手稿的拍照或截图。大纲的逐渐丰满和细化，体现了您的创作思路，记录了您的创作过程。"
const virs1 = "您好，欢迎来到“我的创作空间”之虚构文学。在【辅助文档-人物小传】文件夹下，您可以管理和上传作品的人物小传。通过新建文件夹，可以对人物小传进行分类。通过新建文字文档，可以增添人物小传。通过新建图片文档，可以上传手稿的截图、人物原型的照片、人物外形的草图等。人物逐渐立体，灵魂逐渐丰盈，各个版本的人物小传，体现了您的创作思路，记录了您的创作过程。"
const virs2 = "您好，欢迎来到“我的创作空间”之虚构文学。在【辅助文档-灵感碎片】文件夹下，您可以管理和上传作品的灵感碎片。通过新建文件夹，可以对灵感碎片进行分类。通过新建文字文档，可以增添灵感碎片。通过新建图片文档，可以上传手稿的截图、灵感来源的照片等。文章本天成，妙手偶得之，灵光乍现的瞬间，是您原创作品的源泉。"

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
    wx.showLoading({
      title: '正在创建',
      mask: true
    })
    user.createProject(self.data.proname)
    .then((newPro)=>{
      wx.hideLoading({})
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
      wx.hideLoading({})
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
    let tm0 = {};tm0["text"] = phom0;
    let image = {};image["path"] = phom1;
    let ts0 = {};ts0["text"] = phos0;
    let ts1 = {};ts1["text"] = phos1;
    let ts2 = {};ts2["text"] = phos2;
    let ts3 = {};ts3["text"] = phos3;
    wx.showLoading({
      title: '正在创建',
      mask: true
    })
    let newPro
    user.createProject(self.data.proname)
    .then((pro)=>{
      newPro = pro
      return Promise.all([
        newPro.createMainDocument("作品简介", "text"),
        newPro.createMainDocument("作品", "image"),
        newPro.createSubDocument("参数记录", "text", "/参数记录/"),
        newPro.createSubDocument("参数记录", "text", "/参数记录/参数记录帮助手册.txt"),
        newPro.createSubDocument("调色参数", "text", "/参数记录/调色参数.txt"),
        newPro.createSubDocument("硬件参数", "text", "/参数记录/硬件参数.txt"),
        newPro.createSubDocument("灵感碎片", "text", "/灵感碎片/"),
        newPro.createSubDocument("灵感碎片帮助手册", "text", "/灵感碎片/灵感碎片帮助手册.txt"),
        newPro.createSubDocument("其他", "text", "/其他/")
      ])
    })
    .then((docs)=>{
      return Promise.all([
        docs[0].createVersion(tm0),
        docs[1].createVersion(image),
        docs[3].createVersion(ts0),
        docs[4].createVersion(ts1),
        docs[5].createVersion(ts2),
        docs[7].createVersion(ts3),
      ])
    })
    .then(()=>{
      wx.hideLoading({})
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
    })
    .catch((e)=>{
      console.error(e)
      wx.hideLoading({})
      client.getUser().deleteProject(newPro.id);
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
    let tm0 = {};tm0["text"] = artm0;
    let ts0 = {};ts0["text"] = arts0;
    let image = {};image["path"] = artm1;
    wx.showLoading({
      title: '正在创建',
      mask: true
    })
    let newPro
    user.createProject(self.data.proname)
    .then((pro)=>{
      newPro = pro
      return Promise.all([
        newPro.createMainDocument("作品简介", "text"),
        newPro.createMainDocument("作品", "image"),
        newPro.createSubDocument("灵感碎片", "text", "/灵感碎片/"),
        newPro.createSubDocument("灵感碎片帮助手册", "text", "/灵感碎片/灵感碎片帮助手册.txt"),
        newPro.createSubDocument("其他", "text", "/其他/")
      ])
    })
      .then((docs)=>{
        return Promise.all([
          docs[0].createVersion(tm0),
          docs[1].createVersion(image),
          docs[3].createVersion(ts0),
        ])
      })
      .then(()=>{
          newPro.FSRoot = fs.buildFS(newPro.subDocuments);
          wx.hideLoading({})
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
        })
        .catch(()=>{
          user.deleteProject(newPro.id);
          wx.hideLoading({})
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '2新建绘画作品失败！'
          })
        })
  },

  newReal: function(){
    wx.showLoading({
      title: '正在创建',
      mask: true
    })
    const self = this;
    var user = client.getUser();
    let tm0 = {}; tm0["text"] = realm0;
    let tm1 = {}; tm1["text"] = realm1;
    let ts0 = {}; ts0["text"] = reals0;
    let ts1 = {}; ts1["text"] = reals1;
    let ts2 = {}; ts2["text"] = reals2;
    user.createProject(self.data.proname)
    .then((newPro)=>{
      return Promise.all([
        newPro.createMainDocument("第一章节", "text"),
        newPro.createMainDocument("作品简介", "text"),
        newPro.createSubDocument("参考资料", "text", "/参考资料/"),
        newPro.createSubDocument("参考资料帮助手册", "text", "/参考资料/参考资料帮助手册.txt"),
        newPro.createSubDocument("访谈资料", "text", "/访谈资料/"),
        newPro.createSubDocument("访谈资料帮助手册", "text", "/访谈资料/访谈资料帮助手册.txt"),
        newPro.createSubDocument("灵感碎片", "text", "/灵感碎片/"),
        newPro.createSubDocument("灵感碎片帮助手册", "text", "/灵感碎片/灵感碎片帮助手册.txt"),
        newPro.createSubDocument("其他", "text", "/其他/")
      ]).then((docs)=>{
        return Promise.all([
          docs[0].createVersion(tm0), 
          docs[1].createVersion(tm1),
          docs[3].createVersion(ts0),
          docs[5].createVersion(ts1),
          docs[7].createVersion(ts2),
        ]).then(()=>{
          newPro.FSRoot = fs.buildFS(newPro.subDocuments);
          wx.hideLoading({})
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
            content: '2新建纪实文学作品失败！'
          })
          wx.hideLoading({})
        })
       
      }).catch(()=>{
        user.deleteProject(newPro.id);
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '新建纪实文学作品失败！'
        })
        wx.hideLoading({})
      })
    })
    .catch((e) =>{
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '新建纪实文学作品失败！'
      })
      wx.hideLoading({})
    })
  },

  newVir: function(){
    wx.showLoading({
      title: '正在创建',
      mask: true
    })
    const self = this;
    var user = client.getUser();
    let tm0 = {}; tm0["text"] = virm0;
    let tm1 = {}; tm1["text"] = virm1;
    let ts0 = {}; ts0["text"] = virs0;
    let ts1 = {}; ts1["text"] = virs1;
    let ts2 = {}; ts2["text"] = virs2;
    user.createProject(self.data.proname)
    .then((newPro)=>{
      const root = newPro.FSRoot; 
      return Promise.all([
        newPro.createMainDocument("小说简介", "text"),
        newPro.createMainDocument("第一章", "text"),
        newPro.createSubDocument("大纲", "text", "/大纲/"),
        newPro.createSubDocument("大纲帮助手册", "text", "/大纲/大纲帮助手册.txt"),
        newPro.createSubDocument("人物小传", "text", "/人物小传/"),
        newPro.createSubDocument("人物小传帮助手册", "text", "/人物小传/人物小传帮助手册.txt"),
        newPro.createSubDocument("灵感碎片", "text", "/灵感碎片/"),
        newPro.createSubDocument("灵感碎片帮助手册", "text", "/灵感碎片/灵感碎片帮助手册.txt"),
        newPro.createSubDocument("其他", "text", "/其他/")
      ]).then((docs)=>{
        return Promise.all([
          docs[0].createVersion(tm0),
          docs[1].createVersion(tm1),
          docs[3].createVersion(ts0),
          docs[5].createVersion(ts1),
          docs[7].createVersion(ts2),
        ]).then(()=>{
          wx.hideLoading({})
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
          wx.hideLoading({})
          user.deleteProject(newPro.id);
          wx.showModal({
            title: '提示',
            showCancel: false,
            content: '2新建虚构作品失败！'
          })
        })
      }).catch(()=>{
        wx.hideLoading({})
        user.deleteProject(newPro.id);
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '新建虚构作品失败！'
        })
      })
    })
    .catch((e) =>{
      wx.hideLoading({})
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '新建虚构作品失败！'
      })
    })
  }
})

