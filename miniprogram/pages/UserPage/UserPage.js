// pages/UserPage/UserPage.js

const app = getApp()

const document = require('../../service/document')
const client = require('../../service/client')
const user = require('../../service/user')

Page({
  data: {
    Mycre: {
      credential: '',
      publicKey: '',
      privateKey: ''
    },
    Myname:'',
    newname:''
  },

  onLoad: function (options) {
    if(client.getUser() == null) {
      wx.redirectTo({
        url: '../index/index',
      });
    }
    else{
      const self = this;
      const user = client.getUser();
      self.setData({
        Mycre: user.credential,
        Myname: user.name
      });
    }
  },

  onShow: function () {
    if(client.getUser() == null) {
    wx.redirectTo({
      url: '../index/index',
    });
    }   
    else{
      const self = this;
      const user = client.getUser();
      self.setData({
        Mycre: user.credential,
        Myname: user.name
      });
    }
  },

  bindname: function(e) {
    const self = this;
    self.data.newname = e.detail.value;
  },

  rename: function(e){
    const self = this;
    client.getUser().rename(self.data.newname)
    .then(() => {
      wx.showToast({title: "昵称修改成功！", time: 2000})
      //重新渲染页面?
      self.setData({Myname: self.data.newname});
     })
     .catch((e) => {
       wx.showToast({title: "昵称修改失败：" + e.message, icon: "none"})
     })
  },

  logout: function(){
    client.logout();
    wx.showToast({title: "登出成功！", time: 2000});
    wx.redirectTo({
      url: '../index/index',
    });
  }
})