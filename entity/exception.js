
class Exception extends Error {
    constructor(msg){
        super(msg);
        this.msg = msg;
        this.code = 500;
    }
}

module.exports = Exception;