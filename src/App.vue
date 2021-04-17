<template>
  <div id="app">
    <div class="main">
      <header-nav
        class="header-nav"
        v-show="!$route.meta.headFlag"
      ></header-nav>
      <keep-alive exclude="Singer,MV,Search,MusicList,RankList,SingerMusicList">
        <router-view></router-view>
      </keep-alive>
      <bottom-bar
        v-show="!$route.meta.bottomFlag && $store.state.userInfo.id"
      ></bottom-bar>
      <play-list v-show="showList"></play-list>
    </div>
  </div>
</template>

<script>
import PlayList from "components/self/bottomBar/childComps/playList/PlayList";
import HeaderNav from "components/self/HeaderNav/HeaderNav";
import BottomBar from "components/self/bottomBar/BottomBar";
export default {
  name: "App",
  components: {
    HeaderNav,
    BottomBar,
    PlayList,
  },
  created() {
    if (sessionStorage.getItem("user")) {
      let user = JSON.parse(sessionStorage.getItem("user"));
      console.log(user);
      this.$store.commit("saveUserInfo", user);
      console.log(this.$store.state.userInfo);
    }
  },
  computed: {
    showList() {
      return this.$store.state.showListStatus;
    },
    user() {
      if (sessionStorage.getItem("user")) {
        let user = JSON.parse(sessionStorage.getItem("user"));
        this.$store.commit("saveUserInfo", user);
        return user;
      } else {
        return {};
      }
    },
  },
};
</script>

<style lang="scss">
@import "assets/css/base.css";
html,
body,
#app {
  width: 100%;
  height: 100%;
  position: relative;
  // z-index: 99;
  // background-color: green;
}
</style>
