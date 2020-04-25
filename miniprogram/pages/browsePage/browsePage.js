const fs = require("../../service/filesys");
const app = getApp();

Page({
    data: {
        cwd: null,
        files: [],
        needRerender: false,
    },
    onLoad: function () {
        const self = this; // 静态绑定this，仅个人习惯
        const dir = app.globalData.root;
        dir.addChild(new fs.DirFile("fuck"));
        dir.addChild(new fs.DirFile("goushi"));
        dir.addChild(new fs.DirFile("NM$L"));
        self.changeDir(dir);
    },
    onShow: function () {
        const self = this;
        if (self.data.needRerender) {
            self.render();
            self.data.needRerender = false;
        }
    },
    changeDir: function (dir) {
        const self = this;
        if (dir instanceof fs.DirFile) {
            console.log(`change to directory: ${dir.name}`);
            self.data.cwd = dir;
            self.render();
        } else {
            console.error(`not a DirFile: ${dir}`);
        }
    },
    render: function () {
        const self = this;
        console.log("rendering page...");
        self.data.files = Array.from(self.data.cwd.children.entries()).map(item => ({ name: item[0], file: item[1] }));
        self.setData({
            files: self.data.files,
        });
    },
    browseFile: function (event) {
        const self = this;
        const idx = event.currentTarget.dataset.fileIndex;
        const file = self.data.files[idx].file;
        if (file instanceof fs.DocFile) {
            console.log(`click DocFile: ${file.name}`);
            app.globalData.tmp_arg = file;
            wx.navigateTo({
                url: '../viewPage/viewPage',
            });
        } else if (file instanceof fs.DirFile) {
            console.log(`click DirFile: ${file.name}`);
            self.changeDir(file);
        }
    },
    uploadFile: function () {
        const self = this;
        wx.navigateTo({
            url: '../uploadPage/uploadPage',
            events: {
                newFileCreated: () => self.data.needRerender = true,
                passCwd: null,
            },
            success: res => res.eventChannel.emit("passCwd", self.data.cwd),
        });
    },
})