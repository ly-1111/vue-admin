import service from "../utils/requete.js"
/**
 * 获取验证码
 */
export function GetSms(data) {
    return service.request({
        method: "post",
        url: "/getSms/",
        data: data
    })
}
/**
 * 获取用户角色
 */




// /**
//  * 退出
//  */
// export function Logout(data = {}) {
//     return service.request({
//         method: "post",
//         url: "/login/",
//         data
//     })
// }

// /**
//  * 登入
//  */
export function Login(data) {
    return service.request({
        method: "post",
        url: "/login/",
        data
    })
}
/**
 * 注册
 */
export function Register(data) {
    return service.request({
        method: "post",
        url: "/register/",
        data
    })
}