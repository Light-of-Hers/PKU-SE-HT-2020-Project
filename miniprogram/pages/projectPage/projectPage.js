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
        self.setData({
            docs: self.data.project.mainDocuments
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
    onManipulateMainDoc: function (event) {
        const self = this;
        const idx = event.currentTarget.dataset.fileIndex;
        const doc = self.data.docs[idx];
        let action = "";
        const itemList = ['删除', '重命名'];
        wx.showActionSheet({
            itemList: itemList,
            success: res => {
                action = itemList[res.tapIndex];
                if (action === "删除") {
                    wx.showModal({
                        title: '提示',
                        content: `确认删除主文档“${doc.name}”？`,
                        success: res => {
                            if (res.confirm) {
                                self.data.project.deleteDocument(doc.id);
                                self.render();
                            }
                        },
                    });
                } else if (action === "重命名") {
                    self.data.needRerender = true;
                    app.globalData.tmp_arg = doc;
                    wx.navigateTo({
                        url: '../renamePage/renamePage',
                    });
                }
            }
        });
    }
})