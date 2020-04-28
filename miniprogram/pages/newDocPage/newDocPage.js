const app = getApp();

const identity = require('../../service/identity')
const document = require('../../service/document')
const filesys = require('../../service/filesys')

Page({
  data:{
    cwd: null,
    doc: null
  },
  onLoad:function(){
    const self = this;
    self.data.cwd = app.globalData.tmp_arg;
  },

  bindDocNameInput: function(e){
    const self = this;
    self.data.doc = new filesys.DocFile(e.detail.value, null, self.data.cwd);
  },

  newDoc: function(){
    const self = this;
    //document.createDocument(self.data.doc.name, self.data.doc.getPath(), null)
    //.then((newDocument, timestamp)=>{
    //  wx.showToast({title: "新建文件成功！"+ timestamp});
      wx.showToast({title: "新建文件成功！"});
      self.data.cwd.addChild(self.data.doc);
      wx.navigateBack({//返回
        delta: 1
      });
    /*})
    .catch((e) =>{
      wx.showToast({title: "新建文件失败!"})
    })*/
  }
})