import request from "./axios";

export function getBanner() {
    return request({
        url: "/banner",
    })
}

export function getMusicList() {
    return request({
        url: "/recommend/resource",
        params: {
            cookie: localStorage.getItem("userCookie"),
        }
    })
}

export function getNewMusic() {
    return request({
        url: "/personalized/newsong",
    })
}

export function getDetailMusicList(id, cookie) {
    return request({
        url: "/playlist/detail",
        params: {
            cookie: localStorage.getItem("userCookie"),
            id,

        }
    })
}

export function getSongDetail(ids) {
    return request({
        url: "/song/detail",
        params: {
            ids,
        }
    })
}

export function getLogo() {
    return request({
        url: "/homepage/dragon/ball",
    })
}