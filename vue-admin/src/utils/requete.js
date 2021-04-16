import axios from 'axios';
import { Message } from "element-ui";
// import { getToken, getUserName } from "../utils/app";

//创建axios ，赋给变量service
const BASEURL = process.env.NODE_ENV === 'production' ? '' : '/devApi';

const service = axios.create({
    // baseURL: baseURL,
    // timeout: 15000,
    baseURL: BASEURL,
    timeout: 15000, //超时的时间
})

// 添加
/**
 * 请求接口前，做一些数据处理（请求拦截器）
 */
service.interceptors.request.use(function(config) {
    // 在发送请求之前做些什么
    //后台需要前端这边传相关的参数(在请求头添加参数)
    //Tokey,userId,sui
    return config;
}, function(error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加
/**
 * 请求接口后，返回数据进行拦截（响应拦截器）
 */
service.interceptors.response.use(function(response) {
    // 对响应数据做点什么
    let data = response.data
    if (data.resCode !== 0) {
        Message.error(data.message);
        return Promise.reject(data);
    } else {
        return response;
        // return Promise.resolve
    }


}, function(error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});

// service.request({
//     method: "post",
//     url: "/getSms/",
//     data: {}
// })

export default service;
/**
 * 使用export default时，但不能同时存在多个default
 *文件import不需要花括号
 */