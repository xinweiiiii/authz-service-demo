// helper.ts
export const IsEmpty = (val) => {
  return val == undefined || false || val.toString() == "";
};
export const IsArray = (val) => {
  return val instanceof Array;
};
export const IsEmptyArray = (val) => {
  return val instanceof Array && val.length === 0;
};
export const IsObject = (val) => {
  return typeof val == "object";
};
export const IsEmptyObject = (val) => {
  let keys = Object.keys(val);
  return keys.length == 0;
};

export const UpdateObj = (val, field, obj) => {
  if (val !== undefined) {
    obj[field] = val;
  }
  return obj;
};

export const convertObjectToQueryString = async (object) =>{
  const objString = '?' + Object.keys(object).map(key => {
    return `${key}=${encodeURIComponent(object[key])}`
  }).join('&')
  return objString;
};

export const maskCert = (cert, startIndex = 0, endIndex = cert.length, maskCharacter = "*") => {
  let maskedCert = "";
  for (let i = 0; i < cert.length; i++) {
    if (i >= startIndex && i <= endIndex) {
      maskedCert += maskCharacter;
    } else {
      maskedCert += cert[i];
    }
  }
  return maskedCert;
}
