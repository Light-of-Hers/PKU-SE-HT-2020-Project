const sdk = require("miniprogram-taas-sdk")
const sdkp = sdk.promises()
const wxp = require("../../utils/wxpromise.js");

function: getDocumentList(private_key){
	try{
		var list
		list = await wx.getStorageSync({key: 'DocumentList'});
		if (list){
			return list
		}
	}
	catch(e){
		wx.showModal({
            title: '提示',
            content: '无法获取文件列表!',
         });
	}
};

function: getDocument(private_key, id, time){
	try{
		var list
		list = await wx.getStorageSync({key: 'DocumentList'});
		if( list ){
			try{
				if(list.has(id.toString())){
					 try{
					 	documentEntry = list.get(id.toString())
					 	hashID = documentEntry[1]
					 	
					 }
					 catch(e){
					 	wx.showModal({
            				title: '提示',
            				content: '没有这个文件呢！',
         				});
         				console.log(e)
					 }
				}
			}
			cateh(e){
				wx.showModal({
            		title: '提示',
            		content: '没有这个文件呢！',
         		});
         		console.log(e)
			}
		}
	}
	catch(e){
		wx.showModal({
            title: '提示',
            content: '无法获取文件列表！',
         });
		console.log(e)
	}
};