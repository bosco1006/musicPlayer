import request from "./axios";

export function getRank() {
    return request({
        url: "/toplist/detail"
    })
}

export function getRankDetail(id) {
    return request({
        url: "/playlist/detail",
        params: {
            id
        }
    })
}