<template>
  <div class="search">
      <div class="header">
        <div class="back iconfont icon-qianjinhoutui" @click="back"></div>
        <input type="text" class="search-inp" :placeholder="defaultSearch" v-model="text" @input="getSuggestInfo" @keyup.enter="goSearch" @focus="getDefault"/>

      </div>
      <div class="page-one" v-show="!page"  :class="{currentPage:!page}">
      <div class="bottom">
    <scroll ref="scrollOne" class="wrapper-one" :pullUpLoad="true">
        <div>
        <div class="hot-search">
          <h5>热门搜索</h5>
          <div class="hot-search-list">
            <span v-for="(item,index) in hotSearch" :key="index" @click="pickSearch(item)">{{item.first}}</span>
           
          </div>
        </div>
        <div class="serach-history">
          <h5>
            <span>搜索历史</span
            ><span class="del-all iconfont icon-lajitong" @click="delAllHistory"></span>
          </h5>
          <ul>
            <li v-for="(item,index) in searchHistory" :key="index" @click="pickSearch(item)">
              <span>{{item}}</span><span class="del iconfont icon-guanbi" @click.stop="delHistory(index)"></span>
            </li>
           
          </ul>
        </div>
    </div>
    </scroll>
      </div>
      </div>
      <div class="page-two" v-show="page" :class="{currentPage:page}">
          <div class="bottom">
             <scroll :pullUpLoad="true" ref="scrollTwo" class="wrapper-two">
              <div>
              <ul>
                  <li v-show="matchSinger" class="match-singer" @click="goToDetail(matchSinger.id)">
                      <h5>最佳匹配</h5>
                        <div class="info">
                            <img :src="matchSinger.picUrl" alt="">
                            <p>歌手：{{matchSinger.name}}</p>
                        </div>
                  </li>
              </ul>
             
              <ul>
                  <li v-for="(item,index) in searchInfo" :key="index" @click="play(item)">
                      <p class="name">{{item.name}}</p>
                      <p class="singer"><span v-for="(aitem,aindex) in item.ar">{{aitem.name}}</span></p>
                  </li> 
              </ul>
              </div>
              </scroll>
          </div>
      </div>
      <div class="page-three" v-show="inputing">
          <scroll :pullUpLoad="true" class="wrapper">
          <ul>
              <li class="first" @click="pickSearch(text)">搜索 “{{text}}”</li>
              <li v-for="(item,index) in suggest" @click="pickSearch(item)"><span class="icon iconfont icon-sousuo"></span>{{item}}</li>
             
          </ul>
          </scroll>
      </div>
    </div>
  </div>
</template>

<script>
import Scroll from "components/common/BScroll/Scroll";
import {
  getHotSearch,
  getSearchDefault,
  getSeachInfo,
  getSearchSingers,
  getSuggest,
} from "network/search.js";
export default {
  name: "Search",
  data() {
    return {
      page: false,
      hotSearch: [],
      defaultSearch: "",
      text: "",
      searchInfo: [],
      searchHistory: [],
      inputing: false,
      suggest: [],
      matchSinger: false,
    };
  },
  components: {
    Scroll,
  },
  created() {
    this.getHotSearchData();
    this.getSearchDefaultData();
    if (localStorage.getItem("searchHistory")) {
      this.searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    }
  },

  methods: {
    back() {
      this.$router.back();
    },
    getHotSearchData() {
      getHotSearch().then((res) => {
        this.hotSearch = res.result.hots;
      });
    },
    getSearchDefaultData() {
      getSearchDefault().then((res) => {
        this.defaultSearch = res.data.realkeyword;
      });
    },
    getSearchInfoData(key) {
      getSeachInfo(key).then((res) => {
        this.searchInfo = [];
        this.page = true;
        res.result.songs.forEach((item) => {
          this.searchInfo.push({
            id: item.id,
            name: item.name,
            picUrl: item.al.picUrl,
            ar: item.ar,
          });
        });

        //搜索历史,将搜索过的词条存入LocalStorage
        let index = this.searchHistory.findIndex((item) => item == key);
        if (index < 0) {
          this.searchHistory.push(key);
        } else {
          this.searchHistory.splice(index, 1);
          this.searchHistory.unshift(key);
        }
        localStorage.setItem(
          "searchHistory",
          JSON.stringify(this.searchHistory)
        );

        //刷新Scroll
        setTimeout(() => {
          this.$refs.scrollTwo.refresh();
        }, 20);
      });

      getSearchSingers(key).then((res) => {
        this.matchSinger = false;
        if (res.result.artist) {
          this.matchSinger = {
            id: res.result.artist[0].id,
            name: res.result.artist[0].name,
            picUrl: res.result.artist[0].picUrl,
          };
        }
      });
    },
    goSearch() {
      this.getSearchInfoData(this.text);
      this.inputing = false;
    },
    delAllHistory() {
      localStorage.removeItem("searchHistory");
      this.searchHistory = [];
    },
    delHistory(index) {
      this.searchHistory.splice(index, 1);
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },
    pickSearch(item) {
      if (item.first) {
        this.getSearchInfoData(item.first);
        this.text = item.first;
      } else {
        this.getSearchInfoData(item);
        this.text = item;
      }
      this.inputing = false;
    },
    play(item) {
      console.log(item);

      this.$store.commit("playMusic", {
        id: item.id,
        name: item.name,
        singer: item.ar,
        pic: item.picUrl,
      });
    },
    getSuggestInfo(e) {
      if (this.text == "") {
        this.inputing = false;
      } else {
        this.inputing = true;
      }
      if (this.inputTimer) {
        clearTimeout(this.inputTimer);
      }
      this.inputTimer = setTimeout(() => {
        getSuggest(this.text).then((res) => {
          this.suggest = [];
          console.log(res.result);
          for (let arr in res.result) {
            res.result[arr].forEach((item) => {
              if (item.name != undefined) {
                this.suggest.push(item.name);
              }
            });
          }
          this.suggest = [...new Set(this.suggest)];
        });
      }, 300);
    },
    getDefault() {
      if (this.text == "") {
        this.text = this.defaultSearch;
        this.getSuggestInfo();
      }
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
  watch: {
    page(val) {
      if (val) {
        this.$refs.scrollTwo.refresh();
      } else {
        this.$refs.scrollOne.refresh();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.search {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .header {
    height: 1.25rem;
    background-color: #EE5034;
    display: flex;
    align-items: center;
    .back {
      width: 1.2rem;
      color: #fff;
      font-size: 0.6rem;
      font-weight: 700;
      text-align: center;
    }
    .search-inp {
      background-color: #EE5034;
      outline: none;
      border: none;
      border-bottom: 1px solid #fff;
      width: 80%;
      height: 0.8rem;
      line-height: 1rem;
      font-size: 0.4rem;
      color: #fff;
    }
  }
  .page-one {
    flex: 1;
    .bottom {
      height: 100%;
      background-color: #F2F3F4;

      .wrapper-one {
        position: absolute;
        left: 0;
        top: 1.25rem;
        right: 0;
        bottom: 1.5rem;
        padding: 0 20px 20px 20px;
        overflow: hidden;
        margin-top: 20px;
      }
      h5 {
        font-size: 0.34rem;
        font-weight: 400;
        color: rgba(118, 118, 118, 0.8);
        margin-bottom: 12px;
      }
      .hot-search {
        margin-bottom: 10px;
        .hot-search-list {
          span {
            font-size: 0.38rem;
            display: inline-block;
            border-radius: 4px;
            padding: 4px;
            margin-right: 10px;
            border: 1px solid rgba(168, 168, 168, 0.8);
            vertical-align: top;
          }
        }
      }
      .serach-history {
        h5 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          .del-all {
            font-size: 0.46rem;
            font-weight: 700;
          }
        }
        ul {
          li {
            display: flex;
            justify-content: space-between;
            font-size: 0.39rem;
            height: 0.86rem;
            line-height: 0.86rem;
            .del {
              font-size: 0.48rem;
              font-weight: 700;
            }
          }
        }
      }
    }
  }
  .page-two {
    flex: 1;
    .bottom {
      height: 100%;
      background-color: #F2F3F4;
      position: relative;
      .wrapper-two {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 1.5rem;
        overflow: hidden;
        ul {
          width: 100%;
          .match-singer {
            h5 {
              font-size: 0.32rem;
              color: #EE5034;
              margin-bottom: 10px;
            }
            .info {
              display: flex;
              align-items: center;
              img {
                width: 1.6rem;
                height: 1.6rem;
                margin-right: 18px;
              }
              font-size: 0.4rem;
            }
          }
          li {
            padding: 8px 16px 6px 16px;
            border-bottom: 1px solid rgba(218, 218, 218, 0.8);
            .name {
              font-size: 0.42rem;
              margin-bottom: 6px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .singer {
              font-size: 0.25rem;
              color: rgba(168, 168, 168, 1);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              span {
                display: inline-block;
                margin-right: 6px;
              }
            }
          }
        }
      }
    }
  }
  .page-three {
    position: absolute;
    top: 1.25rem;
    bottom: 1.5rem;
    left: 0;
    right: 0;
    background-color: #fff;
    z-index: 9;
    .wrapper {
      height: 100%;
      overflow: hidden;
      ul {
        margin-top: 10px;
        padding: 0 16px;
        font-size: 0.42rem;
        .first {
          color: rgb(118, 118, 196);
        }
        li {
          height: 1.2rem;
          line-height: 1.2rem;
          border-bottom: 1px solid rgba(218, 218, 218, 0.8);
          .icon {
            font-size: 0.52rem;
            vertical-align: middle;
          }
        }
      }
    }
  }
}
</style>