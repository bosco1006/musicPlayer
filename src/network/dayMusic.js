import request from "./axios";
export function getDayMusic() {
    return request({
        url: "/recommend/songs",
        params: {
            cookie: localStorage.getItem("userCookie"),
        }
    })
}

export function getPic() {
    return request({
        url: "/personalized/privatecontent",
    })
}