const fs = require("../../service/filesys");
const document = require("../../service/document")
const app = getApp();

Page({
    data: {
        project: null,
        docs: null,
        needRerender: false,
    },
    onLoad: function () {
        const self = this;
        self.data.project = app.globalData.tmp_arg;
        self.render();
    },
    onShow: function () {
        const self = this;
        if (self.data.needRerender) {
            self.data.needRerender = false;
            self.render();
        }
    },
    render: function () {
        const self = this;
        self.data.docs = self.data.project.mainDocuments;
        self.setData({
            docs: self.data.docs
        });
    },
    onOpenSupport: function () {
        const self = this;
        app.globalData.tmp_arg = self.data.project;
        wx.navigateTo({
            url: '../browsePage/browsePage',
        });
    },
    onNewMainDoc: function () {
        const self = this;
        self.data.needRerender = true;
        app.globalData.tmp_arg = self.data.project;
        wx.navigateTo({
            url: '../newMainDocPage/newMainDocPage',
        });
    },
    onViewMainDoc: function (event) {
        const self = this;
        const idx = event.currentTarget.dataset.fileIndex;
        const doc = self.data.docs[idx];
        app.globalData.tmp_arg = doc;
        wx.navigateTo({
            url: '../viewPage/viewPage',
        })
    },
    onDeleteMainDoc: function (event) {
        const self = this;
        const idx = event.currentTarget.dataset.fileIndex;
        const doc = self.data.docs[idx];
        wx.showModal({
            title: "提示",
            content: `确定要删除主文档"${doc.name}"吗？`,
            success: res => {
                if (res.confirm) {
                    self.data.project.deleteDocument(doc.id);
                    self.render();
                } else if (res.cancel) {
                    return false;
                }
            }
        })
    }
})
