//////////////////////////////
///  yichen

const { ValueDefinition, TypeDefinition, ref } = require('./object-container');

//////////////////////////
// ./service.js
// module.exports = class Service1 {
//     constructor(val1, args1) {
//         this.val1 = val1;
//         this.args1 = this.args1;
//     }
//     work() { return `${this.args1}_${this.val1}`; }
// }

//
// ./config.js 
// module.exports = {
//     '$service1': {
//         type: require('./service'),
//         args: ['$value1', 'a1']
//     },
//     'value1': 10
// }
//

//
// let definitions = convert(require('./config.js'))
// 

module.exports = function convert(jsonObject, escapePrefix = '$') {
    if (typeof jsonObject !== 'object') return [];
    let escapePrefixLength = escapePrefix.length;
    return Object.keys(jsonObject).reduce((result, name) => {
        let definition = jsonObject[name];
        // type
        if (name.startsWith(escapePrefix)) {
            let { args, type } = definition; args = args || [];
            // ref
            args = (Array.isArray(args) ? args : [args]).map((argument) =>
                typeof argument === 'string' && argument.startsWith(escapePrefix) ?
                    ref(argument.substring(escapePrefixLength)) : argument
            );
            result.push(new TypeDefinition(name.substring(escapePrefixLength), type, args));
        }
        // value
        else
            result.push(new ValueDefinition(name, definition));


        return result;

    }, []);
};