import request from "./axios";

export function loginAccount(phone, password) {
    return request({
        url: "/login/cellphone",
        params: {
            phone,
            password
        }
    })
}

export function getUserDetailInfo(uid) {
    return request({
        url: "/user/detail",
        params: {
            uid,
        }
    })
}

export function getUserMusicList(cookie, uid) {
    return request({
        url: "/user/playlist",
        params: {
            cookie,
            uid
        }
    })
}

export function logOut() {
    return request({
        url: "/logout",
    })
}