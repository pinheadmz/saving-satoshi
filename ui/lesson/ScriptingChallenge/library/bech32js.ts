export const bech32js = `var CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
var GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
const encodings = {
  BECH32: "bech32",
  BECH32M: "bech32m",
};
const getEncodingConst = (enc) => {
  if (enc == encodings.BECH32) {
    return 1;
  } else if (enc == encodings.BECH32M) {
    return 0x2bc830a3;
  } else {
    return null;
  }
}
const polymod = (values) => {
  var chk = 1;
  for (var p = 0; p < values.length; ++p) {
    var top = chk >> 25;
    chk = (chk & 0x1ffffff) << 5 ^ values[p];
    for (var i = 0; i < 5; ++i) {
      if ((top >> i) & 1) {
        chk ^= GENERATOR[i];
      }
    }
  }
  return chk;
}
const hrpExpand = (hrp) => {
  var ret = [];
  var p;
  for (p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) >> 5);
  }
  ret.push(0);
  for (p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) & 31);
  }
  return ret;
}
const verifyChecksum = (hrp, data, enc) => {
  return polymod(hrpExpand(hrp).concat(data)) === getEncodingConst(enc);
}
const createChecksum = (hrp, data, enc) => {
  var values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  var mod = polymod(values) ^ getEncodingConst(enc);
  var ret = [];
  for (var p = 0; p < 6; ++p) {
    ret.push((mod >> 5 * (5 - p)) & 31);
  }
  return ret;
}
const bech32_encode = (hrp, data, enc) => {
  var combined = data.concat(createChecksum(hrp, data, enc));
  var ret = hrp + '1';
  for (var p = 0; p < combined.length; ++p) {
    ret += CHARSET.charAt(combined[p]);
  }
  return ret;
}
const bech32_decode = (bechString, enc) => {
  var p;
  var has_lower = false;
  var has_upper = false;
  for (p = 0; p < bechString.length; ++p) {
    if (bechString.charCodeAt(p) < 33 || bechString.charCodeAt(p) > 126) {
      return null;
    }
    if (bechString.charCodeAt(p) >= 97 && bechString.charCodeAt(p) <= 122) {
        has_lower = true;
    }
    if (bechString.charCodeAt(p) >= 65 && bechString.charCodeAt(p) <= 90) {
        has_upper = true;
    }
  }
  if (has_lower && has_upper) {
    return null;
  }
  bechString = bechString.toLowerCase();
  var pos = bechString.lastIndexOf('1');
  if (pos < 1 || pos + 7 > bechString.length || bechString.length > 90) {
    return null;
  }
  var hrp = bechString.substring(0, pos);
  var data = [];
  for (p = pos + 1; p < bechString.length; ++p) {
    var d = CHARSET.indexOf(bechString.charAt(p));
    if (d === -1) {
      return null;
    }
    data.push(d);
  }
  if (!verifyChecksum(hrp, data, enc)) {
    return null;
  }
  return {hrp: hrp, data: data.slice(0, data.length - 6)};
}
const convertbits = (data, frombits, tobits, pad) => {
  var acc = 0;
  var bits = 0;
  var ret = [];
  var maxv = (1 << tobits) - 1;
  for (var p = 0; p < data.length; ++p) {
    var value = data[p];
    if (value < 0 || (value >> frombits) !== 0) {
      return null;
    }
    acc = (acc << frombits) | value;
    bits += frombits;
    while (bits >= tobits) {
      bits -= tobits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) {
      ret.push((acc << (tobits - bits)) & maxv);
    }
  } else if (bits >= frombits || ((acc << (tobits - bits)) & maxv)) {
    return null;
  }
  return ret;
}
const decode = (hrp, addr) => {
  var bech32m = false;
  var dec = bech32_decode(addr, encodings.BECH32);
  if (dec === null) {
    dec = bech32_decode(addr, encodings.BECH32M);
    bech32m = true;
  }
  if (dec === null || dec.hrp !== hrp || dec.data.length < 1 || dec.data[0] > 16) {
    return null;
  }
  var res = convertbits(dec.data.slice(1), 5, 8, false);
  if (res === null || res.length < 2 || res.length > 40) {
    return null;
  }
  if (dec.data[0] === 0 && res.length !== 20 && res.length !== 32) {
    return null;
  }
  if (dec.data[0] === 0 && bech32m) {
    return null;
  }
  if (dec.data[0] !== 0 && !bech32m) {
    return null;
  }
  return {version: dec.data[0], program: res};
}
const encode = (hrp, version, program) => {
  var enc = encodings.BECH32;
  if (version > 0) {
    enc = encodings.BECH32M;
  }
  var ret = bech32_encode(hrp, [version].concat(convertbits(program, 8, 5, true)), enc);
  if (decode(hrp, ret) === null) {
    return null;
  }
  return ret;
}`
