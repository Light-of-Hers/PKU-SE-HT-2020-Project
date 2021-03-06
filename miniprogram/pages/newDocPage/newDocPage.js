const app = getApp();

const document = require('../../service/document')
const filesys = require('../../service/filesys')
const client = require('../../service/client')
const project = require('../../service/project')

Page({
  data:{
    pro: null,
    cwd: null,
    docf: null,
    docname: '',
    type: true,
    input: ''
  },

  onLoad:function(){
    const self = this;
    self.setData({
      cwd: app.globalData.tmp_arg.cwd,
      pro: app.globalData.tmp_arg.project
    })
  },

  bindDocNameInput: function(e){
    const self = this;
    self.data.docname = e.detail.value;
  },

  inputHandle: function(e) {
    this.setData({
      input: e.detail.value
    })
  },

  clearInput: function() {
    this.setData({
      input: ''
    })
  },

  getImg: function() {
    const self = this;
    wx.chooseImage({
      success: function(res) {
        self.setData({
          input: res.tempFilePaths[0]
        })
      }
    })
  },

  taptext: function(){
    this.setData({
      type: true
    });
  },

  tapimage: function(){
    this.setData({
      type: false
    });
  },

  newDoc: function(){
    const self = this;
    var typ, suffix;
    self.data.type? typ = "text":typ = "path";
    self.data.type? suffix = ".txt":suffix = ".png";//不确定图片后缀应该写什么
    suffix = ""; // 那就不加吧~
    self.data.docname += suffix
    wx.showLoading({
      title: '正在创建文档',
      mask: true
    })
    self.data.pro.createSubDocument(self.data.docname, typ === "text" ? "text" : "image", self.data.cwd.getPath()+self.data.docname)
    .then((newDocument)=>{
      wx.showLoading({
        title: '正在提交内容',
        mask: true
      })
      self.data.docf = new filesys.DocFile(self.data.docname, newDocument, self.data.cwd);
      self.data.cwd.addChild(self.data.docf);
      let content = {};
      content[typ] = self.data.input;
      return newDocument.createVersion(content)//迷茫
      .then(()=>{
        wx.navigateBack({//返回
          delta: 1,
          success: () => {
            wx.showToast({title: "新建文件成功！", time: 2000});
          }
        });
      })
      .catch((e) =>{
        wx.navigateBack({//返回
          delta: 1,
          success: () => {
            wx.showToast({title: "写入文件内容失败!", time: 2000});
          }
        });
      })
    })
    .catch((e) =>{
      console.log(e);
      wx.navigateBack({//返回
        delta: 1,
        success: () => {
          wx.showToast({title: "新建文件失败!", time: 2000})
        }
      });
    })
  }
})