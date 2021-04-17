import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [{
        path: '/',
        name: 'Recommend',
        component: () =>
            import ("views/recommend/Recommend.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }

        }
    },
    {
        path: '/rank',
        name: 'Rank',
        component: () =>
            import ("views/rank/Rank.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }

        }
    },
    {
        path: '/singer',
        name: 'Singer',
        component: () =>
            import ("views/singer/Singer.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }

        }
    },
    {
        path: '/musiclist',
        name: 'MusicList',
        meta: {
            headFlag: true,
        },
        component: () =>
            import ("views/musicList/MusicList.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }

        }

    },
    {
        path: '/singermusiclist',
        name: 'SingerMusicList',
        meta: {
            headFlag: true,
        },
        component: () =>
            import ("views/singerMusicList/SingerMusicList.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }

        }
    },
    {
        path: '/ranklist',
        name: 'RankList',
        meta: {
            headFlag: true,
        },
        component: () =>
            import ("views/rankList/RankList.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }

        }
    },
    {
        path: '/play',
        name: 'Play',
        meta: {
            headFlag: true,
            bottomFlag: true,
        },
        component: () =>
            import ("views/play/Play.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }

        }
    },
    {
        path: '/search',
        name: 'Search',
        meta: {
            headFlag: true,
        },
        childComps: [{
                path: "complex",
                name: "Complex",
            },
            {
                path: "single",
                name: "Single",
            },
            {
                path: "songlist",
                name: "SongList",
            },
            {
                path: "video",
                name: "Video",
            },
            {
                path: "lyric",
                name: "Lyric",
            },
            {
                path: "singer",
                name: "Singer",
            },
            {
                path: "album",
                name: "Album",
            },
            {
                path: "user",
                name: "User",
            },

        ],
        component: () =>
            import ("views/search/Search.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }

        }
    },
    {
        path: "/mv",
        name: "Mv",
        meta: {

            bottomFlag: true,
        },
        component: () =>
            import ("views/mv/MV.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }

        }
    },
    {
        path: "/myself",
        name: "Myself",
        meta: {
            headFlag: true,
        },
        component: () =>
            import ("views/myself/Myself.vue"),
    },
    {
        path: "/comment",
        name: "comment",
        meta: {
            headFlag: true,
            bottomFlag: true,
        },
        component: () =>
            import ("views/play/childComps/Comment.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }

        }
    },
    {

        path: '/daymusicrecommend',
        name: 'DayMusicRecommmend',
        meta: {
            headFlag: true,
        },
        component: () =>
            import ("views/dayMusicRecommend/DayMusicRecommend.vue"),
        beforeEnter: (to, from, next) => {
            if (sessionStorage.getItem("user")) {
                next();
                return;
            } else {
                next({ path: "/myself" });
                return;
            }


        },
    }

]



const router = new VueRouter({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes
})




export default router