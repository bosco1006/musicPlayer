<template>
  <div class="comment">
    <div class="header">
      <div
        class="nav-left iconfont icon-qianjinhoutui back"
        @click="back"
      ></div>
      <div class="nav-center">评论({{ comments.length }})</div>
      <div class="nav-right"></div>
    </div>

    <scroll
      :pullUpLoad="true"
      :probeType="3"
      ref="scroll"
      class="wrapper"
      @pullingUp="loadMore"
    >
      <div class="content-box">
        <div class="music">
          <img :src="currentMusic.pic" alt="" class="music-img" />
          <div class="music-info">
            <p class="name">{{ currentMusic.name }}</p>
            <p class="singer">
              <span
                @click="goToSingerMusicList(item.id)"
                v-for="(item, index) in currentMusic.singer"
                >{{ item.name }}</span
              >
            </p>
          </div>
        </div>
        <div class="comments">
          <h5>评论区</h5>
          <ul>
            <li v-for="(item, index) in comments">
              <img :src="item.avator" alt="" />
              <div class="info">
                <p class="name">{{ item.name }}</p>
                <p class="time">{{ item.time | timeFormat }}</p>
                <p class="content">{{ item.content }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </scroll>
  </div>
</template>

<script>
import Scroll from "components/common/BScroll/Scroll";
import { getComment } from "network/play.js";
export default {
  name: "Comment",

  data() {
    return {
      comments: [],
      offset: 1,
      timer: {},
    };
  },
  components: {
    Scroll,
  },
  activated() {
    //若条件符合，进来时就开始计时
    if (this.$store.state.isPlaying) {
      let currentTime = this.$store.state.currentTime;
      this.timer = setInterval(() => {
        this.$store.commit("setCurrentTime", ++currentTime);
      }, 1000);
    }
  },
  deactivated() {
    clearInterval(this.timer);
  },
  computed: {
    currentMusic() {
      this.offset = 1;
      this.comments = [];
      this.getCommentData(this.$store.state.currentMusic.id, 1);
      return this.$store.state.currentMusic;
    },
    canPlay() {
      this.offset = 1;
      this.comments = [];
      return this.$store.state.canPlay;
    },
  },
  methods: {
    back() {
      // this.$router.push({ path: "/" });
      this.$router.back();
    },
    goToSingerMusicList(id) {
      this.$router.push({
        path: "/singermusiclist",
        query: {
          id,
        },
      });
    },
    getCommentData(id, offset) {
      getComment(id, offset).then((res) => {
        res.comments.forEach((item, index) => {
          this.comments.push({
            name: item.user.nickname,
            avator: item.user.avatarUrl,
            content: item.content,
            time: item.time,
          });
        });
        setTimeout(() => {
          this.$refs.scroll.refresh();
        }, 100);
        setTimeout(() => {
          this.$refs.scroll.finishPullUp();
        }, 2000);
      });
    },
    loadMore() {
      this.getCommentData(this.$store.state.currentMusic.id, ++this.offset);
    },
  },
  filters: {
    timeFormat(val) {
      let time = new Date(val);
      let year = time.getFullYear();
      let month = time.getMonth();
      let day = time.getDate();
      let s = year + "年" + month + "月" + day + "日";
      return s;
    },
  },
};
</script>
<style lang="scss" scoped>
.comment {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  padding-top: 1.25rem;
  .wrapper {
    position: absolute;
    top: 1.25rem;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #EFEFEF;
    overflow: hidden;
  }
  .header {
    height: 1.25rem;
    line-height: 1.25rem;
    text-align: center;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    background-color: #fff;
    color: #111;
    .nav-left,
    .nav-right {
      width: 60px;
    }
    .nav-center {
      color: #111;
      flex: 1;
      font-size: 0.4rem;
      letter-spacing: 2px;
    }
    .back {
      font-size: 0.68rem;
    }
  }
  .music {
    padding: 0.4rem;
    display: flex;
    height: 2.8rem;
    background-color: #fff;
    .music-img {
      width: 2rem;
      height: 2rem;
      border-radius: 4px;
    }
    .music-info {
      flex: 1;
      overflow: hidden;
      margin-left: 0.3rem;
      .name {
        margin-top: 0.4rem;
        margin-bottom: 0.2rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.48rem;
        color: #111;
      }
      .singer {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.32rem;
        color: #778fc0;
        span {
          display: inline-block;
          margin-right: 0.1rem;
        }
      }
    }
  }
  .comments {
    background-color: #fff;
    border-top: 0.3rem solid #EFEFEF;
    padding: 0.4rem;
    h5 {
      font-size: 0.44rem;
      font-weight: 600;
      color: #111;
    }
    ul {
      li {
        display: flex;
        padding-top: 0.4rem;
        &:last-child {
          .info {
            border-bottom: none;
          }
        }
        img {
          width: 1.1rem;
          height: 1.1rem;
          border-radius: 50%;
        }
        .info {
          flex: 1;
          overflow: hidden;
          margin-left: 0.4rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid rgba(236, 236, 236, 0.8);

          .name {
            font-size: 0.42rem;
          }
          .time {
            margin-top: 0.1rem;
            font-size: 0.28rem;
            color: #999;
          }
          .content {
            margin-top: 0.2rem;
            font-size: 0.42rem;
          }
        }
      }
    }
  }
}
</style>