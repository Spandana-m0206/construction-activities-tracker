const csv=require('csv-parser');
const enumToArray = require('./EnumToArray');
const { MaterialCategories, Units } = require('./enums');
const { resolve } = require('path');

exports.parseCSV=(fileStream)=>{
   return new Promise((resolve,reject)=>{

    let validEntries=[]
    let invalidEntries=[]
fileStream.pipe(csv()).on("data",(data)=>{
    const trimmedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value?.trim() ?? ''])
      );
      
     const validatedData= validateData(data)
     if(!validatedData.isValid){
        invalidEntries.push(validatedData)
     }else{
        validEntries.push(validatedData)
     }

}).on("end",()=>resolve([validEntries,invalidEntries])).on("error",(error)=>reject(error))
   })
}
function validateData(data){
    const requiredFields = ['name', 'category', 'units'];
  
    // Check for missing required fields
    const missingFields = requiredFields.filter(
      (field) => !Object.keys(data).includes(field) || !data[field].trim()
    );
    const errors=[]
    // If any required fields are missing, return invalid
    if (missingFields.length > 0) {
      return {
        isValid: false,
        missingFields,
        errors:[],
        validatedData: null
      };
    }
    const validatedData={
        name:data.name.trim(),
        category:data.category.trim(),
        units:data.units.trim()
    }
    if(!validateCategory(validatedData.category)){
        errors.push(`${validatedData.category} is not a valid category`)
        
    }
    if(!validateUnit(validatedData.units)){
        errors.push(`${validatedData.units} is not a valid unit`)
    }
 if(errors.length>0){
    return {
        isValid: false,
        missingFields:[],
        errors,
        validatedData: null
      };
 }

    return {
        isValid: true,
        missingFields,
        validatedData,
        errors
      };

}
function validateCategory(category){
    const categories=enumToArray(MaterialCategories)
    return categories.includes(category)
}
function validateUnit(unit){
    const units=enumToArray(Units)
    return units.includes(unit)
}
