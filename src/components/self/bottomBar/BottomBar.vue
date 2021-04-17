<template>
  <div class="bottom-bar clear-fix" @click="goTo" ref="bottomBar">
    <audio :src="url" ref="audio"></audio>
    <div class="left">
      <img class="img" :src="currentMusic.pic" ref="img" />
      <div class="music-info">
        <p class="music-name">{{ currentMusic.name }}</p>
        <p class="music-singer">
          <span class="singers" v-for="(item, index) in currentMusic.singer">{{
            item.name
          }}</span>
        </p>
      </div>
    </div>
    <div class="right">
      <div
        class="play iconfont"
        :class="{ 'icon-bofang1': !isPlaying, 'icon-timeout': isPlaying }"
        @click.stop="play"
      >
        <van-circle
          v-model="currentRate"
          :rate="100"
          :speed="2"
          :size="isPlaying ? '0.79rem' : '0.818rem'"
          stroke-width="96"
          layer-color="#666666"
          color="#EE5034"
          class="circle"
        />
      </div>
      <div
        class="list iconfont icon-liebiao2"
        @click.stop="showCurrentList"
      ></div>
    </div>
  </div>
</template>

<script>
import { getMuiscUrl } from "network/play.js";
export default {
  name: "BottomBar",
  data() {
    return {
      currentRate: 0,
      url: "",
    };
  },
  components: {},
  created() {},
  mounted() {
    //当没有歌曲的时候隐藏底部播放栏
    if (this.currentMusic.id == "") {
      this.$refs.img.style.opacity = "0";
    }

    this.audio = this.$refs.audio;
    if (this.$store.state.currentMusic) {
      this.getMusicUrlData(this.$store.state.currentMusic.id);
    }

    //请求数据时触发事件
    this.audio.addEventListener("progress", () => {
      //实时保存缓存时间
      // if (this.audio.buffered.length.length > -1) {
      this.$store.commit(
        "setBuffered",
        parseInt(this.audio.buffered.end(this.audio.buffered.length - 1))
      );
      // }
    });

    this.audio.addEventListener("canplay", () => {
      this.$store.commit("canPlayFlag", true);

      //当歌曲可以播放时自动切换状态，开始播放(当用谷歌浏览器不支持自动播放时，需要关掉，否则有小bug)
      //上一条的情况时，需要注释以下两行
      //登录之后才可以播放
      if (sessionStorage.getItem("user")) {
        this.$store.commit("changeStatus", true);
        this.audio.play();
      }

      this.$store.commit("setDuration", parseInt(this.audio.duration));
    });
    this.audio.addEventListener("ended", () => {
      this.$store.commit("canPlayFlag", false);
      this.$store.commit("changeStatus", false);
      this.$store.commit("endChange");
    });
  },
  computed: {
    isPlaying() {
      let flag = this.$store.state.isPlaying;
      if (this.$refs.img) {
        if (flag) {
          this.$refs.img.style.animationPlayState = "running";
          this.$refs.audio.play();
        } else {
          this.$refs.img.style.animationPlayState = "paused";
          this.$refs.audio.pause();
        }
      }
      return flag;
    },
    currentMusic() {
      //当有歌曲的时候显示底部播放栏
      if (this.$refs.bottomBar && this.$store.state.currentMusic.id != "") {
        this.$refs.img.style.opacity = "1";
      }

      if (this.$store.state.currentMusic == undefined) {
        if (localStorage.getItem("musicList")) {
          let list = JSON.parse(localStorage.getItem("musicList"));
          this.$store.commit("putMusicList", list);
        }
        if (localStorage.getItem("currentMusic")) {
          let current = JSON.parse(localStorage.getItem("currentMusic"));
          this.$store.commit("playMusic", current);
          return current;
        } else {
          return {
            id: "",
            name: "",
            singer: "",
            pic: "",
          };
        }
      }
      localStorage.setItem(
        "currentMusic",
        JSON.stringify(this.$store.state.currentMusic)
      );
      if (this.$store.state.currentMusic.id) {
        this.getMusicUrlData(this.$store.state.currentMusic.id);
      }
      return this.$store.state.currentMusic;
    },
    playMethod() {
      return this.$store.state.playMethod;
    },
  },
  methods: {
    play() {
      if (this.currentMusic.id != "") {
        if (this.isPlaying) {
          this.$refs.audio.pause();
        } else {
          this.$refs.audio.play();
        }
        this.$store.commit("changeStatus", !this.isPlaying);
      }
    },
    goTo() {
      this.$router.push({
        path: "/play",
      });
      this.$store.commit("setCurrentTime", this.$refs.audio.currentTime);
    },
    getMusicUrlData(id) {
      getMuiscUrl(id).then((res) => {
        if (res.data[0].url == null) {
          if (this.$store.state.pN) {
            this.$store.commit("next");
          } else {
            this.$store.commit("pre");
          }
        } else {
          this.url = res.data[0].url;
        }
      });
    },
    showCurrentList() {
      this.$store.commit("showList", true);
    },
  },
  watch: {
    "$store.state.jump": {
      handler: function (val) {
        if (val == true) {
          this.$refs.audio.currentTime = this.$store.state.currentTime;
          this.$store.commit("jumpStatus", false);
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.bottom-bar {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  height: 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 6px 1px rgba(0, 0, 0, 0.2);
  .left {
    display: flex;
    height: 100%;
    align-items: center;
    .img {
      margin-left: 18px;
      margin-right: 12px;
      width: 1.2rem;
      height: 1.2rem;
      border-radius: 50%;
      animation: rotate 12s linear infinite;
      animation-play-state: paused;
      background-color: #fff;
    }
    .music-info {
      font-size: 0.42rem;
      width: 4.8rem;
      overflow: hidden;
      .music-name {
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .music-singer {
        margin-top: 2px;
        font-size: 0.35rem;
        width: 5rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        .singers {
          margin-right: 6px;
          display: inline-block;
          vertical-align: top;
        }
      }
    }
  }
  .right {
    height: 100%;
    display: flex;
    align-items: center;

    .icon-bofang1 {
      font-size: 1rem;
      position: relative;

      .circle {
        position: absolute;
        top: 0.148rem;
        left: 0.09rem;
      }
    }
    .icon-timeout {
      font-size: 0.79rem;
      margin-right: 0.1rem;
      position: relative;
      .circle {
        position: absolute;
        top: 0.049rem;
        left: -0.006rem;
      }
    }
    .list {
      font-size: 0.75rem;
      margin: 0 20px 0 10px;
    }
  }
}
</style>