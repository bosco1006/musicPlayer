import request from "./axios";

export function getHotSinger() {
    return request({
        url: "/top/artists",
        params: {
            limit: 10
        }
    })
};
// /artist/list?type=1&initial=b
export function getSingers(info) {
    return request({
        url: "/artist/list",
        params: {
            type: 1,
            initial: info,
            limit: 10,
        }
    })
}

export function getSingerMuisc(id) {
    return request({
        url: "/artists",
        params: {
            id
        }
    })
}