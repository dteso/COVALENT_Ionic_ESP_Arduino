
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

export function makeid(length) {
  var result           = [];
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * 
charactersLength)));
 }
 return result.join('');
}

