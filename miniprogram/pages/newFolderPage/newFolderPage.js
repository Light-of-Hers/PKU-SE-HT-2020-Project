const app = getApp();

const identity = require('../../service/identity')
const document = require('../../service/document')
const filesys = require('../../service/filesys')

Page({
  data:{
    cwd: null,
    doc: null
  },
  onload:function(){
    this.setData({
      cwd: app.globalData.tmp_arg
    })
  },

  bindDirNameInput: function(e){
    this.data.doc = new Dirfile(e.detail.value, this.data.cwd);
  },

  newDir: function(){
    document.createDocument(this.data.doc.name, this.data.doc.getPath(), null)
    .then((newDocument, timestamp)=>{
      wx.showToast({title: "新建文件成功！"+ timestamp});
      app.globalData.tmp_arg = this.data.doc;
      wx.navigateBack({//返回
        delta: 1
      });
    })
    .catch((e) =>{
      wx.showToast({title: "新建文件失败!"})
    })
  }
})