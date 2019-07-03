
export default class EjetConstant {
    static DEBUG = false;
    
    static API = "";
    static IMG_API = "";
    static HTTP = ('https:' == window.location.protocol) ? "https://" : "http://";
    static IMG_UPLOAD =  EjetConstant.API+'/api/static/img/upload';//
    static FILE_UPLOAD =  EjetConstant.API+'/api/static/img/upload';//
}