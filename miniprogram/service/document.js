class DocumentInfo {
    constructor(id, name, versions) {
        this.id = id
        this.name = name
        this.versions = versions
    }

    isMain() {
        return this.id == 0;
    }
}

function getDocumentList(private_key) {
    console.log("getDocumentList: Not Implement Yet")
    const test_list = [new DocumentInfo(0, "Test", [1,2,3])]
    return new Promise((resolve, reject) => {
        if(private_key != 'fail') {
            resolve(test_list)
        } else {
            reject('Fail!')
        }
    })
}

function getDocument(private_key, id, time=null) {
    console.log("getDocument: Not Implement Yet")
    return new Promise((resolve, reject) => {
        if(private_key != 'fail') {
            resolve(`此处省略1000字(id=${id})`)
        } else {
            reject('Fail!')
        }
    })
}

function createDocument(private_key, name) {
    console.log("createDocument: Not Implement Yet")
    return new Promise((resolve, reject) => {
        if(private_key != 'fail') {
            resolve(0)
        } else {
            reject('Fail!')
        }
    })
}

function updateDocument(private_key, id, content) {
    console.log("updateDocument: Not Implement Yet")
    return new Promise((resolve, reject) => { 
        if(private_key != 'fail') {
            resolve(new Date().getTime())
        } else {
            reject('Fail!')
        }
    })
}

module.exports = {
    getDocumentList,
    getDocument,
    createDocument,
    updateDocument
}