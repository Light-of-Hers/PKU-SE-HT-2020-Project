const fs = require("../../service/filesys");
require("../../service/document");
const app = getApp();
const QRCode = require("../../utils/qrcode");

Page({
    data: {
        width: 0,
        height: 0,
        canvas: null,
        images: {},
        qrcode: "",
        info: null,
        QRCodeSaved: false,
    },
    onLoad: function () {
        const self = this;
        self.data.info = app.globalData.tmp_arg;
        self.data.canvas = wx.createCanvasContext('certificate');
        Promise.all([self.loadSysConfig(), self.loadImage("certificate"), self.loadQRCode()])
            .then(self.drawCertificate);
    },
    loadSysConfig: function () {
        const self = this;
        return new Promise((resolve, reject) => {
            wx.getSystemInfo({
                success: res => {
                    self.setData({
                        width: res.windowWidth,
                        height: res.windowHeight,
                    });
                    resolve();
                },
            });
        });
    },
    loadImage: function (name) {
        const self = this;
        const path = `${wx.env.USER_DATA_PATH}/certificate-${name}.png`;
        return new Promise((resolve, reject) => {
            wx.getFileSystemManager().copyFile({
                srcPath: `pages/certificatePage/${name}.png`,
                destPath: path,
                success: () => {
                    self.data.images[name] = path;
                    resolve();
                }
            });
        });
    },
    loadQRCode: function () {
        const self = this;
        return new Promise((resolve, reject) => {
            new QRCode('qrcode', {
                text: self.data.info.content,
                width: 200,
                height: 200,
                padding: 12,
                correctLevel: QRCode.CorrectLevel.L,
                callback: (res) => {
                    self.setData({
                        qrcode: res.path,
                        QRCodeSaved: true,
                    });
                    resolve();
                }
            });
        });
    },
    drawCertificate: function () {
        const self = this;
        const { canvas, width, height, images, qrcode, info } = self.data;

        const org_width = 3000, org_height = 4300;
        const real_x = x => width * (x / org_width), real_y = y => height * (y / org_height);
        const qrsize = width / 2 - 30;

        canvas.drawImage(images["certificate"], 0, 0, width, height);
        canvas.drawImage(qrcode, (width - qrsize) / 2, height / 2, qrsize, qrsize);

        canvas.setFontSize(10);
        canvas.setTextBaseline("bottom");
        canvas.fillText(info.time, real_x(1743), real_y(1227));
        canvas.fillText(`${info.author} (publicKey: ${info.publicKey.substring(0, 16)}...)`, real_x(1066), real_y(1548));
        canvas.fillText(info.name, real_x(1173), real_y(1734));
        canvas.fillText(info.time0, real_x(1252), real_y(1858));
        canvas.fillText(`~ ${info.time1}`, real_x(1252), real_y(1858) + 10);
        canvas.fillText(`${info.hash0} ~ ${info.hash1}`, real_x(1252), real_y(2124));
        canvas.draw();
    },
    onExportCertificate: function () {
        const self = this;
        wx.showModal({
            title: "提示",
            content: "是否导出证书？",
            success: res => {
                if (!res.confirm) return;
                wx.canvasToTempFilePath({
                    canvasId: 'certificate',
                    success: res => {
                        wx.saveImageToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: () => {
                                wx.showToast({
                                    title: '导出成功',
                                })
                            }
                        });
                    },
                });
            }
        });
    }
})