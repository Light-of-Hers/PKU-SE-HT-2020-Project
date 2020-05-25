const app = getApp();

const identity = require('../../service/identity')
const document = require('../../service/document')
const filesys = require('../../service/filesys')
const client = require('../../service/client')
const project = require('../../service/project')

Page({
  data: {
    pro: null,
    docname: '',
    type: true,
    input: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    self.setData({
      pro: app.globalData.tmp_arg
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
    var typ;
    self.data.type? typ = "text":typ = "path";
    self.data.pro.createMainDocument(self.data.docname, typ)
    .then((newDocument)=>{
      newDocument.createVersion({typ : self.data.input})//迷茫
      .then(()=>{
        wx.showToast({title: "新建主文件成功！", time: 2000});
      })
      .catch((e) =>{
        wx.showToast({title: "新建主文件失败!", time: 2000});
      })
      wx.navigateBack({//返回
        delta: 1
      });
    })
    .catch((e) =>{
      wx.showToast({title: "新建主文件失败!", time: 2000})
    })
  }

})