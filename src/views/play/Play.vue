<template>
  <div class="play">
    <div class="mask" ref="bgc"></div>
    <div class="mask1"></div>
    <div class="box">
      <div class="header">
        <div class="back iconfont icon-arrow-down-m" @click="back"></div>
        <div class="music-info">
          <p class="music-name">{{ currentMusic.name }}</p>
          <p class="music-singer">
            <span
              class="singers"
              :class="{ multiple: currentMusic.singer.length > 1 }"
              v-for="(item, index) in currentMusic.singer"
              >{{ item.name }}</span
            >
          </p>
        </div>
      </div>
      <div class="middle" @click="changePage">
        <div class="middle-box" v-show="!page">
          <div class="circle">
            <img :src="currentMusic.pic" alt="" ref="img" />
          </div>
          <div class="comment iconfont icon-pinglun1" @click.stop="showComment">
            <!-- <span class="comment-num">{{ comments.length }}</span> -->
          </div>
        </div>
        <div class="lyric-box" v-show="page">
          <ul
            ref="ul"
            @touchstart.stop="lyricTouchStart"
            @touchmove.stop="lyricTouchMove"
            @touchend.stop="lyricTouchEnd"
          >
            <li v-for="(item, index) in lyric" :time="item[0]" :key="index">
              {{ item[1] }}
            </li>
          </ul>
        </div>
      </div>
      <div class="bottom">
        <div class="progress">
          <span class="start">{{ currentTime | numFormat }}</span>
          <div class="line" ref="line" @click.stop="jump">
            <div class="active-line" ref="activeLine"></div>
            <div class="buffered-line" ref="bufferedLine"></div>
            <div
              class="line-bar"
              ref="bar"
              @touchstart="touchstart"
              @touchmove="touchmove"
              @touchend="touchend"
            ></div>
          </div>
          <span class="end">{{ duration | numFormat }}</span>
        </div>
        <div class="controls">
          <div
            class="play-method iconfont"
            :class="{
              'icon-liebiao3': playMethod === 0,
              'icon-shunxu_danqu_': playMethod === 1,
              'icon-suijibofang': playMethod === 2,
            }"
            @click="changePlayMethod"
          ></div>
          <div class="pre iconfont icon-xiayishou1" @click="pre"></div>
          <div
            class="play-btn iconfont"
            :class="{
              'icon-bofang': !isPlaying,
              'icon-bofangzanting': isPlaying,
            }"
            @click="play"
          ></div>
          <div class="next iconfont icon-xiayishou" @click="next"></div>
          <div class="favorite iconfont icon-ziyuan177"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CommentView from "./childComps/Comment";
import { getLyric, getComment } from "network/play.js";
export default {
  name: "Play",
  components: {
    CommentView,
  },
  data() {
    return {
      timer: null,
      page: false,
      lyric: [],
      lyricTimer: null,
      index: 0,
      isMove: false,
      comments: [],
      showCommentPage: false,
    };
  },
  created() {},
  activated() {
    //首页
    this.showCommentPage = false;

    // 计算歌词移动距离（视窗宽度/10 + li设置的marign值）;
    this.lyricMove = (document.documentElement.clientWidth / 10) * 0.6 + 18;
    //先设置进度条进度
    let bPer =
      this.buffered / this.duration >= 1 ? 1 : this.buffered / this.duration;
    this.$refs.bufferedLine.style.width = bPer * this.totalW + "px";
    //基本配置
    this.ul = this.$refs.ul;
    this.ulTop = this.ul.offsetTop;
    this.ulHeight = this.ul.offsetHeight;
    this.totalW = this.$refs.line.offsetWidth;
    this.w = this.totalW - this.$refs.bar.offsetWidth;
    this.$refs.bgc.style.background = `url(${this.currentMusic.pic}) no-repeat`;
    clearInterval(this.timer);
    this.lineBarMove();

    //初始歌词滚动
    this.ul.style.transform = "translateY(0px)";
    //每次进来默认跳到当前行歌词
    this.ul.style.transform = `translateY(${-this.index * this.lyricMove}px)`;
    clearTimeout(this.lyricTimer);
    // 计算歌词移动距离;
    this.watchLyric();
    this.animationWatch();
    //因为歌词算法每次都会有些许延迟，所以进入默认不在歌词页面
    this.page = false;
  },
  deactivated() {
    clearInterval(this.timer);
    clearTimeout(this.lyricTimer);
  },

  computed: {
    buffered() {
      return this.$store.state.buffered;
    },
    isPlaying() {
      let flag = this.$store.state.isPlaying;
      this.animationWatch();
      return this.$store.state.isPlaying;
    },
    currentMusic() {
      if (this.$refs.bgc) {
        this.$refs.bgc.style.background = `url(${this.$store.state.currentMusic.pic}) no-repeat`;
        this.$refs.img.src = this.$store.state.currentMusic.pic;

        this.ul.style.transform = "translateY(0px)";
        //清掉歌词全部样式
        if (this.ul.children.length > 1) {
          this.$refs.ul.children.forEach((item) => {
            item.className = "";
          });
        }
      }
      //初始歌词
      this.index = 0;

      //请求歌词
      this.getLyricInfo(this.$store.state.currentMusic.id);
      //请求评论
      getComment(this.$store.state.currentMusic.id, 1).then((res) => {
        this.comments = [];
        res.comments.forEach((item, index) => {
          this.comments.push({
            name: item.user.nickname,
            avator: item.user.avatarUrl,
            content: item.content,
            time: item.time,
          });
        });
      });

      return this.$store.state.currentMusic;
    },
    currentTime() {
      this.watchLyric();
      return this.$store.state.currentTime;
    },
    duration() {
      return this.$store.state.duration;
    },
    playMethod() {
      return this.$store.state.playMethod;
    },
  },
  methods: {
    back() {
      this.$router.back();
    },
    play() {
      if (this.isPlaying) {
        clearInterval(this.timer);
      } else {
        clearInterval(this.timer);
        this.lineBarMove();
      }
      this.$store.commit("changeStatus", !this.isPlaying);
    },
    lineBarMove() {
      let per = this.currentTime / this.duration;
      if (this.$refs.bar) {
        this.$refs.bar.style.left = per * this.w + "px";
        this.$refs.activeLine.style.width = per * this.w + "px";
        this.$refs.bufferedLine.style.width = 0 + "px";

        this.timer = setInterval(() => {
          //设置缓存条
          if (this.buffered != this.duration) {
            let bPer =
              this.buffered / this.duration >= 1
                ? 1
                : this.buffered / this.duration;
            this.$refs.bufferedLine.style.width = bPer * this.totalW + "px";
          } else {
            this.$refs.bufferedLine.style.width = 1 * this.totalW + "px";
          }

          if (this.isPlaying) {
            this.$store.commit(
              "setCurrentTime",
              1 + parseInt(this.currentTime)
            );
            let per = this.currentTime / this.duration;

            this.$refs.bar.style.left = per * this.w + "px";
            this.$refs.activeLine.style.width = per * this.w + "px";
            if (per >= 1) {
              clearInterval(this.timer);
              this.$refs.bar.style.left = 0 + "px";
              this.$refs.bufferedLine.style.width = 0 + "px";
              this.$refs.activeLine.style.width = 0 + "px";
              this.$store.commit("setCurrentTime", 0);
            }
          }
        }, 1000);
      }
    },
    jump(e) {
      let x = parseInt(e.pageX - this.$refs.line.offsetLeft);
      //计算滑动之后的当前时间
      let currentTime = Math.ceil((x / this.w) * this.duration);
      //同步当前时间
      this.$store.commit("setCurrentTime", currentTime);
      //允许跳跃
      this.$store.commit("jumpStatus", true);
    },
    touchstart(e) {
      this.startLeft = this.$refs.bar.offsetLeft;
      this.x = e.touches[0].pageX;
      //关闭定时器
      clearInterval(this.timer);
    },
    touchmove(e) {
      this.currentX = e.touches[0].pageX;
      let distance = this.currentX - this.x;
      let moveS = this.startLeft + distance;
      moveS = moveS < 0 ? 0 : moveS;
      moveS = moveS > this.w ? this.w : moveS;
      this.$refs.bar.style.left = moveS + "px";
      this.$refs.activeLine.style.width = moveS + "px";

      //计算滑动之后的当前时间
      let currentTime = Math.ceil(
        (this.$refs.bar.offsetLeft / this.w) * this.duration
      );
      //同步当前时间
      this.$store.commit("setCurrentTime", currentTime);
    },
    touchend() {
      this.$store.commit("jumpStatus", true);
      //重启定时器
      clearInterval(this.timer);
      this.lineBarMove();
    },
    pre() {
      clearInterval(this.timer);
      this.lineBarMove();

      this.$store.commit("changeStatus", false);
      this.$store.commit("pNChange", false);
      this.$store.commit("pre");
      this.$refs.bar.style.left = 0 + "px";
      this.$refs.activeLine.style.width = 0 + "px";
      this.$refs.bufferedLine.style.width = 0 + "px";
    },
    next() {
      clearInterval(this.timer);
      this.lineBarMove();

      this.$store.commit("changeStatus", false);

      this.$store.commit("pNChange", true);
      this.$store.commit("next");
      this.$refs.bar.style.left = 0 + "px";
      this.$refs.activeLine.style.width = 0 + "px";
      this.$refs.bufferedLine.style.width = 0 + "px";
    },
    getLyricInfo(id) {
      getLyric(id).then((res) => {
        if (res.lrc) {
          this.lyricFormat(res.lrc.lyric);
        } else {
          this.lyricFormat(null);
        }
      });
    },
    lyricFormat(str) {
      if (str == null) {
        this.lyric = [["", "暂无歌词"]];
      } else {
        let arr = str.split("\n");
        let obj = [];
        arr.forEach((item) => {
          let arr1 = item.split("]");
          let temp = arr1[0].slice(1).split(":");
          temp[0] = Math.floor(Number(temp[0]));
          temp[1] = Math.floor(Number(temp[1]));
          let num = temp[0] * 60 + temp[1];
          arr1[0] = num;
          obj.push(arr1);
        });
        this.lyric = obj;
      }
    },
    changePage() {
      this.page = !this.page;
    },
    watchLyric() {
      if (this.$refs.ul) {
        this.ulHeight = this.ul.offsetHeight;

        for (let i = 0; i < this.lyric.length; i++) {
          if (this.ul.children[i] == undefined) {
            break;
          }
          //当前时间等于歌词时间 并且当前行歌词不是空白 时，增加样式
          if (
            this.$store.state.currentTime ==
              Number(this.ul.children[i].getAttribute("time")) &&
            /\S/.test(this.ul.children[i].innerText)
          ) {
            //清掉前面的歌词的样式
            for (let j = 0; j < this.ul.children.length; j++) {
              this.ul.children[j].className = "";
            }
            this.index = i;
            this.ul.children[i].className = "active";

            if (!this.isMove) {
              this.ul.style.transform = `translateY(${-i * this.lyricMove}px)`;
            }
          }
        }
      }
    },
    animationWatch() {
      let flag = this.$store.state.isPlaying;
      if (this.$refs.img) {
        if (flag) {
          this.$refs.img.style.animationPlayState = "running";
        } else {
          this.$refs.img.style.animationPlayState = "paused";
        }
      }
    },
    changePlayMethod() {
      let num = this.playMethod + 1;
      if (this.playMethod == 2) {
        num = 0;
      }
      this.$store.commit("changePlayMethod", num);
    },
    //开始点击歌词移动
    lyricTouchStart(e) {
      //清除恢复滚动的定时器
      if (this.lyricTimer) {
        clearTimeout(this.lyricTimer);
      }

      //获取点击位置
      this.lStartY = e.touches[0].pageY;

      //获取歌词当前已经自动移动的距离
      let am = getComputedStyle(this.$refs.ul).transform.split(",")[5];
      am = am == undefined ? "0" : am;
      this.alreadyMove = Number(am.replace(")", ""));

      //消除歌词自动滚动效果
      this.isMove = true;
      //取消歌词滚动过渡效果
      this.$refs.ul.style.transition = "0ms";
    },
    //移动歌词
    lyricTouchMove(e) {
      //获取当前移动位置
      this.lCurrentY = e.touches[0].pageY;
      //获取移动位置与初始点击位置之间的距离
      this.lDistance = this.lCurrentY - this.lStartY;

      //设置歌词的移动(歌词已经滚动的距离+滚动后与初始点击的距离)
      this.$refs.ul.style.transform = `translateY(${
        this.alreadyMove + this.lDistance
      }px)`;
    },
    //歌词松手
    lyricTouchEnd(e) {
      //恢复歌词滚动过渡效果
      this.$refs.ul.style.transition = "300ms";

      //当滑动距离超过盒子的50%时，增加适当滑动距离(看起来顺滑点)
      if (this.lDistance > this.$refs.ul.parentNode.offsetHeight * 0.6) {
        this.$refs.ul.style.transform = `translateY(0px)`;
      } else if (
        this.lDistance <
        -this.$refs.ul.parentNode.offsetHeight * 0.6
      ) {
        this.$refs.ul.style.transform = `translateY(${-this.ulHeight}px)`;
      }
      // 滚动超出范围时，回调歌词
      if (this.alreadyMove + this.lDistance > 0) {
        this.$refs.ul.style.transform = `translateY(0px)`;
      } else if (this.alreadyMove + this.lDistance < -this.ulHeight) {
        this.$refs.ul.style.transform = `translateY(${-this.ulHeight}px)`;
      }

      //再次清除恢复滚动的定时器，避免意外！！
      if (this.lyricTimer) {
        clearTimeout(this.lyricTimer);
      }
      //3秒后恢复歌词自动滚动
      this.lyricTimer = setTimeout(() => {
        //恢复歌词自动滚动效果
        this.isMove = false;
      }, 3000);
    },
    //显示评论
    showComment() {
      this.$router.push({
        path: "/comment",
        query: {
          id: this.currentMusic.id,
        },
      });
    },
  },
  filters: {
    numFormat(val) {
      if (val == 0) {
        return "0:00";
      } else {
        val = parseInt(val);
        let m = parseInt(val / 60);
        let s = val % 60;
        s = s < 10 ? "0" + s : s;
        return m + ":" + s;
      }
    },
  },
  watch: {
    "$store.state.canPlay": {
      handler: function (val) {
        if (val == true) {
          clearInterval(this.timer);
          this.$store.commit("changeStatus", false);
          this.$store.commit("changeStatus", true);
          this.lineBarMove();

          //初始歌词滚动

          clearTimeout(this.lyricTimer);

          this.$store.commit("canPlayFlag", false);
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
.play {
  height: 100vh;
  position: relative;

  .mask {
    width: 100vw;
    height: 100vh;
    position: absolute;
    filter: blur(12px);
    background-position: center;
  }
  .mask1 {
    width: 100vw;
    height: 100vh;
    position: absolute;
    z-index: 2;
    background-color: rgb(28, 28, 28);
    opacity: 0.28;
  }
  .box {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    position: relative;
    z-index: 9;
    .header {
      position: relative;
      color: #fff;
      padding: 10px 0;
      height: 1.5rem;
      .back {
        position: absolute;
        left: 18px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.6rem;
        font-weight: 700;
      }
      .music-info {
        text-align: center;
        .music-name {
          font-size: 0.6em;
          font-weight: 700;
          width: 68%;
          margin: 0 auto;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .music-singer {
          font-size: 0.32rem;
          overflow: hidden;
          width: 60%;
          margin: 0 auto;
          white-space: nowrap;
          text-overflow: ellipsis;
          .singers {
            display: inline-block;
            vertical-align: top;
            font-weight: 700;
          }
          .multiple {
            margin: 0 3px;
          }
        }
      }
    }
    .middle {
      flex: 1;
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;

      .show-box {
        opacity: 0;
        transition: 300ms;
      }
      .middle-box {
        width: 100%;
        height: 100%;
        position: relative;
        // display: flex;
        // align-items: center;
        .circle {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          background-color: rgba(255, 255, 255, 0.12);
          width: 8rem;
          height: 8rem;
          margin: 5px auto;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            width: 7.4rem;
            height: 7.4rem;
            border-radius: 50%;
            animation: rotate 12s infinite linear;
          }
        }
        .comment {
          position: absolute;
          width: 0.6rem;
          height: 0.6rem;
          bottom: 0.1rem;
          text-align: center;
          line-height: 0.6rem;
          font-size: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          left: 0;
          right: 0;
          margin: auto;
          .comment-num {
            position: absolute;
            right: -0.2rem;
            top: -0.2rem;
            font-size: 0.1rem;
            z-index: 9;
            color: #fff;
          }
        }
      }

      .lyric-box {
        position: absolute;
        left: 0;
        right: 0;
        width: 80%;
        height: 80%;
        color: rgba(228, 228, 228, 0.8);
        margin: auto;
        overflow: hidden;

        ul {
          text-align: center;
          font-size: 0.4rem;
          position: absolute;
          top: 40%;
          left: 0;
          right: 0;
          margin: auto;
          transition: 300ms;
          li {
            height: 0.6rem;
            margin: 18px 0;
          }
          .active {
            color: #fff;
            font-weight: 700;
            font-size: 0.45rem;
          }
        }
      }
    }
    .bottom {
      height: 4rem;
      .progress {
        height: 60px;
        display: flex;
        align-items: center;
        width: 90%;
        margin: auto;
        font-size: 0.4rem;
        color: rgba(255, 255, 255, 0.68);
        font-size: 0.35rem;
        .start,
        .end {
          width: 1rem;
          text-align: center;
        }
        .line {
          flex: 1;
          height: 5px;
          background-color: #494745;
          position: relative;
          .buffered-line {
            position: absolute;
            height: 5px;
            width: 0;
            background-color: lightgray;
            opacity: 0.6;
          }
          .active-line {
            position: absolute;
            z-index: 2;
            height: 5px;
            width: 0;
            background-color: #D4453A;
          }
          .line-bar {
            width: 16px;
            height: 16px;
            background: #fff;
            border-radius: 50%;
            position: absolute;
            left: 0;
            top: -100%;
            transform: translateY(-2%);
            z-index: 9;
            &::after {
              content: "";
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translateX(-50%) translateY(-50%);
              width: 6px;
              height: 6px;
              background-color: #D4453A;
              border-radius: 50%;
            }
          }
        }
        span {
          margin: 0 10px;
        }
      }
      .controls {
        height: 1.2rem;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        color: rgba(255, 255, 255, 0.95);
        .play-method {
          font-size: 0.8rem;
        }
        .pre,
        .next {
          font-size: 0.6rem;
        }
        .play-btn {
          font-size: 1.1rem;
        }
        .favorite {
          font-size: 0.6rem;
        }
      }
    }
  }
}
</style>