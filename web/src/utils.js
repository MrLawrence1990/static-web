import Md5Lib from "js-md5";
import CONSTANT from './constant';
//ModalInfo

export default class Config extends CONSTANT {
	/**
	 * 
	 * @param {*} api 接口地址
	 * @param {*} options 
	 *	options:{
	 * 		params:post参数
	 * 		beforeRequest:请求前事件
	 * 		afterRequest：请求完成事件
	 * 		error:function(data){} 业务逻辑错误回调
	 * 		onError:请求错误事件（网络错误、超时等）
	 * }
	 * @param {*} callback 业务逻辑成功回调
	 */

	static request(options) {
		let that = this;
		if (options.beforeRequest && typeof options.beforeRequest === 'function') {
			options.beforeRequest();
		}
		let header = {
			'charset': 'UTF-8',
			'Content-Type': 'application/json; charset=utf-8',
			// 'Authorization': Config.getCookie('token'),
		};
		return fetch(this.API + options.api, {
			method: options.method || "POST",
			credentials: 'include',
			// mode: "cors",
			// mode: "no-cors",
			headers: header,
			body: JSON.stringify(options.params)
		}).then(function (response) {
			return response.json();
		}).then(function (result) {
			if (options.afterRequest && typeof options.afterRequest === 'function') {
				//请求后回调
				options.afterRequest();
			}
			if (result.status === 200) {
				if (typeof options.success === 'function') {
					options.success(result.data)
				}
			} else if (result.status === 403) {
				if(options.sessionError){
					options.sessionError();
				}
			} else {
				alert(result.msg)
			}
		}).catch(function (ex) {
			console.error(ex);
			if (options.afterRequest && typeof options.afterRequest === 'function') {
				options.afterRequest();
			}
			if (options.onError && typeof options.onError === 'function') {
				//异常回调
				options.onError(ex);
			} else {
				alert('system error')
			}
		})
	}


	static guid() {
		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
	}

	static saltMd5(str) {
		return Md5Lib.hex(this.salt(str) + "&" + this.GUID + "&" + str);
	}

	static md5(str) {
		return Md5Lib.hex(str);
	}

	static salt(str) {
		var ss = '';
		for (var i = 0; i < str.length; i++) {
			ss += str.charAt(i).charCodeAt();
		}
		return ss;
	}
	static deepclone(obj) {
		if (typeof obj !== 'object') {
			return
		}

		if (obj === null) {
			return null;
		}
		if (obj === undefined) {
			return undefined;
		}
		var newObj = obj instanceof Array ? [] : {}
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				newObj[key] = typeof obj[key] === 'object' ? this.deepclone(obj[key]) : obj[key]
			}
		}
		return newObj
	}

}
