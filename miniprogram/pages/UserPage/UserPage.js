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
    newname:'',
    cert:''
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "我的"
    })
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

  ScanCode: function(){
    const self = this;
    wx.scanCode({
      success: (res) => {
        self.setData({
          cert: res.result
        })
        client.getUser().verifyCertificate(self.data.cert)
        .then((re)=>{
          if(re.valid === false){
            wx.showModal({
              title: '提示',
              content: '这个证书是假的！',
              showCancel: false,
              confirmText: "我知道了"
            })
          }
          else{
            wx.showModal({
              title: '提示',
              content: '这个证书是真的！签发时间：'+re.time+"持有者公钥："+re.publisher,
              showCancel: false,
              confirmText: "我知道了"
            })
            app.globalData.tmp_arg = {project: re.project};
            wx.navigateTo({
              url: '../projectPage/projectPage',
            })
            console.log(project.name);
          }
        }).catch(()=>{
          wx.showToast({title: "验证失败！"})
        })
      }
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