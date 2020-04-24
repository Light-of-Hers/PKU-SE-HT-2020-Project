const document = require('document.js')
const identity = require('identity.js')

const service = {
    identity,
    document,

    init: function() {
        console.log('Service Init')
        this.identity.init()
        this.document.init()
    }
}

module.exports = service