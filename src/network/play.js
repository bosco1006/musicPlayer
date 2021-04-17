import request from "./axios.js";

export function getMuiscUrl(id) {
    return request({
        url: "/song/url",
        params: {
            id
        }
    })
}

export function getLyric(id) {
    return request({
        url: "/lyric",
        params: {
            id
        }
    })
}

export function getComment(id, offset) {
    return request({
        url: "/comment/music",
        params: {
            id,
            offset
        }
    })
}