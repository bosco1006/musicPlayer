<template>
  <div class="play-list" @touchmove.prevent @click="closeList">
    <div class="container" @click.stop>
      <div class="head">
        <div class="head-left">
          <span
            class="icon iconfont"
            :class="{
              'icon-liebiao3': playMethod === 0,
              'icon-shunxu_danqu_': playMethod === 1,
              'icon-suijibofang': playMethod === 2,
            }"
            @click="changePlayMethod"
          ></span>
          <span
            >{{
              playMethod === 0
                ? "顺序播放"
                : playMethod === 1
                ? "单曲循环"
                : "随机播放"
            }}
            ({{ playList.length }})</span
          >
        </div>
        <div class="head-right">
          <span class="icon iconfont icon-lajitong" @click="delAll"></span>
        </div>
      </div>
      <b-scroll :pullUpLoad="true" class="wrapper" ref="scroll">
        <ul class="list" ref="ul">
          <li
            v-for="(item, index) in playList"
            :key="index"
            @click="play(item)"
            :class="{ active: item.id === currentMusic.id }"
          >
            <div class="title">
              <span
                class="laba iconfont icon-laba"
                v-if="item.id === currentMusic.id"
              ></span
              >{{ item.name }}
            </div>
            <div
              class="icon iconfont icon-guanbi"
              @click.stop="del(item.id)"
            ></div>
          </li>
        </ul>
      </b-scroll>
      <div class="bottom" @click="closeList">关闭</div>
    </div>
  </div>
</template>

<script>
import BScroll from "components/common/BScroll/Scroll";
export default {
  name: "PlayList",
  components: {
    BScroll,
  },
  computed: {
    playList() {
      return this.$store.state.historyMusic;
    },
    currentMusic() {
      return this.$store.state.currentMusic;
    },
    playMethod() {
      return this.$store.state.playMethod;
    },
  },
  methods: {
    play(item) {
      this.$store.commit("playMusic", item);
    },
    del(id) {
      this.$store.commit("delListItem", id);
    },
    delAll() {
      this.$store.commit("delAllList");
    },
    closeList() {
      this.$store.commit("showList", false);
    },
    changePlayMethod() {
      let num = this.playMethod + 1;
      if (this.playMethod == 2) {
        num = 0;
      }
      this.$store.commit("changePlayMethod", num);
    },
  },
  watch: {
    "$store.state.showListStatus": {
      handler(val) {
        if (val === true) {
          this.$refs.scroll.refresh();

          let arr = Array.from(this.$refs.ul.children);

          let ele = arr.find((item) => item.className == "active");
          this.$refs.scroll.scrollToElement(ele);
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.play-list {
  background-color: rgba(0, 0, 0, 0.28);
  width: 100vw;
  height: 1000vh;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 10;
  .container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 12;
    padding: 10px 20px 0px 20px;
    background-color: #F2F3F4;
    border-radius: 8px 8px 0 0;
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 1rem;
      line-height: 1rem;
      .head-left {
        font-size: 0.4rem;
        .icon {
          font-size: 0.5rem;
          margin-right: 12px;
          color: rgba(128, 128, 128, 1);
        }
      }
      .head-right {
        .icon {
          font-size: 0.5rem;
          color: rgba(128, 128, 128, 1);
        }
      }
    }
    .wrapper {
      height: 6rem;
      overflow: hidden;
      .list {
        overflow: hidden;
        li {
          font-size: 0.38rem;
          height: 1rem;
          line-height: 1rem;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(228, 228, 228, 1);
          &:last-child {
            border-bottom: none;
          }
          .title {
            width: 90%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .laba {
            font-size: 0.4rem;
            color: #D95348;
            margin-right: 4px;
          }
          .icon {
            font-size: 0.4rem;
            font-weight: 700;
            color: #D95348;
          }
        }
      }
    }

    .bottom {
      height: 1rem;
      font-size: 0.4rem;
      line-height: 1rem;
      text-align: center;
    }
  }
}
</style>