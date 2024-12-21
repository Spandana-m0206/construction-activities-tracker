const enumToArray = (enumObj) => {
    return Object.keys(enumObj).map((k) => enumObj[k]);
}

export default enumToArray