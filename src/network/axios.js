import axios from "axios";

export default function request(config) {
    const instance = axios.create({
        baseURL: "http://localhost:3000",
        time: 5000,
        headers: {
            "Content-Type": "application/json;charset=UTF-8" //表单数据传递转化
        }
    })
    instance.interceptors.request.use(config => {
            return config;
        },
        err => {
            console.log(err);
            return err;
        })

    instance.interceptors.response.use(res => {
        return res.data;
    }, err => {
        console.log(err);
        return err;
    })

    return instance(config);
}