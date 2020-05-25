const app = getApp();

const document = require('../../service/document')
const filesys = require('../../service/filesys')
const client = require('../../service/client')
const project = require('../../service/project')

Page({
  data:{
    cwd: null,
    pro: null,
    dir: null,
    dirname:''
  },

  onLoad:function(){
    const self = this;
    self.setData({
      cwd: app.globalData.tmp_arg.cwd,
      pro: app.globalData.tmp_arg.project
    })
  },

  bindDirNameInput: function(e){
    const self = this;
    self.data.dirname = e.detail.value;
  },

  newDir: function(){
    const self = this;
    self.data.pro.createSubDocument(self.data.dirname, "text", self.data.cwd.getPath()+"/"+self.data.dirname+"/")
    .then((newDir)=>{
      wx.showToast({title: "新建文件夹成功！", time:2000});
      self.data.dir = new filesys.DirFile(self.data.dirname, newDir.id, self.data.cwd);
      self.data.cwd.addChild(self.data.dir);
      wx.navigateBack({//返回
        delta: 1
      });
    })
    .catch((e) =>{
      wx.showToast({title: "新建文件失败!", time:2000})
    })
  }
}) 