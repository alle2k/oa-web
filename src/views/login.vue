<template>
  <div
    style="
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    "
  >
    <BubblesBg class="size-full" :blur="4">
      <div class="flex size-full flex-col items-center justify-center">
        <span
          class="font-heading text-6xl font-bold text-background opacity-80 backdrop-blur-md"
          v-show="!clickFlag"
        >
          BoEdge
        </span>
        <div class="login" v-show="clickFlag">
          <el-form
            ref="loginRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
          >
            <h3 class="title">登录</h3>
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                type="text"
                size="large"
                auto-complete="off"
                placeholder="账号"
              >
                <template #prefix
                  ><svg-icon
                    icon-class="user"
                    class="el-input__icon input-icon"
                /></template>
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                size="large"
                auto-complete="off"
                placeholder="密码"
                @keyup.enter="handleLogin"
              >
                <template #prefix
                  ><svg-icon
                    icon-class="password"
                    class="el-input__icon input-icon"
                /></template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <div id="recaptcha-container" />
            </el-form-item>

            <el-form-item prop="code" v-if="captchaEnabled">
              <el-input
                v-model="loginForm.code"
                size="large"
                auto-complete="off"
                placeholder="验证码"
                style="width: 63%"
                @keyup.enter="handleLogin"
              >
                <template #prefix
                  ><svg-icon
                    icon-class="validCode"
                    class="el-input__icon input-icon"
                /></template>
              </el-input>
              <div class="login-code">
                <img :src="codeUrl" @click="getCode" class="login-code-img" />
              </div>
            </el-form-item>
            <el-checkbox
              v-model="loginForm.rememberMe"
              style="margin: 0px 0px 25px 0px"
              >记住密码</el-checkbox
            >
            <el-form-item style="width: 100%">
              <el-button
                :loading="loading"
                size="large"
                type="primary"
                style="width: 100%"
                @click.prevent="handleLogin"
              >
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
              <div style="float: right" v-if="register">
                <router-link class="link-type" :to="'/register'"
                  >立即注册</router-link
                >
              </div>
            </el-form-item>
          </el-form>
          <!--  底部  -->
          <div class="el-login-footer">
            <span>Copyright © 2018-2025 zhaokai.xyz All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </BubblesBg>
  </div>
</template>

<script setup>
import '@/output1.css'
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from "@/store/modules/user";
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const loginForm = ref({
  username: "",
  password: "",
  rememberMe: false,
  code: "",
  uuid: "",
  recaptcha: null,
});

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  // code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(false);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);
//
const clickFlag = ref(false);

watch(
  route,
  (newRoute) => {
    redirect.value = newRoute.query && newRoute.query.redirect;
  },
  { immediate: true }
);

function handleLogin() {
  proxy.$refs.loginRef.validate((valid) => {
    if (valid) {
      grecaptcha.render("recaptcha-container", {
        sitekey: "6LfqEDoqAAAAADeMHzO5Cq5jncJrrsWbkEWLyQtW",
        callback: (token) => {
          loginForm.value.recaptcha = token;
          loading.value = true;
          // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
          if (loginForm.value.rememberMe) {
            Cookies.set("username", loginForm.value.username, { expires: 30 });
            Cookies.set("password", encrypt(loginForm.value.password), {
              expires: 30,
            });
            Cookies.set("rememberMe", loginForm.value.rememberMe, {
              expires: 30,
            });
          } else {
            // 否则移除
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberMe");
          }
          // 调用action的登录方法
          userStore
            .login(loginForm.value)
            .then(() => {
              const query = route.query;
              const otherQueryParams = Object.keys(query).reduce((acc, cur) => {
                if (cur !== "redirect") {
                  acc[cur] = query[cur];
                }
                return acc;
              }, {});
              router.push({
                path: redirect.value || "/",
                query: otherQueryParams,
              });
            })
            .catch(() => {
              loading.value = false;
              // 重新获取验证码
              if (captchaEnabled.value) {
                getCode();
              }
              grecaptcha.reset();
            });
        },
      });
    }
  });
}

function getCode() {
  getCodeImg().then((res) => {
    captchaEnabled.value =
      res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password:
      password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
  };
}

const handleClick = (event) => {
  if (event.button === 0) {
    // 左键点击
    clickFlag.value = true;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClick);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClick);
});

// getCode();
getCookie();
</script>

<style lang='scss' scoped>
.login {
  display: flex;
  justify-content: center;
  opacity: 0.9;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
