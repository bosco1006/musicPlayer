import request from "./axios";

export function getHotSearch() {
    return request({
        url: "/search/hot",
    })
}

export function getSearchDefault() {
    return request({
        url: "/search/default",
    })
}

export function getSeachInfo(key, offset) {
    return request({
        url: `/cloudsearch`,
        params: {
            keywords: key,
            offset: 0,
        }
    })
}

export function getSearchSingers(key) {
    return request({
        url: "/search/multimatch",
        params: {
            keywords: key
        }
    })
}



export function getSuggest(key) {
    return request({
        url: "/search/suggest",
        params: {
            keywords: key,
        }
    })
}