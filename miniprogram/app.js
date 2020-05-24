//app.js
App({
  onLaunch: function () {

    // if (!wx.cloud) {
    //   console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    // } else {
    //   wx.cloud.init({
    //     // env 参数说明：
    //     //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
    //     //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
    //     //   如不填则使用默认环境（第一个创建的环境）
    //     // env: 'my-env-id',
    //     traceUser: true,
    //   })
    // }
    const taas = require('service/taas.js')
    const User = require('service/user.js')
    const credential = {
      publicKey: "04ab0e5c13983507233a6b0775caf7b5814a8ce0129ea004498bc731bea9ff774f3d6ac3013f1522731be2be2ed0889dd22ef6dedbd8b70fc0b97fd087b13a9ed1",
      privateKey: "61322afafd9e23f00af646b637344c14a0447c29cadb813d8f0e2774656d28df",
      credential: "80fe572056f829dfaab3add6ade0921f3a092b8c"
    }
    taas.credential = credential
    taas.initContract()
  }
})
