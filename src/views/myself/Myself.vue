<template>
  <div class="myself">
    <div class="header">
      <div
        v-if="user.id"
        class="nav-left iconfont icon-qianjinhoutui back"
        @click="back"
      ></div>
      <div class="nav-center" v-if="user.id">{{ user.name }}</div>
      <div class="nav-right"></div>
    </div>
    <div class="content">
      <div class="page-one" v-if="!user.id">
        <div class="login-box">
          <h3>欢迎登录</h3>
          <div class="phone">
            <span class="icon iconfont icon-shouji"></span>
            <input
              type="text"
              class="phone-number"
              v-model="phone"
              placeholder="请输入手机号"
            />
          </div>
          <div class="code">
            <span class="icon iconfont icon-mima"></span>
            <input
              type="password"
              class="phone-number"
              v-model="password"
              placeholder="请输入密码"
              @keyup.enter="login"
            />
          </div>
          <div class="login" @click="login">登录</div>
        </div>
      </div>
      <div class="page-two" v-if="user.id">
        <scroll :pullUpLoad="true" class="wrapper" ref="scroll">
          <div class="content-box">
            <div class="bg">
              <img :src="user.backgroundUrl" alt="" />
            </div>

            <div class="move-box">
              <div class="user-info">
                <img class="avator" :src="user.avatorUrl" alt="" />
                <div class="name-level">
                  <p class="name">{{ user.name }}</p>
                  <p class="level">
                    <span>{{ user.follows }} </span>关注<span
                      >{{ user.followeds }} </span
                    >粉丝<span>Lv.{{ user.level }}</span>
                  </p>
                  <p class="signature">{{ user.signature }}</p>
                </div>
              </div>

              <div class="base-info">
                <h6>基本信息</h6>
                <p>
                  <span>村龄：</span
                  >{{ user.createDays | createDaysFormat }}年（{{
                    user.createTime | createTimeFormat
                  }}注册）
                </p>
                <p><span>性别：</span>{{ user.gender | genderFormat }}</p>
                <p><span>生日：</span>{{ user.birthday | createTimeFormat }}</p>
              </div>

              <div class="music-list">
                <ul>
                  <li
                    v-for="(item, index) in myFavoriteMusic"
                    :key="index"
                    @click="goToDetail(item.id)"
                  >
                    <img :src="item.picUrl" alt="" />
                    <div class="list-info">
                      <p class="name">我喜欢的音乐</p>
                      <p class="count">{{ item.count }}首</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div class="music-list">
                <div class="title">
                  创建的歌单<span>({{ createMusic.length }}个)</span>
                </div>
                <ul>
                  <li
                    v-for="(item, index) in createMusic"
                    :key="index"
                    @click="goToDetail(item.id)"
                  >
                    <img :src="item.picUrl" alt="" />
                    <div class="list-info">
                      <p class="name">{{ item.name }}</p>
                      <p class="count">{{ item.count }}首</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div class="music-list">
                <div class="title">
                  收藏的歌单<span>({{ favoritesMusic.length }}个)</span>
                </div>
                <ul>
                  <li
                    v-for="(item, index) in favoritesMusic"
                    :key="index"
                    @click="goToDetail(item.id)"
                  >
                    <img :src="item.picUrl" alt="" />
                    <div class="list-info">
                      <p class="name">{{ item.name }}</p>
                      <p class="count">{{ item.count }}首</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div class="logout" @click="quit">退出登录</div>
            </div>
          </div>
        </scroll>
      </div>
    </div>
  </div>
</template>

<script>
import { Notify } from "vant";
import Scroll from "components/common/BScroll/Scroll";

import {
  loginAccount,
  getUserDetailInfo,
  getUserMusicList,
  logOut,
} from "network/myself.js";
export default {
  name: "Myself",

  data() {
    return {
      phone: "",
      password: "",
      getCodeStatus: false,
      musicList: [],
    };
  },
  components: {
    Scroll,
    [Notify.Component.name]: Notify.Component,
  },
  computed: {
    user() {
      if (
        this.$store.state.userInfo.id == undefined &&
        sessionStorage.getItem("user")
      ) {
        let user = sessionStorage.getItem("user");
        this.$store.commit("saveUserInfo", JSON.parse(user));

        //请求用户音乐列表
        this.musicList = this.getUserMusicListData(
          this.$store.state.userInfo.id
        );

        return this.$store.state.userInfo;
      } else if (this.$store.state.userInfo.id) {
        //请求用户音乐列表
        this.musicList = this.getUserMusicListData(
          this.$store.state.userInfo.id
        );
        return this.$store.state.userInfo;
      } else {
        return {};
      }
    },
    //我喜欢音乐的歌单
    myFavoriteMusic() {
      if (this.musicList) {
        return this.musicList.filter((item) => item.specialType === 5);
      } else {
        return [];
      }
    },
    //创建音乐歌单
    createMusic() {
      if (this.musicList) {
        return this.musicList.filter(
          (item) =>
            item.specialType != 5 &&
            item.creatorId === this.$store.state.userInfo.id
        );
      } else {
        return [];
      }
    },
    //收藏歌单
    favoritesMusic() {
      if (this.musicList) {
        return this.musicList.filter(
          (item) =>
            item.specialType != 5 &&
            item.creatorId != this.$store.state.userInfo.id
        );
      } else {
        return [];
      }
    },
  },
  activated() {},
  deactivated() {
    this.phone = "";
    this.password = "";
  },
  beforeDestroy() {
    this.quit();
  },
  methods: {
    back() {
      this.$router.back();
    },
    login() {
      if (this.phone != "" && this.password != "") {
        loginAccount(this.phone, this.password).then(
          (res) => {
            //若输入账号密码错误,返回
            if (!res.profile) {
              Notify({ type: "warning", message: "请输入正确的手机号密码!" });
              return;
            }
            //保存用户登录cookie
            localStorage.setItem("userCookie", res.cookie);

            //获取用户详细信息
            getUserDetailInfo(res.profile.userId).then((res) => {
              let user = {
                id: res.profile.userId,
                name: res.profile.nickname,
                signature: res.profile.signature, //个人简介
                gender: res.profile.gender, //性别：男1
                birthday: res.profile.birthday, //生日时间戳，直接转年月日
                avatorUrl: res.profile.avatarUrl,
                level: res.level,
                backgroundUrl: res.profile.backgroundUrl,
                followeds: res.profile.followeds,
                follows: res.profile.follows,
                createTime: res.createTime,
                createDays: res.createDays,
              };
              //储存登录后的用户信息
              this.$store.commit("saveUserInfo", user);
              sessionStorage.setItem("user", JSON.stringify(user));
              //登录后直接获取用户歌单
              this.getUserMusicListData(res.profile.userId);
              //清空表单
              this.phone = "";
              this.password = "";
            });
          },
          (err) => {
            Notify({ type: "warning", message: "请输入正确的手机号密码!" });
          }
        );
      } else {
        Notify({ type: "warning", message: "手机号或密码不能为空!" });
      }
    },
    //获取歌单
    getUserMusicListData(id) {
      let cookie = localStorage.getItem("userCookie");
      getUserMusicList(cookie, id).then((res) => {
        this.musicList = [];
        res.playlist.forEach((item) => {
          this.musicList.push({
            id: item.id,
            name: item.name,
            picUrl: item.coverImgUrl,
            count: item.trackCount,
            specialType: item.specialType,
            creatorId: item.creator.userId,
          });
        });
        console.log(this.musicList);
        setTimeout(() => {
          this.$refs.scroll.refresh();
        }, 20);
      });
    },
    quit() {
      logOut().then((res) => {
        this.$store.commit("saveUserInfo", {});
        sessionStorage.removeItem("user");
        this.$store.commit("changeStatus", false);
      });
    },
    goToDetail(id) {
      this.$router.push({
        path: "/musicList",
        query: {
          id,
        },
      });
    },
  },
  filters: {
    createDaysFormat(val) {
      return parseInt(val / 365);
    },
    createTimeFormat(val) {
      let date = new Date(val);
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      let d = date.getDate();
      return y + "年" + m + "月" + d + "日";
    },
    genderFormat(val) {
      if (val == 0) {
        return "女";
      } else {
        return "男";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.myself {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #EE5034;
  .header {
    height: 1.25rem;
    background-color: #fff;
    line-height: 1.25rem;
    text-align: center;
    z-index: 8;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;

    color: #111;
    .nav-left,
    .nav-right {
      width: 60px;
    }
    .nav-center {
      flex: 1;
      font-size: 0.4rem;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .back {
      font-size: 0.68rem;
      color: #111;
    }
  }
  .content {
    position: absolute;
    top: 0rem;
    left: 0;
    right: 0;
    bottom: 0rem;
    background-color: #EE5034;

    .page-one {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      background: #EE5034;
      z-index: 9;
      .login-box {
        width: 92%;
        overflow: hidden;
        input::-webkit-input-placeholder {
          color: rgba(0, 0, 0, 0.2);
        }
        input::-moz-input-placeholder {
          color: rgba(0, 0, 0, 0.2);
        }
        input::-ms-input-placeholder {
          color: rgba(0, 0, 0, 0.2);
        }
        h3 {
          color: #fff;
          text-align: center;
          margin-bottom: 2rem;
          position: absolute;
          top: 2rem;
          left: 0;
          right: 0;
        }
        .icon {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 1);
        }
        span {
          display: inline-block;
        }
        input {
          border: none;
          outline: none;
          background-color: transparent;
        }
        .phone,
        .code {
          height: 1rem;
          // border-bottom: 1px solid rgba(188, 188, 188, 1);
          background-color: rgba(255, 255, 255, 0.68);
          border-radius: 0.6rem;
          padding-left: 0.6rem;
          margin-top: 0.4rem;
          display: flex;
          align-items: center;
          color: rgba(255, 255, 255, 1);
          .phone-number {
            width: 78%;
            height: 100%;
            margin-left: 0.1rem;
            font-size: 0.54rem;
          }
          .get-code {
            width: 28%;
            text-align: center;
            margin-left: 20px;
            font-size: 0.36rem;
            padding: 4px 10px;
            border-radius: 20px;
          }
        }
        .code {
          .icon {
            font-size: 0.48rem;
            margin-left: 0.1rem;
          }
          .phone-number {
            margin-left: 0.15rem;
            width: 78%;
          }
        }
        .login {
          font-size: 0.5rem;
          color: #fff;
          background-color: rgba(255, 255, 255, 0.68);
          outline: none;
          border: none;
          width: 60%;
          height: 1rem;
          text-align: center;
          line-height: 1rem;
          border-radius: 40px;
          margin: 0.8rem auto;
        }
      }
    }
    .page-two {
      width: 100%;
      height: 100%;
      background-color: #F7F7F7;

      .wrapper {
        position: absolute;
        top: 1.25rem;
        bottom: 1.5rem;
        left: 0;
        right: 0;
        overflow: hidden;

        .content-box {
          margin-bottom: 1.5rem;
        }
        .bg {
          height: 6rem;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        .move-box {
          position: relative;
          top: -0.5rem;
          .user-info {
            margin: 0 20px;

            height: 3.2rem;
            background: #fff;
            border-radius: 8px;
            position: relative;
            z-index: 6;
            .avator {
              position: absolute;
              top: -36%;
              left: 50%;
              transform: translateX(-50%);
              width: 2rem;
              height: 2rem;
              border-radius: 50%;
              border: 4px solid #fff;
            }
            .name-level {
              padding-top: 1rem;
              text-align: center;
              .name {
                color: #111;
                font-size: 0.48rem;
                font-weight: 700;
              }
              .level {
                margin-top: 0.2rem;
                font-size: 0.32rem;
                color: #888;
                span {
                  margin-right: 0.1rem;
                  margin-left: 0.3rem;
                  color: #333;
                }
              }
              .signature {
                margin-top: 0.2rem;
                font-size: 0.38rem;
                color: #888;
              }
            }
          }
          .base-info {
            background-color: #fff;
            margin: 0.4rem 20px 0;
            border-radius: 8px;
            padding: 0.4rem;
            h6 {
              font-size: 0.46rem;
              color: #111;
              margin-bottom: 0.3rem;
            }
            p {
              font-size: 0.38rem;
              margin-top: 0.2rem;
              color: #5E5E5E;
              span {
                color: #858585;
              }
            }
          }
          .music-list {
            margin: 0.4rem 20px 0;
            background-color: #fff;
            border-radius: 8px;
            padding: 0.4rem;
            .title {
              font-size: 0.46rem;
              color: #111;
              font-weight: 700;
              margin-bottom: 0.2rem;
              span {
                margin-left: 0.1rem;
                font-size: 0.36rem;
                color: #999;
                font-weight: 400;
              }
            }
            ul {
              li {
                display: flex;
                margin-bottom: 0.2rem;
                padding-bottom: 0.2rem;
                border-bottom: 1px solid #F7F7F7;
                &:last-child {
                  margin-bottom: 0rem;
                  padding-bottom: 0rem;
                  border: none;
                }
                img {
                  width: 1.2rem;
                  height: 1.2rem;
                  border-radius: 8px;
                }
                .list-info {
                  flex: 1;
                  margin-left: 0.4rem;
                  padding: 0.1rem 0;
                  overflow: hidden;
                  .name {
                    width: 100%;
                    font-size: 0.4rem;
                    margin-bottom: 0.1rem;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                  }
                  .count {
                    font-size: 0.32rem;
                    color: #999;
                  }
                }
              }
            }
          }
          .logout {
            border-radius: 8px;
            margin: 0.4rem;

            text-align: center;
            line-height: 1rem;
            height: 1rem;
            background-color: #fff;
            font-size: 0.4rem;
            color: red;
          }
        }
      }
    }
  }
}
</style>