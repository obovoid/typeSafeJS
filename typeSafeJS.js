
/* #region  Caching  */
// Normally all Environments have process included, but in case not we load an empty object on it.
if (!process) {
    process = new Object();
}

// Setting to own scope, to avoid access from outside to the cache.
{
    let _cache = []
    process.locateTypedValue = (functionHashRef, key) => {
        if (!_cache[functionHashRef] || !_cache[functionHashRef][key]) return '[Object TypedPromise]'
        return _cache[functionHashRef][key]
    }
    process.cacheValue = (functionHashRef, key, value) => {
        if (!_cache[functionHashRef]) {
            _cache[functionHashRef] = []
        }
        _cache[functionHashRef][key] = value;
    }
}
/* #endregion */

/* #region  Functions */
function matchElse(match, test, fallback) {
    return match === test || match === fallback || false
}

function _float(input) {
    return input.toFixed(1);
}
/* #endregion */

/* #region  Types */
const TYPE = {
    getType: (value) => {
        const type = Object.prototype.toString.call(value).split(' ')[1].replace(']', '');
        switch (type) {
            case 'Number':
                return Number(value) === value && value % 1 !== 0 ? 'Float' : 'Integer';
            case 'String':
                if (Number(value)) {
                    if (value.includes('.')) return 'Float'
                }
                return TYPE.isPath(value) ? 'Path' : 'String'
            default:
                return type;
        }
    },
    isPath: (value) => {
        // regex is unfortunately not reliable enough
        // Tested in 50+ Test cases. If any Issues appear, please report them on github!

        if ((!value.includes('/')) && (!value.includes('\\'))) return false;
        if ((value.charAt(0) === '.') && matchElse(value.charAt(1), '/', '\\')) return true // relative path
        if ((value.charAt(0) === '.') && value.charAt(1) === "." && matchElse(value.charAt(2), '/', '\\')) return true // relative path
        if (!Number.isInteger(value.charAt(0)) && (value.charAt(1) === ':') && matchElse(value.charAt(2), '/', '\\')) return true // Abs. path with Partition
        if (matchElse(value.charAt(0), '/', '\\')) {
            // Test is absolute path
            switch (value.charAt(1)) {
                case '/':
                    // '/' is invalid to be used twice in a row
                    return false
                case '\\':
                    // '\' is invalid to be used twice in a row
                    return false
                case ':':
                    // ':' is invalid to be used after '/' and '\'
                    return false
                case '*':
                    // '*' is invalid in general
                    return false
                case '?':
                    // '?' is invalid in general
                    return false
                case '"':
                    // '"' is invalid in general
                    return false
                case '<':
                    // '<' is invalid in general
                    return false
                case '>':
                    // '>' is invalid in general
                    return false
                case '|':
                    // '|' is invalid in general
                    return false
                default:
                    return true
            }
        }
        // Web addresses are not counted as file paths.
        if (value.startsWith('http') || value.startsWith('www.')) return false

        // Accepting all other paths like "dir1\dir2\file.txt" and similar.
        return true;
    },
    "NUMBER": "Number",
    "INTEGER": "Integer",
    "FLOAT": "Float",
    "PATH": "Path",
    "FUNCTION": "Function",
    "ARRAY": "Array",
    "OBJECT": "Object",
    "STRING": "String",
    "REGEXP": "RegExp",
    "BOOLEAN": "Boolean",
    "ANY": "Any"
}

const integer = {
    isValid(input) {
        return TYPE.getType(input) === 'Integer'
    },
    get() {
        return "integer"
    }
}

const float = {
    isValid(input) {
        return TYPE.getType(input) === 'Float'
    },
    get() {
        return "float"
    }
}

const path = {
    isValid(input) {
        return TYPE.getType(input) === 'Path'
    },
    get() {
        return "path"
    }
}

const func = {
    isValid(input) {
        return TYPE.getType(input) === 'Path'
    },
    get() {
        return "func"
    }
}

const array = {
    isValid(input) {
        return TYPE.getType(input) === 'Array'
    },
    get() {
        return "array"
    }
}

const object = {
    isValid(input) {
        return TYPE.getType(input) === 'Object'
    },
    get() {
        return "object"
    }
}

const string = {
    isValid(input) {
        return TYPE.getType(input) === 'String'
    },
    get() {
        return "string"
    }
}

const regexp = {
    isValid(input) {
        return TYPE.getType(input) === 'RegExp'
    },
    get() {
        return "regexp"
    }
}

const boolean = {
    isValid(input) {
        return TYPE.getType(input) === 'Boolean'
    },
    get() {
        return "boolean"
    }
}

const any = {
    isValid(_input) {
        return true
    },
    get() {
        return "any"
    }
}
/* #endregion */

/* #region  Helper Classes */
class FunctionIdentifier {
    #hash
    constructor() {
        this.#hash = Date.now().toString(36) + Math.random().toString(36).substring(2, 12).padStart(12, 0);
    }

    get identifier() {
        return this.#hash;
    }
}
/* #endregion */

/* #region  Enum, needs work! */
class Enum {
    #data = {}
    constructor(...Arguments) {
        Arguments.forEach((arg, index) => {
            this.#data[arg] = index
        })
    }

    $(value) {
        return this.#data[value]
    }
}
/* #endregion */

/* #region  TypedLet */
class TypedLet {
    // Disallow direct changes to the Typed behaving let
    #value
    #type
    constructor(type, value) {
        this.#type = TYPE[type.toUpperCase()]
        if (!this.#type) throw new Error(`Failed to construct TypedLet. Entered Type {${type}} does not exist!`);
        const valType = TYPE.getType(value)
        if (this.#type !== valType && this.#type !== 'Any') {
            const isAnyNumber = valType === 'Float' || valType === 'Integer'
            if (isAnyNumber && this.#type !== 'Number') {
                throw new Error(`Failed to construct TypedLet. Entered Type value {${valType}} does not match ${this.#type}!`);
            }

            const isPath = valType === 'Path'
            if (isPath && typeof value !== 'string') {
                throw new Error(`Failed to construct TypedLet. Entered Type value {${valType}} does not match ${this.#type}!`)
            } else if (!isAnyNumber && !isPath) {
                throw new Error(`Failed to construct TypedLet. Entered Type value {${valType}} does not match ${this.#type}!`)
            }
        }
        this.#value = value
    }

    get value() {
        if (this.#type === "Float" && typeof this.#value === "string") return Number(this.#value);
        return this.#value
    }

    get type() {
        return this.#type
    }

    set value(val) {
        const type = TYPE.getType(val);
        if (this.#type !== 'Any') {
            if (type !== this.#type) {
                const isIntegerOrFloat = type === 'Float' || type === 'Integer'
                const errSyntax = `Failed to set TypedLet. Entered value {type:${type}} does not match constructed type! {${this.#type}}`

                if (this.#type === 'Number' && !isIntegerOrFloat) {
                    throw new Error(errSyntax);
                }

                if (this.#type === 'Integer') {
                    throw new Error(errSyntax);
                }

                if (this.#type === 'Path') {
                    throw new Error(errSyntax);
                }

                if (this.#type === 'Function') {
                    throw new Error(errSyntax);
                }

                if (this.#type === 'Array') {
                    throw new Error(errSyntax);
                }

                if (this.#type === 'Object') {
                    throw new Error(errSyntax);
                }

                if (this.#type === 'String' && type !== 'Path') {
                    throw new Error(errSyntax);
                }

                if (this.#type === 'RegExp') {
                    throw new Error(errSyntax);
                }

                if (this.#type === 'Boolean') {
                    throw new Error(errSyntax);
                }
            }
        }
        this.#value = val
        return this.#value
    }
}
/* #endregion */

/* #region  TypedFunction */
class TypedFunction {
    #caller
    #typeList = new Array();
    #id
    #returnType
    constructor(...Arguments) {
        let hasReturnType = false;
        this.#returnType = null;
        let callback = null

        const unique = new FunctionIdentifier();
        this.#id = unique.identifier;

        Arguments.forEach((regPam, index) => {
            if (typeof regPam !== "function") {
                let regString = String(regPam);
                if (!regString.startsWith('/') || !regString.endsWith('/')) throw new Error(`Failed to create Typed Function! The Parameter Syntax was invalid. If you have difficulties then please read the documentation.`);
                let regStringSliced = regString.slice(1).slice(0, -1);

                const [name, type] = regStringSliced.split('@')

                if (name === '->' && hasReturnType === true) throw new Error(`Failed to create Typed Function! It seems that you have two or more return Type defined while there can only be one return Type defined in a single function!`);
                if (name === '->' && !hasReturnType) {
                    hasReturnType = true;
                    this.#returnType = type

                    if (index !== Arguments.length - 1 && typeof Arguments[index + 1] !== "function") {
                        console.warn(`It seems that you have defined a return type in a TypedFunction before submitting the last parameter. For better readability it is adviced to put the return type as the last parameter.`);
                    }
                }

                this.#typeList.push({ name, type });
            } else {
                if (index !== Arguments.length - 1) {
                    throw new Error(`It seems that you have defined a callback function in a TypedFunction which must be the last parameter but isn't!`);
                }

                callback = regPam
                this.#caller = this.#convert(callback)
            }
        });
    }

    #convert = (functionBody) => {
        let stringBody = String(functionBody)
        const lines = stringBody.split('\n');

        lines.forEach((line, lineIndex) => {
            let words = line.split(' ').filter(word => word !== '');
            let wordIndex = 0

            const initState = new Enum('NONE', 'EXPECT', 'ASSIGN');

            let variableInitState = initState.$('NONE');
            words.forEach((word, wordsIndex) => {
                wordIndex = wordsIndex

                switch (word) {
                    case 'const':
                    case 'let':
                    case 'var':
                        if (variableInitState === initState.$('NONE')) {
                            variableInitState = initState.$('EXPECT');
                        }
                        break
                    case '=':
                        if (variableInitState === initState.$('EXPECT')) {
                            variableInitState = initState.$('ASSIGN');
                        }
                        break
                    default:
                        if (variableInitState === initState.$('ASSIGN')) {
                            if (!word.includes('>>')) {
                                // throw error? Type not specified
                            } else {
                                let [value, type] = word.split(">>");

                                try {
                                    eval(value)
                                } catch (e) {
                                    if (e) {
                                        const _l = line
                                        const id = this.#id; const val = value
                                        line = line.replace(`${value}>>${type}`, `process.locateTypedValue("${id}", "${val}")`);
                                        stringBody = stringBody.replace(_l, line);
                                    }
                                }

                                // Needs to be rewritten!
                                // try {
                                //     let funcType = eval(type);
                                //     if (TYPE.getType(funcType) === "Object") {
                                //         // Type detected 
                                //         if (!funcType.isValid(value)) throw new Error(`transpiler Error: Type mismatch near ${lineIndex}:${wordIndex}. Expected Type ${type}!`)
                                //     }
                                // } catch (e) {
                                //     console.error('Unhandled Exception Error. If this Error happens often and you believe it is an error caused by TypeSafeJS, then create an Issue on github with as much information as possible\n' + e);
                                // }
                            }
                        }
                        break
                }
            });
            variableInitState = initState.$('NONE');
        });

        return eval(stringBody);
    }

    onCall = (callee) => {
        this.#caller = this.#convert(callee)
    }

    call(...args) {
        if ((this.#returnType !== null ? this.#typeList.length - 1 : this.#typeList.length) > args.length) throw new Error(`Error calling Typed Function! Too few arguments! Expected ${this.#typeList.length} arguments but received: ${args.length}`);

        this.#typeList.forEach((typeObject, index) => {
            const name = typeObject.name
            const type = typeObject.type

            if (name !== '->') { // return type
                const argType = TYPE.getType(args[index]);

                if (type !== argType) throw new Error(`Error calling Typed Function! Expected ${type} for ${name} instead of ${argType}. Error in Call.`);

                process.cacheValue(this.#id, name, args[index]);

            }
        });
        this.#caller(...args);
    }
}
/* #endregion */

/* #region  Testing Codespace */
setTimeout(() => {
    const Testname = new TypedFunction(/paramName@String/, /param2@Integer/, /param3@Integer/, /->@String/, () => {
        const str = paramName >> string
        console.log(str);

        let int = param2 >> integer
        console.log(int);

        let int2 = param3 >> integer
        console.log(int2);

        console.log(int * int2);
    });
    Testname.call("Hello World", 5, 2);
}, 1);
/* #endregion */