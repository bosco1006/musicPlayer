<template>
  <scroll :pullUpLoad="true" class="wrapper" ref="scroll">
    <div
      class="recommend"
      :class="{
        'drag-up':
          this.$store.state.currentMusic &&
          this.$store.state.currentMusic.id != '',
      }"
    >
      <div class="banner">
        <div class="content">
          <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
            <van-swipe-item v-for="(item, index) in banners" :key="index"
              ><img :src="item.imageUrl" alt=""
            /></van-swipe-item>
          </van-swipe>
        </div>
      </div>

      <div class="logo-block">
        <ul>
          <li v-for="(item, index) in logo.slice(0, 3)" @click="goLogo(index)">
            <div class="img">
              <div class="date" v-if="index === 0">{{ today }}</div>
              <img :src="item.iconUrl" alt="" />
            </div>
            <p>{{ item.name }}</p>
          </li>
        </ul>
      </div>

      <div class="recommend-list">
        <h4 class="title">推荐歌单</h4>
        <ul>
          <grid-view>
            <li
              v-for="(item, index) in musicList"
              :key="index"
              @click="goToDetail(item.id)"
            >
              <div class="img"><img :src="item.picUrl" /></div>

              <div class="num">
                <span class="erji iconfont icon-erji"></span>
                {{ item.playcount | numFix }}
              </div>
              <p class="title">{{ item.name }}</p>
            </li>
          </grid-view>
        </ul>
      </div>
      <div class="new-music">
        <h4 class="title">最新音乐</h4>
        <ul class="music-list">
          <li
            v-for="(item, index) in newMusic"
            :key="index"
            @click="play(item)"
          >
            <p class="music-name">
              {{ item.name }}
              <span>{{
                item.song.alias[0] ? "(" + item.song.alias[0] + ")" : ""
              }}</span>
            </p>
            <p class="music-singer">
              {{ item.song.album.artists[0].name }} - {{ item.name }}
            </p>
            <div class="play iconfont icon-bofang1"></div>
          </li>
        </ul>
      </div>
    </div>
  </scroll>
</template>

<script>
import GridView from "components/common/gridView/GridView.vue";
import Scroll from "components/common/BScroll/Scroll";
import {
  getBanner,
  getMusicList,
  getNewMusic,
  getLogo,
} from "network/recommend.js";

export default {
  name: "Recommend",
  components: {
    GridView,
    Scroll,
  },
  data() {
    return {
      banners: [],
      newMusic: [],
      musicList: [],
      logo: [],
    };
  },
  created() {
    this.getBannerData();
    this.getMusicListData();
    this.getNewMusicData();
    this.getLogoData();
  },
  activated() {
    this.$refs.scroll.refresh();
  },
  computed: {
    today() {
      let date = new Date();
      let day = date.getDate();
      day = day < 10 ? "0" + day : day;
      return day;
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
  methods: {
    //获取轮播图
    getBannerData() {
      getBanner().then((res) => {
        this.banners = res.banners;
        this.$refs.scroll.refresh();
      });
    },
    //获取推荐歌单信息
    getMusicListData() {
      getMusicList().then((res) => {
        this.musicList = res.recommend;
        console.log(this.musicList);
        setTimeout(() => {
          this.$refs.scroll.refresh();
        }, 88);
      });
    },
    //获取最新音乐信息
    getNewMusicData() {
      getNewMusic().then((res) => {
        this.newMusic = res.result;
        setTimeout(() => {
          this.$refs.scroll.refresh();
        }, 88);
      });
    },
    //进入歌单
    goToDetail(id) {
      this.$router.push({
        path: "/musiclist",
        query: {
          id,
        },
      });
    },
    //播放音乐
    play(item) {
      let list = [];
      console.log(item);
      this.newMusic.forEach((item) => {
        list.push({
          id: item.id,
          name: item.name,
          singer: item.song.artists,
          pic: item.picUrl,
        });
      });
      this.$store.commit("putMusicList", list);

      this.$store.commit("playMusic", {
        id: item.id,
        name: item.name,
        singer: item.song.artists,
        pic: item.picUrl,
      });
      localStorage.setItem(
        "currentMusic",
        JSON.stringify({
          id: item.id,
          name: item.name,
          singer: item.song.artists,
          pic: item.picUrl,
        })
      );
      localStorage.setItem("musicList", JSON.stringify([...list]));
    },
    //获取logo
    getLogoData() {
      getLogo().then((res) => {
        this.logo = res.data;
        setTimeout(() => {
          this.$refs.scroll.refresh();
        }, 88);
      });
    },
    //跳转到对应logo的页面
    goLogo(index) {
      let p = index === 0 ? "/daymusicrecommend" : "/";

      this.$router.push({
        path: p,
      });
    },
  },
};
</script>



<style lang="scss" scoped>
.wrapper {
  position: absolute;
  top: 2.45rem;
  left: 0;
  right: 0;
  bottom: 1.5rem;
  overflow: hidden;
}
.drag-up {
  // padding-bottom: 1.5rem;
}
.recommend {
  width: 100%;

  h4 {
    width: 96%;
    margin: 0 auto;
    color: #000;
    font-size: 0.5rem;
  }
  .banner {
    height: 4rem;
    background-color: #EE5034;
    margin-bottom: 1rem;
    .content {
      width: calc(10rem - 40px);
      height: 4.5rem;
      margin: 0 auto;
      border-radius: 4px;
      overflow: hidden;
      .my-swipe {
        img {
          width: 100%;
          height: 4.5rem;
          vertical-align: top;
          // object-fit: cover;
        }
      }
    }
  }
  .logo-block {
    padding-bottom: 0.3rem;
    margin-bottom: 0.4rem;
    border-bottom: 1px solid rgba(236, 236, 236, 0.8);
    ul {
      padding: 0 0.2rem;

      display: flex;
      justify-content: space-evenly;
      li {
        text-align: center;
        .img {
          margin: 0 auto;
          width: 1.2rem;
          height: 1.2rem;
          background-color: #FFF0F2;
          border-radius: 50%;
          position: relative;
          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #EE5034;
          }
          .date {
            position: absolute;
            left: 49%;
            top: 44%;
            font-size: 0.1rem;
            font-weight: 700;
            width: 0.4rem;
            height: 0.4rem;
            color: #EE5034;
            transform: translateX(-50%);
          }
        }
        p {
          margin-top: 0.15rem;
          font-size: 0.36rem;
        }
      }
    }
  }
  .recommend-list {
    margin-bottom: 0.625rem;
    ul {
      margin-top: 0.3125rem;
      li {
        position: relative;
        .img {
          width: 100%;
          height: 3rem;
          overflow: hidden;
          img {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 4px;
            object-fit: cover;
          }
        }
        .num {
          position: absolute;
          right: 6px;
          top: 6px;
          font-size: 0.2rem;
          color: rgba(255, 255, 255, 0.92);
          .erji {
            font-size: 0.15rem;
          }
        }
        .title {
          margin-top: 0.1875rem;
          font-size: 0.4rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }
  }
  .new-music {
    ul {
      padding-top: 10px;
      width: 94%;
      margin: 0 auto;
      li {
        border-bottom: 1px solid rgba(236, 236, 236, 1);
        position: relative;
        .music-name {
          font-size: 0.45rem;
          margin-top: 0.2rem;
          margin-bottom: 0.1rem;
          overflow: hidden;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 0.9375rem;
          span {
            color: rgba(168, 168, 168, 1);
          }
        }
        .music-singer {
          font-size: 0.35rem;
          margin-bottom: 0.15625rem;
          color: rgba(168, 168, 168, 1);
        }
        .play {
          position: absolute;
          right: 0.1875rem;
          top: 0;
          bottom: 0;
          margin: auto;
          width: 0.68rem;
          height: 0.68rem;
          font-size: 0.58rem;
          color: rgba(168, 168, 168, 1);
        }
      }
    }
  }
}
</style>