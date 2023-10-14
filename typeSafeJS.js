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
    "BOOL": "Boolean",
    "ANY": "any"
}

class TypedLet {
    // Disallow direct changes to the Typed behaving let
    #value
    #type
    constructor(type, value) {
        if (!TYPE[type.toUpperCase()]) throw new Error('Failed to construct TypedLet. Entered Type does not exist!');
        if (type !== TYPE.getType(value)) throw new Error('Failed to construct TypedLet. Entered Type value does not match!')
        this.#type = type
        this.#value = value
    }
    
    get value() {
        if (this.#type === "Float" && typeof this.#value === "string") return Number(this.#value); 
        return this.#value
    }

    set value(val) {
        const type = TYPE.getType(val);
        if (type !== this.#type) throw new Error('Failed to set TypedLet. Entered value does not match constructed type!');
        this.#value = val
        return this.#value
    }
}

let test = new TypedLet(TYPE.FLOAT, float(1.0));
console.log(test.value);
console.log(test.value = 2.5);