import request from "./axios";

export function getMvList(offset) {
    return request({
        url: "/mv/exclusive/rcmd",
        params: {
            offset: offset,
            limit: 10,
        }
    })
}

export function getMvUrl(id) {
    return request({
        url: "/mv/url",
        params: {
            id,
        }
    })
}