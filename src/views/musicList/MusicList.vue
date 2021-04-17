<template>
  <div class="music-list">
    <div class="head">
      <div class="back" @click="back">
        <span class="iconfont icon-qianjinhoutui btn"></span>
        <span class="btn-name">歌单</span>
      </div>

      <img :src="picImg" alt="" />
      <div class="list-name">
        <p>{{ this.listName }}</p>
        <p class="num">
          <span class="erji iconfont icon-erji"></span>{{ playCount | numFix }}
        </p>
      </div>
    </div>
    <div
      class="content"
      :class="{
        'drag-up':
          this.$store.state.currentMusic &&
          this.$store.state.currentMusic.id != '',
      }"
    >
      <div class="play-all" @click="play()">
        <span class="play iconfont icon-bofang1"></span>播放全部<span
          class="length"
        >
          (共{{ music.length }}首)</span
        >
      </div>
      <scroll ref="scroll" class="wrapper" :pullUpLoad="true">
        <ul>
          <li v-for="(item, index) in music" @click="play(item, index)">
            <div class="num">{{ index + 1 }}</div>
            <div class="music">
              <p class="music-name">
                <span>{{ item.name }}</span>
                <span class="second-name" v-if="item.alia[0]"
                  >({{ item.alia[0] }})</span
                >
              </p>
              <p class="music-singer">
                <span v-for="(item, index) in item.ar">
                  {{ item.name }}
                </span>
              </p>
            </div>
          </li>
        </ul>
      </scroll>
    </div>
  </div>
</template>

<script>
import Scroll from "components/common/BScroll/Scroll";
import { getDetailMusicList, getSongDetail } from "network/recommend.js";
export default {
  name: "MusicList",
  data() {
    return {
      picImg: "",
      listName: "",
      playCount: 0,
      music: [],
    };
  },
  created() {
    this.getDetailMusicListData(this.$route.query.id);
  },
  activated() {
    this.$refs.scroll.refresh();
  },
  components: {
    Scroll,
  },
  computed: {
    // listId() {
    //   this.getDetailMusicListData(this.$route.query.id);
    //   return this.$route.query.id;
    // },
  },
  methods: {
    getDetailMusicListData(id) {
      getDetailMusicList(id).then((res) => {
        this.picImg = res.playlist.coverImgUrl;
        this.listName = res.playlist.name;
        this.playCount = res.playlist.playCount;
        let ids = [];
        res.playlist.trackIds.forEach((item) => {
          ids.push(item.id);
        });
        this.$refs.scroll.refresh();
        //根据trackIds歌曲id获取每一首歌的数据
        getSongDetail(ids.join(",")).then((res) => {
          this.music = res.songs;
          setTimeout(() => {
            this.$refs.scroll.refresh();
          }, 88);
        });
      });
    },
    back() {
      this.$router.back();
    },
    play(item, index) {
      let list = [];
      this.music.forEach((item) => {
        list.push({
          id: item.id,
          name: item.name,
          singer: item.ar,
          pic: item.al.picUrl,
        });
      });
      this.$store.commit("putMusicList", list);
      if (item == undefined) {
        this.$store.commit("playMusic", list[0]);
        localStorage.setItem("currentMusic", JSON.stringify(list[0]));
      } else {
        this.$store.commit("playMusic", list[index]);
        localStorage.setItem("currentMusic", JSON.stringify(list[index]));
      }

      localStorage.setItem("musicList", JSON.stringify([...list]));
    },
  },
  filters: {
    numFix(val) {
      if (val > 100000000) {
        return (val / 100000000).toFixed(1) + "亿";
      } else if (val > 10000) {
        return (val / 10000).toFixed(1) + "万";
      } else {
        return val;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.music-list {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #F2F3F4;
  .head {
    position: relative;
    height: 7.6rem;
    color: #fff;
    img {
      width: 100%;
    }
    .back {
      position: absolute;
      top: 0.25rem;
      left: 0.35rem;
      font-size: 0.45rem;
      .btn {
        font-size: 0.45rem;
        margin-right: 8px;
        font-weight: 700;
      }
    }
    .list-name {
      position: absolute;
      bottom: 30px;
      left: 20px;
      font-size: 0.5rem;
      padding: 0 20px 0 0;
      font-weight: 700;
      .num {
        margin-top: 8px;
        font-size: 0.35rem;
        .erji {
          font-size: 0.25rem;
          margin-right: 5px;
        }
      }
    }
  }
  .drag-up {
    // padding-bottom: 1.5rem;
  }
  .content {
    position: relative;
    top: -20px;
    background-color: #F2F3F4;
    border-radius: 20px 20px 0 0;
    font-size: 0.45rem;

    .play-all {
      padding: 10px 0;
      border-bottom: 1px solid rgb(222, 222, 222);
      height: 1rem;
      .play {
        font-size: 0.5rem;
        color: #111;
        margin-left: 0.3rem;
        margin-right: 16px;
      }
      .length {
        color: rgb(128, 128, 128);
        font-size: 0.4rem;
      }
    }
    .wrapper {
      height: 8.1rem;
      overflow: hidden;
    }
    ul {
      li {
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgb(222, 222, 222);
        padding: 7px;
        .num {
          // width: 35px;
          width: 0.8rem;
          text-align: center;
        }
        .music {
          margin-left: 10px;
          overflow: hidden;
          flex: 1;
          .music-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            .second-name {
              margin-left: 10px;
              color: #999;
            }
          }
          .music-singer {
            font-size: 0.35rem;
            margin-top: 4px;
            color: #999;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            span {
              display: inline-block;
              margin-right: 5px;
            }
          }
        }
      }
    }
  }
}
</style>