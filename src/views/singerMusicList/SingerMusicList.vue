<template>
  <div class="singer-music-list">
    <!-- <div class="music-list">
      <div class="head">
        <div class="back" @click="back">
          <span class="iconfont icon-arrow-left-bold btn"></span>
          <span class="btn-name">歌手</span>
        </div>

        <img :src="picImg" alt="" />
        <div class="list-name">
          <p>{{ this.listName }}</p>
        </div>
      </div>
      <div class="content">
        <div class="play-all">播放全部</div>
        <ul>
          <li v-for="(item, index) in music">
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
      </div>
    </div> -->
    <div class="music-list">
      <div class="head">
        <div class="back" @click="back">
          <span class="iconfont icon-qianjinhoutui btn"></span>
          <span class="btn-name">歌手</span>
        </div>

        <img :src="picImg" alt="" />
        <div class="list-name">
          <p>{{ this.listName }}</p>
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
  </div>
</template>

<script>
import Scroll from "components/common/BScroll/Scroll";
import { getSingerMuisc } from "network/singer.js";
export default {
  name: "SingerMusicList",
  data() {
    return {
      picImg: "",
      listName: "",
      music: [],
    };
  },
  components: {
    Scroll,
  },
  created() {
    this.getSingerMuiscData(this.$route.query.id);
  },
  activated() {
    this.$refs.scroll.refresh();
  },
  methods: {
    getSingerMuiscData(id) {
      getSingerMuisc(id).then((res) => {
        this.picImg = res.artist.picUrl;
        this.listName = res.artist.name;
        this.music = res.hotSongs;
        setTimeout(() => {
          this.$refs.scroll.refresh();
        }, 88);
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
    }
  }
  .drag-up {
    padding-bottom: 1.5rem;
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
      .play {
        font-size: 0.5rem;
        color: #111;
        margin-left: 12px;
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
          width: 35px;
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