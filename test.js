// First Function Body Concept
const globals = {}

function TypedFunction(name, func) {
    const StringFunction = String(func);
    
    const functionOpening = StringFunction.search("{");
    const sliceAndReduce = StringFunction.slice(functionOpening +1).replace(/(\r\n|\n|\r)/gm,"");
    const split = sliceAndReduce.split("\"")
    let retType;
    split.every(str => {
        if (str.startsWith('expect')) {
            retType = str.replace("expect ", "");
            return false
        }
        return true
    });

    console.log(retType);
}

TypedFunction("test", () => {
    "expect Any"

    console.log("Hello World!");
})

function createFunction(funcName) {
	if (funcName in globals) return console.error('Already exists');
	globals[funcName] = new Function("return " + "function (a, b) { return a + b; }")();
    
}