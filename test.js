
class TypedFunction {
    #caller
    #typeList = new Array();
    constructor(...Arguments) {
        let hasReturnType = false;
        let returnType = null;

        Arguments.forEach((regPam, index) => {
            let regString = String(regPam);
            if (!regString.startsWith('/') || !regString.endsWith('/')) throw new Error(`Failed to create Typed Function! The Parameter Syntax was invalid. If you have difficulties then please read the documentation.`);
            let regStringSliced = regString.slice(1).slice(0, -1);
            
            const [name, type] = regStringSliced.split('@')

            if (name === '->' && hasReturnType === true) throw new Error(`Failed to create Typed Function! It seems that you have two or more return Type defined while there can only be one return Type defined in a single function!`);
            if (name === '->' && !hasReturnType) {
                hasReturnType = true;
                returnType = type

                if (index !== Arguments.length -1) {
                    // TODO, add Stacklog @obovoid
                    console.warn(`It seems that you have defined a return type in a TypedFunction before submitting the last parameter. For better readability it is adviced to put the return type as the last parameter.`);
                }
            }

            this.#typeList.push({name, type});
        });
    }

    onCall = (callee) => {
        this.#caller = callee
    }

    call() {
        this.#caller();
    }
}

const Testname = new TypedFunction(/paramName@String/, /->@String/)
Testname.onCall(result => {
    console.log("Hello World!");
})

setTimeout(() => {
    Testname.call();
}, 500);