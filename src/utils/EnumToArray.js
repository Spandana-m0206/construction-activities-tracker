const enumToArray = (enumObj) => {
    return Object.keys(enumObj).map((k) => enumObj[k]);
}

module.exports =  enumToArray