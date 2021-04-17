const mutations = {
    playMusic(state, info) {
        state.currentMusic = info;
    },
    putMusicList(state, info) {
        state.historyMusic = [...info];

        //制作随机列表
        state.tempMusicList = JSON.parse(JSON.stringify(state.historyMusic));
        state.tempMusicList.sort(() => {
            return 0.5 - Math.random();
        })

    },
    changeStatus(state, info) {
        state.isPlaying = info;
    },
    setDuration(state, info) {
        state.duration = info;
    },
    setCurrentTime(state, info) {
        state.currentTime = info;
    },
    setBuffered(state, info) {
        state.buffered = info;
    },
    jumpStatus(state, info) {
        state.jump = info;
    },
    pre(state, info) {
        //进入上一首前判断当前播放状态
        //顺序播放
        if (state.playMethod === 0) {
            if (state.historyMusic.length != 0) {
                let index = state.historyMusic.findIndex(item => item.id === state.currentMusic.id);
                if (index === 0) {
                    state.currentMusic = state.historyMusic[state.historyMusic.length - 1];
                } else {
                    state.currentMusic = state.historyMusic[index - 1];

                }
                state.currentTime = 0;
            } else {
                state.currentTime = 0;
                state.jump = true;
            }
        } else if (state.playMethod === 1) { //单曲循环
            state.currentMusic = state.currentMusic;
            state.currentTime = 0;
            state.jump = true;
            //随机播放
        } else if (state.playMethod === 2) {
            let index = state.tempMusicList.findIndex(item => item.id === state.currentMusic.id);
            if (index == 0) {
                state.currentMusic = state.tempMusicList[state.tempMusicList.length - 1];
            } else {
                state.currentMusic = state.tempMusicList[index - 1];
            }

        }
        state.currentTime = 0;

    },
    next(state, info) {
        //进入下一首前判断当前播放状态
        //顺序播放
        if (state.playMethod === 0) {
            if (state.historyMusic.length != 0) {
                let index = state.historyMusic.findIndex(item => item.id === state.currentMusic.id);
                if (index === state.historyMusic.length - 1) {
                    state.currentMusic = state.historyMusic[0]
                } else {
                    state.currentMusic = state.historyMusic[index + 1];

                }

                state.currentTime = 0;
            } else {
                state.currentTime = 0;
                state.jump = true;
            }

            //单曲循环
        } else if (state.playMethod === 1) {
            state.currentMusic = state.currentMusic;
            state.currentTime = 0;
            state.jump = true;

            //随机播放
        } else if (state.playMethod === 2) {
            let index = state.tempMusicList.findIndex(item => item.id === state.currentMusic.id);
            if (index == state.tempMusicList.length - 1) {
                state.currentMusic = state.tempMusicList[0];
            } else {
                state.currentMusic = state.tempMusicList[index + 1];
            }

        }
        state.currentTime = 0;


    },
    canPlayFlag(state, info) {
        state.canPlay = info;
    },
    pNChange(state, info) { //pre or next
        state.pN = info;
    },
    delListItem(state, info) {
        let index = state.historyMusic.findIndex(item => item.id === info);

        if (info === state.currentMusic.id) {
            this.commit('next');
        }


        state.historyMusic.splice(index, 1);
    },
    delAllList(state) {
        state.historyMusic = [];
    },
    showList(state, info) {
        state.showListStatus = info;
    },
    //改变播放方式
    changePlayMethod(state, info) {
        state.playMethod = info;


        // if (info === 2) {
        state.tempMusicList = JSON.parse(JSON.stringify(state.historyMusic));
        state.tempMusicList.sort(() => {
                return 0.5 - Math.random();
            })
            // }
    },
    //歌曲结束播放后，按照播放方式进行下一首播放
    endChange(state, info) {

        this.commit("next");
    },
    //修改当前歌词行
    saveLyricIndex(state, info) {
        state.lyricIndex = info;
    },
    //登录后存入用户信息
    saveUserInfo(state, info) {
        state.userInfo = info;
    }
}

export default mutations;