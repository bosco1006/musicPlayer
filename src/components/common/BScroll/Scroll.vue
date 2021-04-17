<template>
  <div class="wrapper" ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
import BScroll from "better-scroll";

export default {
  name: "Scroll",
  props: {
    probeType: {
      type: Number,
      default: 1,
    },
    data: {
      type: Array,
      default: () => {
        return [];
      },
    },
    pullUpLoad: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      scroll: {},
    };
  },
  mounted() {
    setTimeout(this.__initScroll, 20);
  },
  updated() {
    // this.upDatedImg();
  },
  methods: {
    __initScroll() {
      // 1.初始化BScroll对象
      if (!this.$refs.wrapper) return;
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: true,
        pullUpLoad: this.pullUpLoad,
      });

      // 2.将监听事件回调
      this.scroll.on("scroll", (pos) => {
        this.$emit("scroll", pos);
      });

      // 3.监听上拉到底部
      this.scroll.on("pullingUp", () => {
        // console.log("上拉加载");
        this.$emit("pullingUp");
      });
    },
    refresh() {
      this.scroll && this.scroll.refresh && this.scroll.refresh();
    },
    finishPullUp() {
      this.scroll && this.scroll.finishPullUp && this.scroll.finishPullUp();
    },
    scrollTo(x, y, time) {
      this.scroll && this.scroll.scrollTo && this.scroll.scrollTo(x, y, time);
    },
    upDatedImg() {
      //解决better-scroll因为图片没有下载完导致的滚动条高度不够，无法浏览全部内容的问题。
      //原因是better-scroll初始化是在dom加载后执行，此时图片没有下载完成，导致滚动条高度计算不准确。
      //利用图片的complete属性进行判断，当所有图片下载完成后再对scroll重新计算。
      if (this.timer) {
        clearInterval(this.timer);
      }
      let img = this.$refs.wrapper.getElementsByTagName("img");
      let count = 0;
      let length = img.length;
      if (length) {
        this.timer = setInterval(() => {
          if (count == length) {
            this.scroll.refresh(); //bs提供的刷新的方法，详见官网
            clearInterval(this.timer);
          } else if (img[count].complete) {
            count++;
          }
        }, 100);
      }
    },
    scrollToElement(ele, time = 0) {
      this.scroll &&
        this.scroll.scrollToElement &&
        this.scroll.scrollToElement(ele, time);
    },
  },
  // watch: {
  //   // data(val) {
  //   //   this.timer = setTimeout(this.refresh, 20);
  //   // },
  // },
};
</script>

<style scoped>
.content {
  padding: 0;
}
</style>
