module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = { exports: {} }; __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); if(typeof m.exports === "object") { __MODS__[modId].m.exports.__proto__ = m.exports.__proto__; Object.keys(m.exports).forEach(function(k) { __MODS__[modId].m.exports[k] = m.exports[k]; var desp = Object.getOwnPropertyDescriptor(m.exports, k); if(desp && desp.configurable) Object.defineProperty(m.exports, k, { set: function(val) { __MODS__[modId].m.exports[k] = val; }, get: function() { return __MODS__[modId].m.exports[k]; } }); }); if(m.exports.__esModule) Object.defineProperty(__MODS__[modId].m.exports, "__esModule", { value: true }); } else { __MODS__[modId].m.exports = m.exports; } } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1587473244015, function(require, module, exports) {
module.exports = {
    sm2: require('./src/sm2/index'),
    sm3: require('./src/sm3/index'),
    sm4: require('./src/sm4/index'),
};

}, function(modId) {var map = {"./src/sm2/index":1587473244016,"./src/sm3/index":1587473244022,"./src/sm4/index":1587473244023}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587473244016, function(require, module, exports) {
const { BigInteger } = require('jsbn');
const { encodeDer, decodeDer } = require('./asn1');
const SM3Digest = require('./sm3');
const SM2Cipher = require('./sm2');
const _ = require('./utils');

let { G, curve, n } = _.generateEcparam();
const C1C2C3 = 0;

/**
 * 加密
 */
function doEncrypt(msg, publicKey, cipherMode = 1) {
    let cipher = new SM2Cipher();
    msg = _.hexToArray(_.parseUtf8StringToHex(msg));

    if (publicKey.length > 128) {
      publicKey = publicKey.substr(publicKey.length - 128);
    }
    let xHex = publicKey.substr(0, 64);
    let yHex = publicKey.substr(64);
    publicKey = cipher.createPoint(xHex, yHex);

    let c1 = cipher.initEncipher(publicKey);

    cipher.encryptBlock(msg);
    let c2 = _.arrayToHex(msg);

    let c3 = new Array(32);
    cipher.doFinal(c3)
    c3 = _.arrayToHex(c3);

    return cipherMode === C1C2C3 ? c1 + c2 + c3 : c1 + c3 + c2;
}

/**
 * 解密
 */
function doDecrypt(encryptData, privateKey, cipherMode = 1) {
    let cipher = new SM2Cipher();

    privateKey = new BigInteger(privateKey, 16);

    let c1X = encryptData.substr(0, 64);
    let c1Y = encryptData.substr(0 + c1X.length, 64);
    let c1Length = c1X.length + c1Y.length;

    let c3 = encryptData.substr(c1Length, 64);
    let c2 = encryptData.substr(c1Length + 64);

    if (cipherMode === C1C2C3) {
        c3 = encryptData.substr(encryptData.length - 64);
        c2 = encryptData.substr(c1Length, encryptData.length - c1Length - 64);
    }

    let data = _.hexToArray(c2);

    let c1 = cipher.createPoint(c1X, c1Y);
    cipher.initDecipher(privateKey, c1);
    cipher.decryptBlock(data);
    let c3_ = new Array(32);
    cipher.doFinal(c3_);

    let isDecrypt = _.arrayToHex(c3_) === c3;

    if (isDecrypt) {
        let decryptData = _.arrayToUtf8(data);
        return decryptData;
    } else {
        return '';
    }
}

/**
 * 签名
 */
function doSignature(msg, privateKey, { pointPool, der, hash, publicKey } = {}) {
    let hashHex = typeof msg === 'string' ? _.parseUtf8StringToHex(msg) : _.parseArrayBufferToHex(msg);

    if (hash) {
        // sm3杂凑
        publicKey = publicKey || getPublicKeyFromPrivateKey(privateKey);
        hashHex = doSm3Hash(hashHex, publicKey);
    }

    let dA = new BigInteger(privateKey, 16);
    let e = new BigInteger(hashHex, 16);

    // k
    let k = null;
    let r = null;
    let s = null;

    do {
        do {
            let point;
            if (pointPool && pointPool.length) {
                point = pointPool.pop();
            } else {
                point = getPoint();
            }
            k = point.k;

            // r = (e + x1) mod n
            r = e.add(point.x1).mod(n);
        } while (r.equals(BigInteger.ZERO) || r.add(k).equals(n));

        // s = ((1 + dA)^-1 * (k - r * dA)) mod n
        s = dA.add(BigInteger.ONE).modInverse(n).multiply(k.subtract(r.multiply(dA))).mod(n);
    } while (s.equals(BigInteger.ZERO));

    if (der) {
        // asn1 der编码
        return encodeDer(r, s);
    }

    return _.leftPad(r.toString(16), 64) + _.leftPad(s.toString(16), 64);
}

/**
 * 验签
 */
function doVerifySignature(msg, signHex, publicKey, { der, hash } = {}) {
    let hashHex = typeof msg === 'string' ? _.parseUtf8StringToHex(msg) : _.parseArrayBufferToHex(msg);

    if (hash) {
        // sm3杂凑
        hashHex = doSm3Hash(hashHex, publicKey);
    }

    let r, s;
    if (der) {
        let decodeDerObj = decodeDer(signHex);
        r = decodeDerObj.r;
        s = decodeDerObj.s;
    } else {
        r = new BigInteger(signHex.substring(0, 64), 16);
        s = new BigInteger(signHex.substring(64), 16);
    }

    let PA = curve.decodePointHex(publicKey);
    let e = new BigInteger(hashHex, 16);

    // t = (r + s) mod n
    let t = r.add(s).mod(n);

    if (t.equals(BigInteger.ZERO)) return false;

    // x1y1 = s * G + t * PA
    let x1y1 = G.multiply(s).add(PA.multiply(t));

    // R = (e + x1) mod n
    let R = e.add(x1y1.getX().toBigInteger()).mod(n);

    return r.equals(R);
}

/**
 * sm3杂凑算法
 */
function doSm3Hash(hashHex, publicKey) {
    let smDigest = new SM3Digest();
    
    let z = new SM3Digest().getZ(G, publicKey.substr(2, 128));
    let zValue = _.hexToArray(_.arrayToHex(z).toString());
    
    let p = hashHex;
    let pValue = _.hexToArray(p);
    
    let hashData = new Array(smDigest.getDigestSize());
    smDigest.blockUpdate(zValue, 0, zValue.length);
    smDigest.blockUpdate(pValue, 0, pValue.length);
    smDigest.doFinal(hashData, 0);

    return _.arrayToHex(hashData).toString();
}

/**
 * 计算公钥
 */
function getPublicKeyFromPrivateKey(privateKey) {
    let PA = G.multiply(new BigInteger(privateKey, 16));
    let x = _.leftPad(PA.getX().toBigInteger().toString(16), 64);
    let y = _.leftPad(PA.getY().toBigInteger().toString(16), 64);
    return '04' + x + y;
}

/**
 * 获取椭圆曲线点
 */
function getPoint() {
    let keypair = _.generateKeyPairHex();
    let PA = curve.decodePointHex(keypair.publicKey);

    keypair.k = new BigInteger(keypair.privateKey, 16);
    keypair.x1 = PA.getX().toBigInteger();

    return keypair;
};

module.exports = {
    generateKeyPairHex: _.generateKeyPairHex,
    doEncrypt,
    doDecrypt,
    doSignature,
    doVerifySignature,
    getPoint,
};

}, function(modId) { var map = {"./asn1":1587473244017,"./sm3":1587473244018,"./sm2":1587473244021,"./utils":1587473244019}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587473244017, function(require, module, exports) {
const { BigInteger } = require('jsbn');

function bigIntToMinTwosComplementsHex(bigIntegerValue) {
    let h = bigIntegerValue.toString(16);
    if (h.substr(0, 1) !== '-') {
        if (h.length % 2 === 1) {
            h = '0' + h;
        } else if (!h.match(/^[0-7]/)) {
            h = '00' + h;
        }
    } else {
        let hPos = h.substr(1);
        let xorLen = hPos.length;
        if (xorLen % 2 === 1) {
            xorLen += 1;
        } else if (!h.match(/^[0-7]/)) {
            xorLen += 2;
        }
        let hMask = '';
        for (let i = 0; i < xorLen; i++) {
            hMask += 'f';
        }
        let biMask = new BigInteger(hMask, 16);
        let biNeg = biMask.xor(bigIntegerValue).add(BigInteger.ONE);
        h = biNeg.toString(16).replace(/^-/, '');
    }
    return h;
}
 
/**
 * base class for ASN.1 DER encoder object
 */
class ASN1Object {
    constructor() {
        this.isModified = true;
        this.hTLV = null;
        this.hT = '00';
        this.hL = '00';
        this.hV = '';
    }
 
    /**
     * get hexadecimal ASN.1 TLV length(L) bytes from TLV value(V)
     */
    getLengthHexFromValue() {
        let n = this.hV.length / 2;
        let hN = n.toString(16);
        if (hN.length % 2 == 1) {
            hN = '0' + hN;
        }
        if (n < 128) {
            return hN;
        } else {
            let hNlen = hN.length / 2;
            let head = 128 + hNlen;
            return head.toString(16) + hN;
        }
    }
 
    /**
     * get hexadecimal string of ASN.1 TLV bytes
     */
    getEncodedHex() {
        if (this.hTLV == null || this.isModified) {
            this.hV = this.getFreshValueHex();
            this.hL = this.getLengthHexFromValue();
            this.hTLV = this.hT + this.hL + this.hV;
            this.isModified = false;
        }
        return this.hTLV;
    }
 
    getFreshValueHex() {
        return '';
    }
};
 
/**
 * class for ASN.1 DER Integer
 */
class DERInteger extends ASN1Object {
    constructor(options) {
        super();

        this.hT = '02';
        if (options && options.bigint) {
            this.hTLV = null;
            this.isModified = true;
            this.hV = bigIntToMinTwosComplementsHex(options.bigint);
        }
    }
 
    getFreshValueHex() {
        return this.hV;
    }
}

/**
 * class for ASN.1 DER Sequence
 */
class DERSequence extends ASN1Object {

    constructor(options) {
        super();
     
        this.hT = '30';
        this.asn1Array = [];
        if (options && options.array) {
            this.asn1Array = options.array;
        }
    }

    getFreshValueHex() {
        let h = '';
        for (let i = 0; i < this.asn1Array.length; i++) {
            let asn1Obj = this.asn1Array[i];
            h += asn1Obj.getEncodedHex();
        }
        this.hV = h;
        return this.hV;
    }
}

/**
 * get byte length for ASN.1 L(length) bytes
 */
function getByteLengthOfL(s, pos) {
    if (s.substring(pos + 2, pos + 3) !== '8') return 1;
    let i = parseInt(s.substring(pos + 3, pos + 4));
    if (i === 0) return -1; // length octet '80' indefinite length
    if (0 < i && i < 10) return i + 1;  // including '8?' octet;
    return -2; // malformed format
}

/**
 * get hexadecimal string for ASN.1 L(length) bytes
 */
function getHexOfL(s, pos) {
    let len = getByteLengthOfL(s, pos);
    if (len < 1) return '';
    return s.substring(pos + 2, pos + 2 + len * 2);
}

/**
 * get integer value of ASN.1 length for ASN.1 data
 */
function getIntOfL(s, pos) {
    let hLength = getHexOfL(s, pos);
    if (hLength === '') return -1;
    let bi;
    if (parseInt(hLength.substring(0, 1)) < 8) {
        bi = new BigInteger(hLength, 16);
    } else {
        bi = new BigInteger(hLength.substring(2), 16);
    }
    return bi.intValue();
}

/**
 * get ASN.1 value starting string position for ASN.1 object refered by index 'idx'.
 */
function getStartPosOfV(s, pos) {
    let lLen = getByteLengthOfL(s, pos);
    if (lLen < 0) return l_len;
    return pos + (lLen + 1) * 2;
}

/**
 * get hexadecimal string of ASN.1 V(value)
 */
function getHexOfV(s, pos) {
    let pos1 = getStartPosOfV(s, pos);
    let len = getIntOfL(s, pos);
    return s.substring(pos1, pos1 + len * 2);
}

/**
 * get next sibling starting index for ASN.1 object string
 */
function getPosOfNextSibling(s, pos) {
    let pos1 = getStartPosOfV(s, pos);
    let len = getIntOfL(s, pos);
    return pos1 + len * 2;
}

/**
 * get array of indexes of child ASN.1 objects
 */
function getPosArrayOfChildren(h, pos) {
    let a = [];
    let p0 = getStartPosOfV(h, pos);
    a.push(p0);

    let len = getIntOfL(h, pos);
    let p = p0;
    let k = 0;
    while (1) {
        var pNext = getPosOfNextSibling(h, p);
        if (pNext === null || (pNext - p0  >= (len * 2))) break;
        if (k >= 200) break;
        
        a.push(pNext);
        p = pNext;
        
        k++;
    }

    return a;
}

module.exports = {
    /**
     * ASN.1 DER编码
     */
    encodeDer(r, s) {
        let derR = new DERInteger({ bigint: r });
        let derS = new DERInteger({ bigint: s });
        let derSeq = new DERSequence({ array: [derR, derS] });

        return derSeq.getEncodedHex();
    },

    /**
     * 解析 ASN.1 DER
     */
    decodeDer(input) {
        // 1. Items of ASN.1 Sequence Check
        let a = getPosArrayOfChildren(input, 0);
        
        // 2. Integer check
        let iTLV1 = a[0];
        let iTLV2 = a[1];

        // 3. getting value
        let hR = getHexOfV(input, iTLV1);
        let hS = getHexOfV(input, iTLV2);

        let r = new BigInteger(hR, 16);
        let s = new BigInteger(hS, 16);
        
        return { r, s };
    }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587473244018, function(require, module, exports) {
const { BigInteger } = require('jsbn');
const _ = require('./utils');

let copyArray = function (sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
    for (let i = 0; i < length; i++) destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
};

const Int32 = {
    minValue: -parseInt('10000000000000000000000000000000', 2),
    maxValue: parseInt('1111111111111111111111111111111', 2),
    parse: function (n) {
        if (n < this.minValue) {
            let bigInteger = new Number(-n);
            let bigIntegerRadix = bigInteger.toString(2);
            let subBigIntegerRadix = bigIntegerRadix.substr(bigIntegerRadix.length - 31, 31);
            let reBigIntegerRadix = '';
            for (let i = 0; i < subBigIntegerRadix.length; i++) {
                let subBigIntegerRadixItem = subBigIntegerRadix.substr(i, 1);
                reBigIntegerRadix += subBigIntegerRadixItem == '0' ? '1' : '0'
            }
            let result = parseInt(reBigIntegerRadix, 2);
            return (result + 1)
        } else if (n > this.maxValue) {
            let bigInteger = Number(n);
            let bigIntegerRadix = bigInteger.toString(2);
            let subBigIntegerRadix = bigIntegerRadix.substr(bigIntegerRadix.length - 31, 31);
            let reBigIntegerRadix = '';
            for (let i = 0; i < subBigIntegerRadix.length; i++) {
                let subBigIntegerRadixItem = subBigIntegerRadix.substr(i, 1);
                reBigIntegerRadix += subBigIntegerRadixItem == '0' ? '1' : '0'
            }
            let result = parseInt(reBigIntegerRadix, 2);
            return -(result + 1)
        } else {
            return n
        }
    },
    parseByte: function (n) {
        if (n < 0) {
            let bigInteger = new Number(-n);
            let bigIntegerRadix = bigInteger.toString(2);
            let subBigIntegerRadix = bigIntegerRadix.substr(bigIntegerRadix.length - 8, 8);
            let reBigIntegerRadix = '';
            for (let i = 0; i < subBigIntegerRadix.length; i++) {
                let subBigIntegerRadixItem = subBigIntegerRadix.substr(i, 1);
                reBigIntegerRadix += subBigIntegerRadixItem == '0' ? '1' : '0'
            }
            let result = parseInt(reBigIntegerRadix, 2);
            return (result + 1)
        } else if (n > 255) {
            let bigInteger = Number(n);
            let bigIntegerRadix = bigInteger.toString(2);
            return parseInt(bigIntegerRadix.substr(bigIntegerRadix.length - 8, 8), 2)
        } else {
            return n
        }
    }
};

class SM3Digest {
    constructor() {
        this.xBuf = new Array();
        this.xBufOff = 0;
        this.byteCount = 0;
        this.DIGEST_LENGTH = 32;
        this.v0 = [0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e];
        this.v0 = [0x7380166f, 0x4914b2b9, 0x172442d7, -628488704, -1452330820, 0x163138aa, -477237683, -1325724082];
        this.v = new Array(8);
        this.v_ = new Array(8);
        this.X0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.X = new Array(68);
        this.xOff = 0;
        this.T_00_15 = 0x79cc4519;
        this.T_16_63 = 0x7a879d8a;
        if (arguments.length > 0) {
            this.initDigest(arguments[0])
        } else {
            this.init()
        }
    }

    init() {
        this.xBuf = new Array(4);
        this.reset()
    }

    initDigest(t) {
        this.xBuf = [].concat(t.xBuf);
        this.xBufOff = t.xBufOff;
        this.byteCount = t.byteCount;
        copyArray(t.X, 0, this.X, 0, t.X.length);
        this.xOff = t.xOff;
        copyArray(t.v, 0, this.v, 0, t.v.length);
    }

    getDigestSize() {
        return this.DIGEST_LENGTH
    }

    reset() {
        this.byteCount = 0;
        this.xBufOff = 0;
        for (let elem in this.xBuf) this.xBuf[elem] = null;
        copyArray(this.v0, 0, this.v, 0, this.v0.length);
        this.xOff = 0;
        copyArray(this.X0, 0, this.X, 0, this.X0.length);
    }

    processBlock() {
        let i;
        let ww = this.X;
        let ww_ = new Array(64);
        for (i = 16; i < 68; i++) {
            ww[i] = this.p1(ww[i - 16] ^ ww[i - 9] ^ (this.rotate(ww[i - 3], 15))) ^ (this.rotate(ww[i - 13], 7)) ^ ww[
                i - 6];
        }
        for (i = 0; i < 64; i++) {
            ww_[i] = ww[i] ^ ww[i + 4];
        }
        let vv = this.v;
        let vv_ = this.v_;
        copyArray(vv, 0, vv_, 0, this.v0.length);
        let SS1, SS2, TT1, TT2, aaa;
        for (i = 0; i < 16; i++) {
            aaa = this.rotate(vv_[0], 12);
            SS1 = Int32.parse(Int32.parse(aaa + vv_[4]) + this.rotate(this.T_00_15, i));
            SS1 = this.rotate(SS1, 7);
            SS2 = SS1 ^ aaa;
            TT1 = Int32.parse(Int32.parse(this.ff_00_15(vv_[0], vv_[1], vv_[2]) + vv_[3]) + SS2) + ww_[i];
            TT2 = Int32.parse(Int32.parse(this.gg_00_15(vv_[4], vv_[5], vv_[6]) + vv_[7]) + SS1) + ww[i];
            vv_[3] = vv_[2];
            vv_[2] = this.rotate(vv_[1], 9);
            vv_[1] = vv_[0];
            vv_[0] = TT1;
            vv_[7] = vv_[6];
            vv_[6] = this.rotate(vv_[5], 19);
            vv_[5] = vv_[4];
            vv_[4] = this.p0(TT2);
        }
        for (i = 16; i < 64; i++) {
            aaa = this.rotate(vv_[0], 12);
            SS1 = Int32.parse(Int32.parse(aaa + vv_[4]) + this.rotate(this.T_16_63, i));
            SS1 = this.rotate(SS1, 7);
            SS2 = SS1 ^ aaa;
            TT1 = Int32.parse(Int32.parse(this.ff_16_63(vv_[0], vv_[1], vv_[2]) + vv_[3]) + SS2) + ww_[i];
            TT2 = Int32.parse(Int32.parse(this.gg_16_63(vv_[4], vv_[5], vv_[6]) + vv_[7]) + SS1) + ww[i];
            vv_[3] = vv_[2];
            vv_[2] = this.rotate(vv_[1], 9);
            vv_[1] = vv_[0];
            vv_[0] = TT1;
            vv_[7] = vv_[6];
            vv_[6] = this.rotate(vv_[5], 19);
            vv_[5] = vv_[4];
            vv_[4] = this.p0(TT2);
        }
        for (i = 0; i < 8; i++) {
            vv[i] ^= Int32.parse(vv_[i]);
        }
        this.xOff = 0;
        copyArray(this.X0, 0, this.X, 0, this.X0.length);
    }

    processWord(in_Renamed, inOff) {
        let n = in_Renamed[inOff] << 24;
        n |= (in_Renamed[++inOff] & 0xff) << 16;
        n |= (in_Renamed[++inOff] & 0xff) << 8;
        n |= (in_Renamed[++inOff] & 0xff);
        this.X[this.xOff] = n;
        if (++this.xOff == 16) {
            this.processBlock();
        }
    }

    processLength(bitLength) {
        if (this.xOff > 14) {
            this.processBlock();
        }
        this.X[14] = (this.urShiftLong(bitLength, 32));
        this.X[15] = (bitLength & (0xffffffff))
    }

    intToBigEndian(n, bs, off) {
        bs[off] = Int32.parseByte(this.urShift(n, 24)) & 0xff;
        bs[++off] = Int32.parseByte(this.urShift(n, 16)) & 0xff;
        bs[++off] = Int32.parseByte(this.urShift(n, 8)) & 0xff;
        bs[++off] = Int32.parseByte(n) & 0xff;
    }

    doFinal(out_Renamed, outOff) {
        this.finish();
        for (let i = 0; i < 8; i++) {
            this.intToBigEndian(this.v[i], out_Renamed, outOff + i * 4);
        }
        this.reset();
        return this.DIGEST_LENGTH;
    }

    update(input) {
        this.xBuf[this.xBufOff++] = input;
        if (this.xBufOff == this.xBuf.length) {
            this.processWord(this.xBuf, 0);
            this.xBufOff = 0;
        }
        this.byteCount++;
    }

    blockUpdate(input, inOff, length) {
        while ((this.xBufOff != 0) && (length > 0)) {
            this.update(input[inOff]);
            inOff++;
            length--;
        }
        while (length > this.xBuf.length) {
            this.processWord(input, inOff);
            inOff += this.xBuf.length;
            length -= this.xBuf.length;
            this.byteCount += this.xBuf.length;
        }
        while (length > 0) {
            this.update(input[inOff]);
            inOff++;
            length--;
        }
    }

    finish() {
        let bitLength = (this.byteCount << 3);
        this.update((128));
        while (this.xBufOff != 0) this.update((0));
        this.processLength(bitLength);
        this.processBlock();
    }

    rotate(x, n) {
        return (x << n) | (this.urShift(x, (32 - n)));
    }

    p0(X) {
        return ((X) ^ this.rotate((X), 9) ^ this.rotate((X), 17));
    }

    p1(X) {
        return ((X) ^ this.rotate((X), 15) ^ this.rotate((X), 23));
    }

    ff_00_15(X, Y, Z) {
        return (X ^ Y ^ Z);
    }

    ff_16_63(X, Y, Z) {
        return ((X & Y) | (X & Z) | (Y & Z));
    }

    gg_00_15(X, Y, Z) {
        return (X ^ Y ^ Z);
    }

    gg_16_63(X, Y, Z) {
        return ((X & Y) | (~X & Z));
    }

    urShift(number, bits) {
        if (number > Int32.maxValue || number < Int32.minValue) {
            number = Int32.parse(number);
        }
        if (number >= 0) {
            return number >> bits;
        } else {
            return (number >> bits) + (2 << ~bits);
        }
    }

    urShiftLong(number, bits) {
        let returnV;
        let big = new BigInteger();
        big.fromInt(number);
        if (big.signum() >= 0) {
            returnV = big.shiftRight(bits).intValue();
        } else {
            let bigAdd = new BigInteger();
            bigAdd.fromInt(2);
            let shiftLeftBits = ~bits;
            let shiftLeftNumber = '';
            if (shiftLeftBits < 0) {
                let shiftRightBits = 64 + shiftLeftBits;
                for (let i = 0; i < shiftRightBits; i++) {
                    shiftLeftNumber += '0';
                }
                let shiftLeftNumberBigAdd = new BigInteger();
                shiftLeftNumberBigAdd.fromInt(number >> bits);
                let shiftLeftNumberBig = new BigInteger("10" + shiftLeftNumber, 2);
                shiftLeftNumber = shiftLeftNumberBig.toRadix(10);
                let r = shiftLeftNumberBig.add(shiftLeftNumberBigAdd);
                returnV = r.toRadix(10);
            } else {
                shiftLeftNumber = bigAdd.shiftLeft((~bits)).intValue();
                returnV = (number >> bits) + shiftLeftNumber;
            }
        }
        return returnV;
    }

    getZ(g, publicKey) {
        let userId = _.parseUtf8StringToHex('1234567812345678');
        let len = userId.length * 4;
        this.update((len >> 8 & 0x00ff));
        this.update((len & 0x00ff));
        let userIdWords = _.hexToArray(userId);
        this.blockUpdate(userIdWords, 0, userIdWords.length);
        let aWords = _.hexToArray(g.curve.a.toBigInteger().toRadix(16));
        let bWords = _.hexToArray(g.curve.b.toBigInteger().toRadix(16));
        let gxWords = _.hexToArray(g.getX().toBigInteger().toRadix(16));
        let gyWords = _.hexToArray(g.getY().toBigInteger().toRadix(16));
        let pxWords = _.hexToArray(publicKey.substr(0, 64));
        let pyWords = _.hexToArray(publicKey.substr(64, 64));
        this.blockUpdate(aWords, 0, aWords.length);
        this.blockUpdate(bWords, 0, bWords.length);
        this.blockUpdate(gxWords, 0, gxWords.length);
        this.blockUpdate(gyWords, 0, gyWords.length);
        this.blockUpdate(pxWords, 0, pxWords.length);
        this.blockUpdate(pyWords, 0, pyWords.length);
        let md = new Array(this.getDigestSize());
        this.doFinal(md, 0);
        return md;
    }
}

module.exports = SM3Digest;

}, function(modId) { var map = {"./utils":1587473244019}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587473244019, function(require, module, exports) {
const { BigInteger, SecureRandom } = require('jsbn');
const { ECCurveFp } = require ('./ec');

let rng = new SecureRandom();
let { curve, G, n } = generateEcparam();

/**
 * 获取公共椭圆曲线
 */
function getGlobalCurve() {
    return curve;
}

/**
 * 生成ecparam
 */
function generateEcparam() {
    // 椭圆曲线
    let p = new BigInteger('FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF', 16);
    let a = new BigInteger('FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC', 16);
    let b = new BigInteger('28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93', 16);
    let curve = new ECCurveFp(p, a, b);

    // 基点
    let gxHex = '32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7';
    let gyHex = 'BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0';
    let G = curve.decodePointHex('04' + gxHex + gyHex);

    let n = new BigInteger('FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123', 16);

    return { curve, G, n };
}

/**
 * 生成密钥对
 */
function generateKeyPairHex() {
    let d = new BigInteger(n.bitLength(), rng).mod(n.subtract(BigInteger.ONE)).add(BigInteger.ONE); // 随机数
    let privateKey = leftPad(d.toString(16), 64);

    let P = G.multiply(d); // P = dG，p 为公钥，d 为私钥
    let Px = leftPad(P.getX().toBigInteger().toString(16), 64);
    let Py = leftPad(P.getY().toBigInteger().toString(16), 64);
    let publicKey = '04' + Px + Py;

    return { privateKey, publicKey };
}

/**
 * 解析utf8字符串到16进制
 */
function parseUtf8StringToHex(input) {
    input = unescape(encodeURIComponent(input));

    let length = input.length;

    // 转换到字数组
    let words = [];
    for (let i = 0; i < length; i++) {
        words[i >>> 2] |= (input.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    }

    // 转换到16进制
    let hexChars = [];
    for (let i = 0; i < length; i++) {
        let bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        hexChars.push((bite >>> 4).toString(16));
        hexChars.push((bite & 0x0f).toString(16));
    }

    return hexChars.join('');
}

/**
 * 解析arrayBuffer到16进制字符串
 */
function parseArrayBufferToHex(input) {
    return Array.prototype.map.call(new Uint8Array(input), x => ('00' + x.toString(16)).slice(-2)).join('');
}

/**
 * 补全16进制字符串
 */
function leftPad(input, num) {
    if (input.length >= num) return input;

    return (new Array(num - input.length + 1)).join('0') + input
}

/**
 * 转成16进制串
 */
function arrayToHex(arr) {
    let words = [];
    let j = 0;
    for (let i = 0; i < arr.length * 2; i += 2) {
        words[i >>> 3] |= parseInt(arr[j], 10) << (24 - (i % 8) * 4);
        j++;
    }
    
    // 转换到16进制
    let hexChars = [];
    for (let i = 0; i < arr.length; i++) {
        let bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        hexChars.push((bite >>> 4).toString(16));
        hexChars.push((bite & 0x0f).toString(16));
    }

    return hexChars.join('');
}

/**
 * 转成utf8串
 */
function arrayToUtf8(arr) {
    let words = [];
    let j = 0;
    for (let i = 0; i < arr.length * 2; i += 2) {
        words[i >>> 3] |= parseInt(arr[j], 10) << (24 - (i % 8) * 4);
        j++
    }

    try {
        let latin1Chars = [];

        for (let i = 0; i < arr.length; i++) {
            let bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            latin1Chars.push(String.fromCharCode(bite));
        }

        return decodeURIComponent(escape(latin1Chars.join('')));
    } catch (e) {
        throw new Error('Malformed UTF-8 data');
    }
}

/**
 * 转成ascii码数组
 */
function hexToArray(hexStr) {
    let words = [];
    let hexStrLength = hexStr.length;

    if (hexStrLength % 2 !== 0) {
        hexStr = leftPad(hexStr, hexStrLength + 1);
    }

    hexStrLength = hexStr.length;

    for (let i = 0; i < hexStrLength; i += 2) {
        words.push(parseInt(hexStr.substr(i, 2), 16));
    }
    return words
}

module.exports = {
    getGlobalCurve,
    generateEcparam,
    generateKeyPairHex,
    parseUtf8StringToHex,
    parseArrayBufferToHex,
    leftPad,
    arrayToHex,
    arrayToUtf8,
    hexToArray,
};

}, function(modId) { var map = {"./ec":1587473244020}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587473244020, function(require, module, exports) {
const { BigInteger } = require('jsbn');

/**
 * thanks for Tom Wu : http://www-cs-students.stanford.edu/~tjw/jsbn/
 *
 * Basic Javascript Elliptic Curve implementation
 * Ported loosely from BouncyCastle's Java EC code
 * Only Fp curves implemented for now
 */

const THREE = new BigInteger('3');

/**
 * 椭圆曲线域元素
 */
class ECFieldElementFp {
    constructor(q, x) {
        this.x = x;
        this.q = q;
        // TODO if (x.compareTo(q) >= 0) error
    }

    /**
     * 判断相等
     */
    equals(other) {
        if (other === this) return true;
        return (this.q.equals(other.q) && this.x.equals(other.x));
    }

    /**
     * 返回具体数值
     */
    toBigInteger() {
        return this.x;
    }

    /**
     * 取反
     */
    negate() {
        return new ECFieldElementFp(this.q, this.x.negate().mod(this.q));
    }

    /**
     * 相加
     */
    add(b) {
        return new ECFieldElementFp(this.q, this.x.add(b.toBigInteger()).mod(this.q));
    }

    /**
     * 相减
     */
    subtract(b) {
        return new ECFieldElementFp(this.q, this.x.subtract(b.toBigInteger()).mod(this.q));
    }

    /**
     * 相乘
     */
    multiply(b) {
        return new ECFieldElementFp(this.q, this.x.multiply(b.toBigInteger()).mod(this.q));
    }

    /**
     * 相除
     */
    divide(b) {
        return new ECFieldElementFp(this.q, this.x.multiply(b.toBigInteger().modInverse(this.q)).mod(this.q));
    }

    /**
     * 平方
     */
    square() {
        return new ECFieldElementFp(this.q, this.x.square().mod(this.q));
    }
}

class ECPointFp {
    constructor(curve, x, y, z) {
        this.curve = curve;
        this.x = x;
        this.y = y;
        // 标准射影坐标系：zinv == null 或 z * zinv == 1
        this.z = z === undefined ? BigInteger.ONE : z;
        this.zinv = null;
        //TODO: compression flag
    }

    getX() {
        if (this.zinv === null) this.zinv = this.z.modInverse(this.curve.q);

        return this.curve.fromBigInteger(this.x.toBigInteger().multiply(this.zinv).mod(this.curve.q));
    }

    getY() {
        if (this.zinv === null) this.zinv = this.z.modInverse(this.curve.q);

        return this.curve.fromBigInteger(this.y.toBigInteger().multiply(this.zinv).mod(this.curve.q));
    }

    /**
     * 判断相等
     */
    equals(other) {
        if (other === this) return true;
        if (this.isInfinity()) return other.isInfinity();
        if (other.isInfinity()) return this.isInfinity();

        // u = y2 * z1 - y1 * z2
        let u = other.y.toBigInteger().multiply(this.z).subtract(this.y.toBigInteger().multiply(other.z)).mod(this.curve.q);
        if (!u.equals(BigInteger.ZERO)) return false;

        // v = x2 * z1 - x1 * z2
        let v = other.x.toBigInteger().multiply(this.z).subtract(this.x.toBigInteger().multiply(other.z)).mod(this.curve.q);
        return v.equals(BigInteger.ZERO);
    }

    /**
     * 是否是无穷远点
     */
    isInfinity() {
        if ((this.x === null) && (this.y === null)) return true;
        return this.z.equals(BigInteger.ZERO) && !this.y.toBigInteger().equals(BigInteger.ZERO);
    }

    /**
     * 取反，x 轴对称点
     */
    negate() {
        return new ECPointFp(this.curve, this.x, this.y.negate(), this.z);
    }

    /**
     * 相加
     *
     * 标准射影坐标系：
     * 
     * λ1 = x1 * z2
     * λ2 = x2 * z1
     * λ3 = λ1 − λ2
     * λ4 = y1 * z2
     * λ5 = y2 * z1
     * λ6 = λ4 − λ5
     * λ7 = λ1 + λ2
     * λ8 = z1 * z2
     * λ9 = λ3^2
     * λ10 = λ3 * λ9
     * λ11 = λ8 * λ6^2 − λ7 * λ9
     * x3 = λ3 * λ11
     * y3 = λ6 * (λ9 * λ1 − λ11) − λ4 * λ10
     * z3 = λ10 * λ8
     */
    add(b) {
        if (this.isInfinity()) return b;
        if (b.isInfinity()) return this;

        let x1 = this.x.toBigInteger();
        let y1 = this.y.toBigInteger();
        let z1 = this.z;
        let x2 = b.x.toBigInteger();
        let y2 = b.y.toBigInteger();
        let z2 = b.z;
        let q = this.curve.q;
        
        let w1 = x1.multiply(z2).mod(q);
        let w2 = x2.multiply(z1).mod(q);
        let w3 = w1.subtract(w2);
        let w4 = y1.multiply(z2).mod(q);
        let w5 = y2.multiply(z1).mod(q);
        let w6 = w4.subtract(w5);

        if (BigInteger.ZERO.equals(w3)) {
            if (BigInteger.ZERO.equals(w6)) {
                return this.twice(); // this == b，计算自加
            }
            return this.curve.infinity; // this == -b，则返回无穷远点
        }

        let w7 = w1.add(w2);
        let w8 = z1.multiply(z2).mod(q);
        let w9 = w3.square().mod(q);
        let w10 = w3.multiply(w9).mod(q);
        let w11 = w8.multiply(w6.square()).subtract(w7.multiply(w9)).mod(q);

        let x3 = w3.multiply(w11).mod(q);
        let y3 = w6.multiply(w9.multiply(w1).subtract(w11)).subtract(w4.multiply(w10)).mod(q);
        let z3 = w10.multiply(w8).mod(q);

        return new ECPointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3), z3);
    }

    /**
     * 自加
     *
     * 标准射影坐标系：
     * 
     * λ1 = 3 * x1^2 + a * z1^2
     * λ2 = 2 * y1 * z1
     * λ3 = y1^2
     * λ4 = λ3 * x1 * z1
     * λ5 = λ2^2
     * λ6 = λ1^2 − 8 * λ4
     * x3 = λ2 * λ6
     * y3 = λ1 * (4 * λ4 − λ6) − 2 * λ5 * λ3
     * z3 = λ2 * λ5
     */
    twice() {
        if (this.isInfinity()) return this;
        if (!this.y.toBigInteger().signum()) return this.curve.infinity;

        let x1 = this.x.toBigInteger();
        let y1 = this.y.toBigInteger();
        let z1 = this.z;
        let q = this.curve.q;
        let a = this.curve.a.toBigInteger();

        let w1 = x1.square().multiply(THREE).add(a.multiply(z1.square())).mod(q);
        let w2 = y1.shiftLeft(1).multiply(z1).mod(q);
        let w3 = y1.square().mod(q);
        let w4 = w3.multiply(x1).multiply(z1).mod(q);
        let w5 = w2.square().mod(q);
        let w6 = w1.square().subtract(w4.shiftLeft(3)).mod(q);

        let x3 = w2.multiply(w6).mod(q);
        let y3 = w1.multiply(w4.shiftLeft(2).subtract(w6)).subtract(w5.shiftLeft(1).multiply(w3)).mod(q);
        let z3 = w2.multiply(w5).mod(q);

        return new ECPointFp(this.curve, this.curve.fromBigInteger(x3), this.curve.fromBigInteger(y3), z3);
    }

    /**
     * 倍点计算
     */
    multiply(k) {
        if (this.isInfinity()) return this;
        if (!k.signum()) return this.curve.infinity;

        // 使用加减法
        let k3 = k.multiply(THREE);
        let neg = this.negate();
        let Q = this;

        for (let i = k3.bitLength() - 2; i > 0; i--) {
            Q = Q.twice();

            let k3Bit = k3.testBit(i);
            let kBit = k.testBit(i);

            if (k3Bit !== kBit) {
                Q = Q.add(k3Bit ? this : neg);
            }
        }

        return Q;
    }
}

/**
 * 椭圆曲线 y^2 = x^3 + ax + b
 */
class ECCurveFp {
    constructor(q, a, b) {
        this.q = q;
        this.a = this.fromBigInteger(a);
        this.b = this.fromBigInteger(b);
        this.infinity = new ECPointFp(this, null, null); // 无穷远点
    }

    /**
     * 判断两个椭圆曲线是否相等
     */
    equals(other) {
        if (other === this) return true;
        return(this.q.equals(other.q) && this.a.equals(other.a) && this.b.equals(other.b));
    }

    /**
     * 生成椭圆曲线域元素
     */
    fromBigInteger(x) {
        return new ECFieldElementFp(this.q, x);
    }

    /**
     * 解析 16 进制串为椭圆曲线点
     */
    decodePointHex(s) {
        switch (parseInt(s.substr(0, 2), 16)) {
            // 第一个字节
            case 0:
                return this.infinity;
            case 2:
            case 3:
                // 不支持的压缩方式
                return null;
            case 4:
            case 6:
            case 7:
                let len = (s.length - 2) / 2;
                let xHex = s.substr(2, len);
                let yHex = s.substr(len + 2, len);

                return new ECPointFp(this, this.fromBigInteger(new BigInteger(xHex, 16)), this.fromBigInteger(new BigInteger(yHex, 16)));
            default:
                // 不支持
                return null;
        }
    }
}

module.exports = {
    ECPointFp,
    ECCurveFp,
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587473244021, function(require, module, exports) {
const { BigInteger } = require('jsbn');
const SM3Digest = require('./sm3');
const _ = require('./utils');

class SM2Cipher {
    constructor() {
        this.ct = 1;
        this.p2 = null;
        this.sm3keybase = null;
        this.sm3c3 = null;
        this.key = new Array(32);
        this.keyOff = 0;
    }

    reset() {
        this.sm3keybase = new SM3Digest();
        this.sm3c3 = new SM3Digest();
        let xWords = _.hexToArray(this.p2.getX().toBigInteger().toRadix(16));
        let yWords = _.hexToArray(this.p2.getY().toBigInteger().toRadix(16));
        this.sm3keybase.blockUpdate(xWords, 0, xWords.length);
        this.sm3c3.blockUpdate(xWords, 0, xWords.length);
        this.sm3keybase.blockUpdate(yWords, 0, yWords.length);
        this.ct = 1;
        this.nextKey();
    }

    nextKey() {
        let sm3keycur = new SM3Digest(this.sm3keybase);
        sm3keycur.update((this.ct >> 24 & 0x00ff));
        sm3keycur.update((this.ct >> 16 & 0x00ff));
        sm3keycur.update((this.ct >> 8 & 0x00ff));
        sm3keycur.update((this.ct & 0x00ff));
        sm3keycur.doFinal(this.key, 0);
        this.keyOff = 0;
        this.ct++;
    }

    initEncipher(userKey) {
        let keypair = _.generateKeyPairHex();
        let k = new BigInteger(keypair.privateKey, 16);
        let publicKey = keypair.publicKey;

        this.p2 = userKey.multiply(k); // [k](Pb)
        this.reset();

        if (publicKey.length > 128) {
          publicKey = publicKey.substr(publicKey.length - 128);
        }

        return publicKey;
    }

    encryptBlock(data) {
        this.sm3c3.blockUpdate(data, 0, data.length);
        for (let i = 0; i < data.length; i++) {
            if (this.keyOff === this.key.length) {
                this.nextKey();
            }
            data[i] ^= this.key[this.keyOff++] & 0xff;
        }
    }

    initDecipher(userD, c1) {
        this.p2 = c1.multiply(userD);
        this.reset();
    }

    decryptBlock(data) {
        for (let i = 0; i < data.length; i++) {
            if (this.keyOff === this.key.length) {
                this.nextKey();
            }
            data[i] ^= this.key[this.keyOff++] & 0xff;
        }
        this.sm3c3.blockUpdate(data, 0, data.length);
    }

    doFinal(c3) {
        let yWords = _.hexToArray(this.p2.getY().toBigInteger().toRadix(16));
        this.sm3c3.blockUpdate(yWords, 0, yWords.length);
        this.sm3c3.doFinal(c3, 0);
        this.reset();
    }
    
    createPoint(x, y) {
        let publicKey = '04' + x + y;
        let point = _.getGlobalCurve().decodePointHex(publicKey);
        return point;
    }
}

module.exports = SM2Cipher;

}, function(modId) { var map = {"./sm3":1587473244018,"./utils":1587473244019}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587473244022, function(require, module, exports) {
/**
 * 左补0到指定长度
 */
function leftPad(input, num) {
    if (input.length >= num) return input;

    return (new Array(num - input.length + 1)).join('0') + input
}

/**
 * 二进制转化为十六进制
 */
function binary2hex(binary) {
    const binaryLength = 8;
    let hex = '';
    for (let i = 0; i < binary.length / binaryLength; i++) {
        hex += leftPad(parseInt(binary.substr(i * binaryLength, binaryLength), 2).toString(16), 2);
    }
    return hex;
}

/**
 * 十六进制转化为二进制
 */
function hex2binary(hex) {
    const hexLength = 2;
    let binary = '';
    for (let i = 0; i < hex.length / hexLength; i++) {
        binary += leftPad(parseInt(hex.substr(i * hexLength, hexLength), 16).toString(2), 8);
    }
    return binary;
}

/**
 * 普通字符串转化为二进制
 */
function str2binary(str) {
    let binary = '';
    for (const ch of str) {
        binary += leftPad(ch.codePointAt(0).toString(2), 8);
    }
    return binary;
}

/**
 * 循环左移
 */
function rol(str, n) {
    return str.substring(n % str.length) + str.substr(0, n % str.length);
}

/**
 * 二进制运算
 */
function binaryCal(x, y, method) {
    const a = x || '';
    const b = y || '';
    const result = [];
    let prevResult;

    for (let i = a.length - 1; i >= 0; i--) { // 大端
        prevResult = method(a[i], b[i], prevResult);
        result[i] = prevResult[0];
    }
    return result.join('');
}

/**
 * 二进制异或运算
 */
function xor(x, y) {
    return binaryCal(x, y, (a, b) => [(a === b ? '0' : '1')]);
}

/**
 * 二进制与运算
 */
function and(x, y) {
    return binaryCal(x, y, (a, b) => [(a === '1' && b === '1' ? '1' : '0')]);
}

/**
 * 二进制或运算
 */
function or(x, y) {
    return binaryCal(x, y, (a, b) => [(a === '1' || b === '1' ? '1' : '0')]); // a === '0' && b === '0' ? '0' : '1'
}

/**
 * 二进制与运算
 */
function add(x, y) {
    const result = binaryCal(x, y, (a, b, prevResult) => {
        const carry = prevResult ? prevResult[1] : '0' || '0';

        // a,b不等时,carry不变，结果与carry相反
        // a,b相等时，结果等于原carry，新carry等于a
        if (a !== b) return [carry === '0' ? '1' : '0', carry];

        return [carry, a];
    });
    
    return result;
}

/**
 * 二进制非运算
 */
function not(x) {
    return binaryCal(x, undefined, a => [a === '1' ? '0' : '1']);
}

function calMulti(method) {
    return (...arr) => arr.reduce((prev, curr) => method(prev, curr));
}

/**
 * 压缩函数中的置换函数 P1(X) = X xor (X <<< 9) xor (X <<< 17)
 */
function P0(X) {
    return calMulti(xor)(X, rol(X, 9), rol(X, 17));
}

/**
 * 消息扩展中的置换函数 P1(X) = X xor (X <<< 15) xor (X <<< 23)
 */
function P1(X) {
    return calMulti(xor)(X, rol(X, 15), rol(X, 23));
}

function FF(X, Y, Z, j) {
    return j >= 0 && j <= 15 ? calMulti(xor)(X, Y, Z) : calMulti(or)(and(X, Y), and(X, Z), and(Y, Z));
}

function GG(X, Y, Z, j) {
    return j >= 0 && j <= 15 ? calMulti(xor)(X, Y, Z) : or(and(X, Y), and(not(X), Z));
}

function T(j) {
    return j >= 0 && j <= 15 ? hex2binary('79cc4519') : hex2binary('7a879d8a');
}

/**
 * 压缩函数
 */
function CF(V, Bi) {
    // 消息扩展
    const wordLength = 32;
    const W = [];
    const M = []; // W'

    // 将消息分组B划分为16个字W0， W1，…… ，W15 （字为长度为32的比特串）
    for (let i = 0; i < 16; i++) {
        W.push(Bi.substr(i * wordLength, wordLength));
    }

    // W[j] <- P1(W[j−16] xor W[j−9] xor (W[j−3] <<< 15)) xor (W[j−13] <<< 7) xor W[j−6]
    for (let j = 16; j < 68; j++) {
        W.push(calMulti(xor)(
            P1(calMulti(xor)(W[j - 16], W[j - 9], rol(W[j - 3], 15))),
            rol(W[j - 13], 7),
            W[j - 6]
        ));
    }

    // W′[j] = W[j] xor W[j+4]
    for (let j = 0; j < 64; j++) {
        M.push(xor(W[j], W[j + 4]));
    }

    // 压缩
    const wordRegister = []; // 字寄存器
    for (let j = 0; j < 8; j++) {
        wordRegister.push(V.substr(j * wordLength, wordLength));
    }

    let A = wordRegister[0];
    let B = wordRegister[1];
    let C = wordRegister[2];
    let D = wordRegister[3];
    let E = wordRegister[4];
    let F = wordRegister[5];
    let G = wordRegister[6];
    let H = wordRegister[7];

    // 中间变量
    let SS1;
    let SS2;
    let TT1;
    let TT2;
    for (let j = 0; j < 64; j++) {
        SS1 = rol(calMulti(add)(rol(A, 12), E, rol(T(j), j)), 7);
        SS2 = xor(SS1, rol(A, 12));

        TT1 = calMulti(add)(FF(A, B, C, j), D, SS2, M[j]);
        TT2 = calMulti(add)(GG(E, F, G, j), H, SS1, W[j]);

        D = C;
        C = rol(B, 9);
        B = A;
        A = TT1;
        H = G;
        G = rol(F, 19);
        F = E;
        E = P0(TT2);
    }

    return xor([A, B, C, D, E, F, G, H].join(''), V);
}

module.exports = function(str) {
    const binary = str2binary(str);

    // 填充
    const len = binary.length;

    // k是满足len + 1 + k = 448mod512的最小的非负整数
    let k = len % 512;

    // 如果 448 <= (512 % len) < 512，需要多补充 (len % 448) 比特'0'以满足总比特长度为512的倍数
    k = k >= 448 ? 512 - (k % 448) - 1 : 448 - k - 1;

    const m = `${binary}1${leftPad('', k)}${leftPad(len.toString(2), 64)}`.toString(); // k个0

    // 迭代压缩
    const n = (len + k + 65) / 512;

    let V = hex2binary('7380166f4914b2b9172442d7da8a0600a96f30bc163138aae38dee4db0fb0e4e');
    for (let i = 0; i <= n - 1; i++) {
        const B = m.substr(512 * i, 512);
        V = CF(V, B);
    }
    return binary2hex(V);
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1587473244023, function(require, module, exports) {
const DECRYPT = 0;
const ROUND = 32;
const BLOCK = 16;

const Sbox = [
    0xd6, 0x90, 0xe9, 0xfe, 0xcc, 0xe1, 0x3d, 0xb7, 0x16, 0xb6, 0x14, 0xc2, 0x28, 0xfb, 0x2c, 0x05,
    0x2b, 0x67, 0x9a, 0x76, 0x2a, 0xbe, 0x04, 0xc3, 0xaa, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99,
    0x9c, 0x42, 0x50, 0xf4, 0x91, 0xef, 0x98, 0x7a, 0x33, 0x54, 0x0b, 0x43, 0xed, 0xcf, 0xac, 0x62,
    0xe4, 0xb3, 0x1c, 0xa9, 0xc9, 0x08, 0xe8, 0x95, 0x80, 0xdf, 0x94, 0xfa, 0x75, 0x8f, 0x3f, 0xa6,
    0x47, 0x07, 0xa7, 0xfc, 0xf3, 0x73, 0x17, 0xba, 0x83, 0x59, 0x3c, 0x19, 0xe6, 0x85, 0x4f, 0xa8,
    0x68, 0x6b, 0x81, 0xb2, 0x71, 0x64, 0xda, 0x8b, 0xf8, 0xeb, 0x0f, 0x4b, 0x70, 0x56, 0x9d, 0x35,
    0x1e, 0x24, 0x0e, 0x5e, 0x63, 0x58, 0xd1, 0xa2, 0x25, 0x22, 0x7c, 0x3b, 0x01, 0x21, 0x78, 0x87,
    0xd4, 0x00, 0x46, 0x57, 0x9f, 0xd3, 0x27, 0x52, 0x4c, 0x36, 0x02, 0xe7, 0xa0, 0xc4, 0xc8, 0x9e,
    0xea, 0xbf, 0x8a, 0xd2, 0x40, 0xc7, 0x38, 0xb5, 0xa3, 0xf7, 0xf2, 0xce, 0xf9, 0x61, 0x15, 0xa1,
    0xe0, 0xae, 0x5d, 0xa4, 0x9b, 0x34, 0x1a, 0x55, 0xad, 0x93, 0x32, 0x30, 0xf5, 0x8c, 0xb1, 0xe3,
    0x1d, 0xf6, 0xe2, 0x2e, 0x82, 0x66, 0xca, 0x60, 0xc0, 0x29, 0x23, 0xab, 0x0d, 0x53, 0x4e, 0x6f,
    0xd5, 0xdb, 0x37, 0x45, 0xde, 0xfd, 0x8e, 0x2f, 0x03, 0xff, 0x6a, 0x72, 0x6d, 0x6c, 0x5b, 0x51,
    0x8d, 0x1b, 0xaf, 0x92, 0xbb, 0xdd, 0xbc, 0x7f, 0x11, 0xd9, 0x5c, 0x41, 0x1f, 0x10, 0x5a, 0xd8,
    0x0a, 0xc1, 0x31, 0x88, 0xa5, 0xcd, 0x7b, 0xbd, 0x2d, 0x74, 0xd0, 0x12, 0xb8, 0xe5, 0xb4, 0xb0,
    0x89, 0x69, 0x97, 0x4a, 0x0c, 0x96, 0x77, 0x7e, 0x65, 0xb9, 0xf1, 0x09, 0xc5, 0x6e, 0xc6, 0x84,
    0x18, 0xf0, 0x7d, 0xec, 0x3a, 0xdc, 0x4d, 0x20, 0x79, 0xee, 0x5f, 0x3e, 0xd7, 0xcb, 0x39, 0x48
];

const CK = [
    0x00070e15, 0x1c232a31, 0x383f464d, 0x545b6269,
    0x70777e85, 0x8c939aa1, 0xa8afb6bd, 0xc4cbd2d9,
    0xe0e7eef5, 0xfc030a11, 0x181f262d, 0x343b4249,
    0x50575e65, 0x6c737a81, 0x888f969d, 0xa4abb2b9,
    0xc0c7ced5, 0xdce3eaf1, 0xf8ff060d, 0x141b2229,
    0x30373e45, 0x4c535a61, 0x686f767d, 0x848b9299,
    0xa0a7aeb5, 0xbcc3cad1, 0xd8dfe6ed, 0xf4fb0209,
    0x10171e25, 0x2c333a41, 0x484f565d, 0x646b7279
];

function rotl(x, y) {
    return x << y | x >>> (32 - y);
}

function byteSub(a) {
    return (Sbox[a >>> 24 & 0xFF] & 0xFF) << 24 | (Sbox[a >>> 16 & 0xFF] & 0xFF) << 16 | (Sbox[a >>> 8 & 0xFF] & 0xFF) << 8 | (Sbox[a & 0xFF] & 0xFF);
}

function l1(b) {
    return b ^ rotl(b, 2) ^ rotl(b, 10) ^ rotl(b, 18) ^ rotl(b, 24);
}

function l2(b) {
    return b ^ rotl(b, 13) ^ rotl(b, 23);
}

function sms4Crypt(input, output, roundKey) {
    let r;
    let mid;
    let x = new Array(4);
    let tmp = new Array(4);
    for(let i = 0; i < 4; i++) {
        tmp[0] = input[0 + 4 * i] & 0xff;
        tmp[1] = input[1 + 4 * i] & 0xff;
        tmp[2] = input[2 + 4 * i] & 0xff;
        tmp[3] = input[3 + 4 * i] & 0xff;
        x[i] = tmp[0] << 24 | tmp[1] << 16 | tmp[2] << 8 | tmp[3];
    }

    for(r = 0; r < 32; r += 4) {
        mid = x[1] ^ x[2] ^ x[3] ^ roundKey[r + 0];
        mid = byteSub(mid);
        x[0] = x[0] ^ l1(mid); // x4
        
        mid = x[2] ^ x[3] ^ x[0] ^ roundKey[r + 1];
        mid = byteSub(mid);
        x[1] = x[1] ^ l1(mid); // x5
        
        mid = x[3] ^ x[0] ^ x[1] ^ roundKey[r + 2];
        mid = byteSub(mid);
        x[2] = x[2] ^ l1(mid); // x6
        
        mid = x[0] ^ x[1] ^ x[2] ^ roundKey[r + 3];
        mid = byteSub(mid);
        x[3] = x[3] ^ l1(mid); // x7
    }
    
    //Reverse
    for(let j = 0; j < 16; j += 4) {
        output[j] = x[3 - j / 4] >>> 24 & 0xff;
        output[j+1] = x[3 - j / 4] >>> 16 & 0xff;
        output[j+2] = x[3 - j / 4] >>> 8 & 0xff;
        output[j+3] = x[3 - j / 4] & 0xff;
    }
}

function sms4KeyExt(key, roundKey, cryptFlag) {
    let r;
    let mid;
    let x = new Array(4);
    let tmp = new Array(4);

    for (let i = 0; i < 4; i++) {
        tmp[0] = key[0 + 4 * i] & 0xff;
        tmp[1] = key[1 + 4 * i] & 0xff;
        tmp[2] = key[2 + 4 * i] & 0xff;
        tmp[3] = key[3 + 4 * i] & 0xff;
        x[i] = tmp[0] << 24 | tmp[1] << 16 | tmp[2] << 8 | tmp[3];
    }

    x[0] ^= 0xa3b1bac6;
    x[1] ^= 0x56aa3350;
    x[2] ^= 0x677d9197;
    x[3] ^= 0xb27022dc;

    for(r = 0; r < 32; r += 4) {
        mid = x[1] ^ x[2] ^ x[3] ^ CK[r+0];
        mid = byteSub(mid);
        roundKey[r + 0] = x[0] ^= l2(mid); // roundKey0 = K4
        
        mid = x[2] ^ x[3] ^ x[0] ^ CK[r+1];
        mid = byteSub(mid);
        roundKey[r + 1] = x[1] ^= l2(mid); // roundKey1 = K5
        
        mid = x[3] ^ x[0] ^ x[1] ^ CK[r+2];
        mid = byteSub(mid);
        roundKey[r + 2] = x[2] ^= l2(mid); // roundKey2 = K6
        
        mid = x[0] ^ x[1] ^ x[2] ^ CK[r + 3];
        mid = byteSub(mid);
        roundKey[r + 3] = x[3] ^= l2(mid); // roundKey3 = K7
    }
        
    // 解密时轮密钥使用顺序：roundKey31, roundKey30, ..., roundKey0
    if(cryptFlag === DECRYPT) {
        for(r = 0; r < 16; r++) {
            mid = roundKey[r];
            roundKey[r] = roundKey[31 - r];
            roundKey[31 - r] = mid;
        }
    }
}

function sm4(inArray, key, cryptFlag) {
    let outArray = [];
    let point = 0;
    let roundKey = new Array(ROUND); 
    sms4KeyExt(key, roundKey, cryptFlag);

    let input = new Array(16);
    let output = new Array(16);

    let inLen = inArray.length;
    while (inLen >= BLOCK) {
        input = inArray.slice(point, point + 16);
        sms4Crypt(input, output, roundKey);
        
        for (let i = 0; i < BLOCK; i++) {
            outArray[point + i] = output[i];
        }

        inLen -= BLOCK;
        point += BLOCK;
    }

    return outArray;
}

module.exports = {
    encrypt(inArray, key) {
        return sm4(inArray, key, 1);
    },
    decrypt(inArray, key) {
        return sm4(inArray, key, 0);
    }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1587473244015);
})()
//# sourceMappingURL=index.js.map