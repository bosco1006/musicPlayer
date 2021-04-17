<template>
  <div class="header-nav">
    <div class="header">
      <div class="header-left iconfont icon-yonghu" @click="goToMyself"></div>
      <div class="header-center">网抑云</div>
      <div class="header-right iconfont icon-sousuo" @click="goSearch"></div>
    </div>
    <div class="nav">
      <ul>
        <li v-for="(item, index) in navList" @click="change(index, item)">
          <span :class="{ active: currentIndex === index }">{{
            item.title
          }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "HeaderNav",

  data() {
    return {
      navList: [
        { title: "推荐", link: "/" },
        { title: "排行", link: "/rank" },
        { title: "歌手", link: "/singer" },
        { title: "MV", link: "/mv" },
      ],
    };
  },
  computed: {
    currentIndex() {
      return this.$route.path == "/"
        ? 0
        : this.$route.path == "/rank"
        ? 1
        : this.$route.path == "/singer"
        ? 2
        : 3;
    },
  },
  methods: {
    change(index, item) {
      //   this.currentIndex = index;
      this.$router.push({ path: item.link });
    },
    goSearch() {
      this.$router.push({ path: "/search" });
    },
    goToMyself() {
      this.$router.push({ path: "/myself" });
    },
  },
};
</script>

 <style lang="scss" scoped>
.header-nav {
  .header {
    display: flex;
    height: 1.25rem;
    background-color: #EE5034;
    text-align: center;
    align-items: center;
    color: #fff;
    .header-left {
      width: 1.5rem;
      font-size: 0.65rem;
    }
    .header-center {
      flex: 1;
      font-size: 0.55rem;
    }
    .header-right {
      width: 1.5rem;
      font-size: 0.65rem;
    }
  }
  .nav {
    padding-bottom: 0.1875rem;
    background-color: #EE5034;
    height: 1.2rem;
    ul {
      display: flex;

      height: 1rem;
      text-align: center;
      align-items: center;
      color: #fff;
      font-size: 0.4rem;
      li {
        flex: 1;
        .active {
          border-bottom: 2px solid #fff;
        }
        span {
          padding: 0.09375rem 0;
        }
      }
    }
  }
}
</style>