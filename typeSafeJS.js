function matchElse(match, test, fallback) {
    return match === test || match === fallback || false
}

function float(input) {
    return input.toFixed(1);
}

const TYPE = {
    getType: (value) => {
        const type = Object.prototype.toString.call(value).split(' ')[1].replace(']' , '');
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
            switch(value.charAt(1)) {
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