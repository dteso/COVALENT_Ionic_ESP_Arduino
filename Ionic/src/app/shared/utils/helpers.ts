
  // Helper
const StringIsNumber = (value : any) => {
    return isNaN(Number(value)) === false;
  } 
  
  // Turn enum into array
export function enumToObjectsArray(enm){
    let array = [];
       Object.keys(enm)
          .filter(StringIsNumber)
          .map(key => {
            array.push({ id: key, value: enm[key]})
          });
      return array;
}