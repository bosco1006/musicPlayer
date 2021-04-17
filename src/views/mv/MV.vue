<template>
  <div class="mv-list">
    <scroll
      ref="scroll"
      class="wrapper"
      :pullUpLoad="true"
      @pullingUp="loadMore"
    >
      <ul>
        <li v-for="(item, index) in mvList" :key="index">
          <div
            class="mask"
            v-show="!item.isShow"
            @click="playVideo(item.id, index)"
          >
            <img :src="item.picUrl" alt="" />
            <div class="icon iconfont icon-bofang"></div>
          </div>
          <div
            class="video-box"
            v-show="item.isShow"
            ref="box"
            @click="showControl"
          >
            <video :src="item.mvUrl" :ref="index + 'video'" />
            <div class="controls" ref="controls">
              <div
                @click="changeStauts"
                class="btn iconfont"
                :class="{
                  'icon-bofang1': !item.isPlaying,
                  'icon-timeout': item.isPlaying,
                }"
              ></div>
              <div class="progress">
                <span class="start">{{ item.currentTime | numFormat }}</span>
                <div class="line" ref="line" @click="jump">
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
                <span class="end">{{ item.duration | numFormat }}</span>
              </div>
              <div
                class="full iconfont icon-extend"
                @click="fullScreen"
                :class="{
                  'icon-extend': !item.full,
                  'icon-MiniMap': item.full,
                }"
              ></div>
            </div>
          </div>
          <p class="name">{{ item.name }}</p>
        </li>
      </ul>
    </scroll>
  </div>
</template>

<script>
import Scroll from "components/common/BScroll/Scroll";

import { getMvList, getMvUrl } from "network/mv.js";
export default {
  name: "MV",
  data() {
    return {
      mvList: [],
      offset: 0,
      currentIndex: null,
    };
  },
  components: {
    Scroll,
  },
  created() {
    this.getMvListData();
  },
  activated() {
    this.$refs.scroll.refresh();
  },
  beforeDestroy() {
    //删除监听器
    if (this.currentIndex) {
      this.$refs[this.currentIndex + "video"][0].removeEventListener(
        "canplay",
        () => {
          //获取进度条长度
          this.w =
            this.$refs.line[this.currentIndex].offsetWidth -
            this.$refs.bar[this.currentIndex].offsetWidth;

          //获取播放时长
          this.mvList[index].duration = Math.ceil(
            this.$refs[index + "video"][0].duration
          );

          clearInterval(this.mvList[this.currentIndex].timer);
          //启动定时器监听当前时长
          this.progressListener();
        }
      );
    }

    //清除监听进度条的定时器
    if (this.currentIndex != null) {
      clearInterval(this.mvList[this.currentIndex].timer);
    }
    if (this.showTimer) {
      clearTimeout(this.showTimer);
    }
  },
  methods: {
    //获取视频基本信息
    getMvListData() {
      getMvList(this.offset).then((res) => {
        res.data.forEach((item) => {
          this.mvList.push({
            id: item.id,
            name: item.name,
            picUrl: item.cover,
            mvUrl: null,
            isShow: false,
            isPlaying: false,
            duration: 0,
            currentTime: 0,
            full: false,
          });
        });
        setTimeout(() => {
          this.$refs.scroll.refresh();
          this.$refs.scroll.finishPullUp();
        }, 20);
      });
    },
    //上拉加载
    loadMore() {
      this.offset++;
      this.getMvListData();
    },
    //获取视频播放地址
    getMvUrlData(id, index) {
      getMvUrl(id).then((res) => {
        //若有视频在播放，则先暂停，再播放当前视频
        if (this.currentIndex != null) {
          this.mvList[this.currentIndex].isShow = false;
          this.mvList[this.currentIndex].isPlaying = false;
          this.$refs[this.currentIndex + "video"][0].pause();
          //删除监听器
          this.$refs[this.currentIndex + "video"][0].removeEventListener(
            "canplay",
            () => {
              //获取进度条长度
              this.w =
                this.$refs.line[this.currentIndex].offsetWidth -
                this.$refs.bar[this.currentIndex].offsetWidth;

              //获取播放时长
              this.mvList[index].duration = Math.ceil(
                this.$refs[index + "video"][0].duration
              );

              clearInterval(this.mvList[this.currentIndex].timer);
              //启动定时器监听当前时长
              this.progressListener();
            }
          );
          //清除监听进度条的定时器
          clearInterval(this.mvList[this.currentIndex].timer);
        }

        //记录当前播放序号
        this.currentIndex = index;
        //给当前点击video修改相应数据
        this.mvList[index].mvUrl = res.data.url;
        this.mvList[index].isShow = true;
        this.mvList[index].isPlaying = true;
        //若音乐在播放，则暂停音乐
        this.$store.commit("changeStatus", false);

        //缓存有延迟，没加载完成会强制暂停，不让播放，所以加个定时器来启动播放
        setTimeout(() => {
          //每次点击都是重新播放
          this.$refs[index + "video"][0].currentTime = 0;
          this.$refs[index + "video"][0].play();
          //增添监听器监听进度
          this.$refs[index + "video"][0].addEventListener("canplay", () => {
            //获取可移动的进度条长度
            this.w =
              this.$refs.line[this.currentIndex].offsetWidth -
              this.$refs.bar[this.currentIndex].offsetWidth;
            this.totalW = this.$refs.line[this.currentIndex].offsetWidth;

            //获取播放时长
            this.mvList[index].duration = Math.ceil(
              this.$refs[index + "video"][0].duration
            );

            clearInterval(this.mvList[this.currentIndex].timer);
            //启动定时器监听当前时长
            this.progressListener();
          });
        }, 20);
      });
    },
    //点击播放音乐
    playVideo(id, index) {
      this.getMvUrlData(id, index);
    },
    //监听播放进度定时器
    progressListener() {
      this.mvList[this.currentIndex].timer = setInterval(() => {
        this.$set(this.mvList[this.currentIndex], "curerntTime");
        this.mvList[this.currentIndex].currentTime++;

        //当前进度百分比
        let per =
          this.mvList[this.currentIndex].currentTime /
          this.mvList[this.currentIndex].duration;

        //计算进度条长度移动
        this.$refs.activeLine[this.currentIndex].style.width =
          per * this.w + "px";
        this.$refs.bar[this.currentIndex].style.left = per * this.w + "px";

        //当播放完之后停止定时器
        if (
          this.mvList[this.currentIndex].currentTime ==
          this.mvList[this.currentIndex].duration
        ) {
          clearInterval(this.mvList[this.currentIndex].timer);
          this.mvList[this.currentIndex].currentTime = 0;
          this.mvList[this.currentIndex].isPlaying = false;
        }
      }, 1000);
    },
    changeStauts() {
      if (this.mvList[this.currentIndex].isPlaying) {
        this.$refs[this.currentIndex + "video"][0].pause();
        this.mvList[this.currentIndex].isPlaying = false;
        //暂停后同时清除监听进度的定时器
        clearInterval(this.mvList[this.currentIndex].timer);
      } else {
        this.$refs[this.currentIndex + "video"][0].play();
        this.mvList[this.currentIndex].isPlaying = true;
        //重新开始定时器
        this.progressListener();
      }
    },
    touchstart(e) {
      this.startLeft = this.$refs.bar[this.currentIndex].offsetLeft;
      this.x = e.touches[0].pageX;
      //关闭定时器
      clearInterval(this.mvList[this.currentIndex].timer);
    },
    touchmove(e) {
      this.currentX = e.touches[0].pageX;
      let distance = this.currentX - this.x;
      let moveS = this.startLeft + distance;

      moveS = moveS < 0 ? 0 : moveS;
      moveS = moveS > this.w ? this.w : moveS;

      this.$refs.bar[this.currentIndex].style.left = moveS + "px";
      this.$refs.activeLine[this.currentIndex].style.width = moveS + "px";

      //计算滑动之后的当前时间
      let currentTime = Math.ceil(
        (this.$refs.bar[this.currentIndex].offsetLeft / this.w) *
          this.$refs[this.currentIndex + "video"][0].duration
      );
      //同步当前时间
      this.mvList[this.currentIndex].currentTime = currentTime;
    },
    touchend() {
      this.$refs[this.currentIndex + "video"][0].currentTime = this.mvList[
        this.currentIndex
      ].currentTime;
      //重启定时器(上面的canPlay监听器已经帮助重新启动)
      //   clearInterval(this.mvList[this.currentIndex].timer);
      //   this.progressListener();
    },
    jump(e) {
      let x = parseInt(e.pageX - this.$refs.line[this.currentIndex].offsetLeft);
      //计算滑动之后的当前时间
      let currentTime = Math.ceil(
        (x / this.totalW) * this.$refs[this.currentIndex + "video"][0].duration
      );
      //清除定时器
      clearInterval(this.mvList[this.currentIndex].timer);
      //同步当前时间
      this.mvList[this.currentIndex].currentTime = currentTime;
      this.$refs[this.currentIndex + "video"][0].currentTime = this.mvList[
        this.currentIndex
      ].currentTime;
    },
    fullScreen() {
      if (!this.mvList[this.currentIndex].full) {
        if (this.$refs.box[this.currentIndex].requestFullscreen) {
          this.$refs.box[this.currentIndex].requestFullscreen();
        } else if (this.$refs.box[this.currentIndex].mozRequestFullScreen) {
          this.$refs.box[this.currentIndex].mozRequestFullScreen();
        } else if (this.$refs.box[this.currentIndex].msRequestFullscreen) {
          this.$refs.box[this.currentIndex].msRequestFullscreen();
        } else if (this.$refs.box[this.currentIndex].oRequestFullscreen) {
          this.$refs.box[this.currentIndex].oRequestFullscreen();
        }
        this.mvList[this.currentIndex].full = true;
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        this.mvList[this.currentIndex].full = false;
      }
      //获取进度条长度
      this.w =
        this.$refs.line[this.currentIndex].offsetWidth -
        this.$refs.bar[this.currentIndex].offsetWidth;
    },
    showControl() {
      if (this.showTimer) {
        clearTimeout(this.showTimer);
      }
      this.$refs.controls[this.currentIndex].style.opacity = "1";
      this.showTimer = setTimeout(() => {
        this.$refs.controls[this.currentIndex].style.opacity = "0";
      }, 3000);
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
};
</script>

<style lang="scss" scoped>
.mv-list {
  position: absolute;
  top: 2.45rem;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #F2F3F4;
  .wrapper {
    height: 100%;
    overflow: hidden;
    ul {
      padding: 20px;
      li {
        position: relative;
        height: 6.8rem;
        .mask {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 5.1rem;

          img {
            width: 100%;
            height: 100%;
          }
          .icon {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateX(-50%) translateY(-50%);
            font-size: 2rem;
            color: rgba(255, 255, 255, 0.68);
          }
          background-color: lightgray;
        }
        .video-box {
          height: 5.1rem;
          position: relative;
          video {
            width: 100%;
            height: 100%;
          }
          .controls {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 1rem;
            background-color: rgba(0, 0, 0, 0.48);
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: rgba(255, 255, 255, 0.8);
            opacity: 0;
            .btn {
              width: 1rem;
              font-size: 0.6rem;
              margin-left: 20px;
            }
            .icon-bofang1 {
              font-size: 0.72rem;
              position: relative;
              left: -0.06rem;
            }
            .progress {
              display: flex;
              align-items: center;
              width: 60%;
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
            }
            .full {
              margin-left: 0.2rem;
              margin-right: 0.6rem;
              font-size: 0.45rem;
            }
          }
        }
        .name {
          position: absolute;
          bottom: 0;
          margin-bottom: 20px;
          font-size: 0.42rem;
        }
      }
    }
  }
}
</style>