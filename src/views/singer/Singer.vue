<template>
  <div
    class="singer"
    :class="{
      'drag-up':
        this.$store.state.currentMusic &&
        this.$store.state.currentMusic.id != '',
    }"
  >
    <b-scroll
      :pullUpLoad="true"
      :probeType="3"
      ref="scroll"
      class="wrapper"
      @pullingUp="loadMore"
      @scroll="scrollListener"
    >
      <div>
        <div class="list">
          <h5>热门歌手</h5>
          <ul>
            <li
              v-for="(item, index) in hotSingers"
              :key="index"
              @click="goToDetail(item.id)"
            >
              <img :src="item.picUrl" alt="" />
              <span>{{ item.name }}</span>
            </li>
          </ul>
        </div>
        <div
          class="list"
          v-if="item.data.length != 0"
          v-for="(item, index) in singers"
          :key="index"
        >
          <h5>{{ item.name }}</h5>
          <ul>
            <li
              v-for="(ditem, dindex) in item.data"
              :key="dindex"
              @click="goToDetail(ditem.id)"
            >
              <img :src="ditem.picUrl" alt="" />
              <span>{{ ditem.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </b-scroll>
    <div class="fix-right" ref="right">
      <ul>
        <li
          v-for="(item, index) in sortList"
          :class="{ active: index === currentIndex }"
          @click="jumpTo(index)"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getHotSinger, getSingers } from "network/singer.js";
import BScroll from "components/common/BScroll/Scroll.vue";
export default {
  name: "Singer",
  data() {
    return {
      index: 1,
      currentIndex: 0,
      left: {},
      sortList: [
        "热",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ],
      hotSingers: [],
      singers: [],
      listHeight: [],
    };
  },
  components: {
    BScroll,
  },
  created() {
    this.initSingersList();
    this.getHotSingerData();
    this.getSingersData();
  },
  activated() {
    this.$refs.scroll.refresh();
  },
  destroyed() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },
  methods: {
    getHotSingerData() {
      getHotSinger().then((res) => {
        this.hotSingers = [];
        console.log(res);
        res.artists.forEach((item) => {
          this.hotSingers.push({
            id: item.id,
            name: item.name,
            picUrl: item.picUrl,
          });
        });
      });
    },

    getSingersData() {
      for (let i = 1; i < this.sortList.length; i++) {
        getSingers(this.sortList[i]).then((res) => {
          let arr = [];
          res.artists.forEach((item) => {
            arr.push({
              id: item.id,
              name: item.name,
              picUrl: item.picUrl,
            });
          });
          this.$set(this.singers[i - 1], "data", arr);

          let lists = document.querySelector(".list");
          this.listHeight.push(lists.offsetHeight * i);

          //防止退出了还在刷新
          if (this.$route.path == "/singer") {
            this.$refs.scroll.refresh();
          }
          if (i == 26) {
            this.timer = setTimeout(() => {
              this.listHeight.push(lists.offsetHeight * (i + 1));
              //防止退出了还在刷新
              if (this.$route.path == "/singer") {
                this.$refs.scroll.refresh();
              }
            }, 500);
          }
        });
      }
    },

    loadMore() {
      // if (this.index <= 26) {
      //   this.getSingersData();
      // }
      // this.$refs.scroll.refresh();
    },
    scrollListener(pos) {
      for (let i = 0; i < this.listHeight.length; i++) {
        if (Math.abs(pos.y) <= this.listHeight[i] - 20) {
          this.currentIndex = i;
          break;
        }
      }
    },
    initSingersList() {
      for (let i = 1; i < this.sortList.length; i++) {
        this.singers.push({
          name: this.sortList[i],
          data: [],
        });
      }
    },
    jumpTo(index) {
      let lists = document.querySelectorAll(".list");
      this.$refs.scroll.scrollToElement(lists[index], 300);
    },
    goToDetail(id) {
      this.$router.push({
        path: "/singermusiclist",
        query: {
          id,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.drag-up {
  padding-bottom: 1.5rem;
}
.singer {
  background-color: #F2F3F4;
  width: 100%;

  .wrapper {
    overflow: hidden;
    height: calc(100vh - 3.95rem);
  }

  .list {
    h5 {
      background-color: #D9DADB;
      color: #fff;
      text-indent: 0.3125rem;
      font-weight: 700;
      font-size: 0.4rem;
      height: 0.6rem;
      line-height: 0.6rem;
    }
    ul {
      background-color: #F2F3F4;
      li {
        padding: 0.12rem;
        border-bottom: 1px solid rgba(218, 218, 218, 1);
        height: 1.45rem;
        img {
          width: 1.2rem;
          height: 1.2rem;
          border-radius: 4px;
          object-fit: cover;
          vertical-align: middle;
        }
        span {
          font-size: 0.35rem;
          font-weight: 600;
          margin-left: 0.5rem;
          position: relative;
          top: -0.02rem;
        }
      }
    }
  }
  .fix-right {
    position: fixed;
    right: 0.28125rem;
    top: 3rem;
    font-size: 0.35rem;
    font-weight: 700;
    text-align: center;
    .active {
      color: #EE5034;
    }
    li {
      margin: 0.1rem 0;
    }
  }
}
</style>