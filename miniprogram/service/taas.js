const sdk = require("miniprogram-taas-sdk")

module.exports = {
    credential: null,
    getCredential(invitationCode) {
        return new Promise((resolve, reject)=>{
            sdk.getCredential(invitationCode, null, (err, data)=>{
                if(err){
                    reject(err)
                }else{
                    this.credential = data.credential
                    resolve(this.credential)
                }
            })
        })
    },
    storeEvidence(data) {
        return new Promise((resolve, reject)=>{
            sdk.storeEvidence(data, null, this.credential, (err, obj) => {
                if(err){
                    reject(err)
                } else{
                    resolve(obj)
                }
            })
        })
    },
    queryEvidence(hashId) {
        return new Promise((resolve, reject)=>{
            sdk.queryEvidence(hashId, null, this.credential, (err, obj) => {
                if(err){
                    reject(err)
                } else{
                    resolve(obj)
                }
            })
        })
    },
    getContractList() {
        return new Promise((resolve, reject)=>{
            sdk.getContractList(null, this.credential, (err, obj) => {
                if(err){
                    reject(err)
                } else{
                    resolve(obj)
                }
            })
        })
    },
    executeContract(contractInfo) {
        return new Promise((resolve, reject)=>{
            sdk.executeContract(contractInfo, null, this.credential, (err, obj) => {
                if(err){
                    reject(err)
                } else{
                    resolve(obj)
                }
            })
        })
    }
}