<template>
  <scroll class="wrapper" ref="scroll" :pullUpLoad="true">
    <div class="rank">
      <div>
        <h4>官方榜</h4>
        <ul class="list">
          <li
            v-for="(item, index) in rank.slice(0, 4)"
            :key="index"
            @click="goToDetail(item.id)"
          >
            <div class="list-left">
              <img class="img" :src="item.coverImgUrl" />
            </div>
            <div class="list-right">
              <p v-for="(titem, tindex) in item.tracks" :key="tindex">
                {{ tindex + 1 }}. {{ titem.first }} - {{ titem.second }}
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div class="global-rank">
        <h4 class="title">全球榜</h4>
        <ul>
          <grid-view>
            <li
              v-for="(item, index) in rank.slice(4)"
              :key="index"
              @click="goToDetail(item.id)"
            >
              <div class="img">
                <img :src="item.coverImgUrl" />
              </div>

              <div class="num">
                <span class="erji iconfont icon-erji"></span>
                {{ item.playCount | numFix }}
              </div>
              <p class="title">{{ item.name }}</p>
            </li>
          </grid-view>
        </ul>
      </div>
    </div>
  </scroll>
</template>

<script>
import { getRank } from "network/rank.js";
import GridView from "components/common/gridView/GridView.vue";
import Scroll from "components/common/BScroll/Scroll";
export default {
  name: "Rank",
  data() {
    return {
      rank: [],
    };
  },
  components: {
    GridView,
    Scroll,
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
  created() {
    this.getRankData();
  },
  activated() {
    this.$refs.scroll.refresh();
  },
  methods: {
    getRankData() {
      getRank().then((res) => {
        this.rank = res.list;
        setTimeout(() => {
          this.$refs.scroll.refresh();
        }, 88);
      });
    },
    goToDetail(id) {
      this.$router.push({
        path: "/ranklist",
        query: {
          id,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.wrapper {
  position: absolute;
  top: 2.45rem;
  bottom: 1.5rem;
  left: 0;
  right: 0;
  overflow: hidden;
}
.rank {
  padding: 10px 0;

  h4 {
    color: #000;
    padding: 0 0.25rem;
    font-size: 0.5rem;
  }
  .list {
    padding: 0.25rem;
    padding-bottom: 0.15625rem;

    li {
      &:last-child {
        border-bottom: none;
      }
      display: flex;
      border-bottom: 1px solid rgba(236, 236, 236, 1);
      padding-bottom: 0.15625rem;
      margin-bottom: 0.15625rem;
      .list-left {
        width: 2.8rem;
        height: 2.8rem;
        .img {
          width: 2.8rem;
          height: 2.8rem;
          display: block;
        }
      }
      .list-right {
        flex: 1;
        margin-left: 0.625rem;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        overflow: hidden;
        font-size: 0.4rem;
        p {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
  .global-rank {
    h4 {
      margin-bottom: 0.09375rem;
    }
    ul {
      // margin-top: 0.3125rem;
      li {
        position: relative;
        .img {
          width: 100%;
          height: 3rem;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
            display: block;
            border-radius: 4px;
            object-fit: cover;
          }
        }
        .num {
          position: absolute;
          right: 8px;
          top: 8px;
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
}
</style>