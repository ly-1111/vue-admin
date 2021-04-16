<template>
  <div id="login">
    <!-- 内容区域 -->
    <div class="login-wrap">
      <ul class="menu-tab">
        <li
          :class="{ current: item.current }"
          v-for="item in menuTab"
          :key="item.id"
          @click="toggleMneu(item)"
        >
          {{ item.txt }}
        </li>
      </ul>
      <!-- 表单验证 -->
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="loginForm"
        size="medium"
        class="login-form"
      >
        <el-form-item prop="username" class="item-form">
          <label for="username">邮箱</label>
          <el-input
            id="username"
            type="text"
            v-model="ruleForm.username"
            autocomplete="off"
          ></el-input>
        </el-form-item>

        <el-form-item prop="password" class="item-form">
          <label for="password">密码</label>
          <el-input
            id="password"
            type="text"
            v-model="ruleForm.password"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item
          prop="passwords"
          class="item-form"
          v-show="model === 'register'"
        >
          <label>重复密码</label>
          <el-input
            type="text"
            v-model="ruleForm.passwords"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item prop="code" class="item-form">
          <label>验证码</label>
          <el-row :gutter="10">
            <el-col :span="15">
              <el-input
                v-model="ruleForm.code"
                minlength="6"
                maxlength="6"
              ></el-input>
            </el-col>
            <el-col :span="9">
              <el-button
                type="success"
                class="block"
                @click="getSms()"
                :disabled="codeButtonStatus.status"
                >{{ codeButtonStatus.text }}</el-button
              >
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item>
          <el-button
            type="danger"
            @click="submitForm('loginForm')"
            class="block login-btn"
            :disabled="loginButtonStatus"
            >{{ model === "login" ? "登录" : "注册" }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
import sha1 from "js-sha1";
import { GetSms, Register, Login } from "../../api/login.js";
import { onMounted, reactive, ref, isRef, toRefs } from "@vue/composition-api";
import {
  stripscript,
  validateEmail,
  validatePass,
  valueCode,
} from "/src/utils/validate.js";
// import {stripscript} from '../../utils/validate.js'
export default {
  name: "login",
  /*setup(props,context){
    3.0方法       2.0方法
    attrde:(...)==this.$attrs
    emit:(...)==this.$emit
    listeners:(...)==this.$listeners
    parent:(...)==this.$parent
    refs:(...)==this.$refs
    root:(...)==this.$root
  }*/
  setup(props, { refs, root }) {
    //账户验证
    let validateUsername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入用户名"));
      } else if (validateEmail(value)) {
        callback(new Error("用户名格式有误"));
      } else {
        callback();
      }
    };
    //密码验证
    let validatePassword = (rule, value, callback) => {
      //过滤特殊字符,过滤后的数据
      ruleForm.password = stripscript(value);

      value = ruleForm.password;

      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (validatePass(value)) {
        callback(new Error("密码为6~20位数字+字母"));
      } else {
        callback();
      }
    };

    //密码重复验证
    let validatePasswords = (rule, value, callback) => {
      //如果当模块值为login的时候直接通过
      if (model.value === "login") {
        callback();
      }

      //过滤特殊字符,过滤后的数据
      ruleForm.passwords = stripscript(value);
      value = ruleForm.passwords;
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value != ruleForm.password) {
        callback(new Error("密码不一致"));
      } else {
        callback();
      }
    };

    //验证码验证
    var validateCode = (rule, value, callback) => {
      ruleForm.code = stripscript(value);
      value = ruleForm.code;
      console.log(value);

      if (value === "") {
        return callback(new Error("请输入验证码"));
      } else if (valueCode(value)) {
        return callback(new Error("验证码格式有误"));
      } else {
        callback();
      }
    };

    /**
     * 声明数据
     */
    //这里面放置data数据、生命周期、自定义的函数
    const menuTab = reactive([
      { txt: "登入", current: true, type: "login" },
      { txt: "注册", current: false, type: "register" },
    ]);

    //模块值
    const model = ref("login");
    //登入按钮禁用状态
    const loginButtonStatus = ref(true); //
    //验证码按钮禁用状态
    const codeButtonStatus = reactive({
      status: false,
      text: "获取验证码",
    });
    // const codeButtonStatus = ref(false);
    // const codeButtonText = ref("获取验证码");
    //倒计时、
    const timer = ref(null);
    /**表单绑定数据 */
    const ruleForm = reactive({
      username: "",
      password: "",
      passwords: "",
      code: "",
    });
    //表单的验证
    const rules = reactive({
      username: [{ validator: validateUsername, trigger: "blur" }],
      password: [{ validator: validatePassword, trigger: "blur" }],
      passwords: [{ validator: validatePasswords, trigger: "blur" }],
      code: [{ validator: validateCode, trigger: "blur" }],
    });
    /**
     * 不建议再一个方法里面做多件不同的事件
     */

    /**
     * 声明函数
     */
    //切换模块
    const toggleMneu = (data) => {
      menuTab.forEach((elem, index) => {
        elem.current = false;
      });
      //高光的跳动，点击谁就再谁身上
      data.current = true;
      //修改模块值
      model.value = data.type;
      resetFromData();
      clearCountDown();
    };
    //清除表单数据
    const resetFromData = () => {
      //重置表单
      // this.$refs[formName].resetFields();//2.0的写法
      refs.loginForm.resetFields(); //3.0方法
    };
    //更新按钮的状态
    const updataButtonStatus =((params) => {
      codeButtonStatus.status = params.status;
      codeButtonStatus.text = params.text;
    });
    /**
     * 获取验证码
     */
    const getSms = (() => {
      //进行提示
      console.log(ruleForm.username);
      if (ruleForm.username == "") {
        root.$message.error("邮箱不能为空");
        return false;
      } else if (validateEmail(ruleForm.username)) {
        root.$message.error("邮箱格式有误，请重新输入！！");
        return false;
      }

      //获取验证码
      let requestDate = {
        username: ruleForm.username,
        module: model.value,
      };
      //修该验证码的状态
      updataButtonStatus({
        status: true,
        text: "发送中",
      });

      // codeButtonStatus.value = true;
      // codeButtonText.value = "发送中";

      // 刚才你是这样写的 GetSms({ requestDate }).then(response=>{
      // 相当于往后台发了一个对象  {requestDate： {username：'', module: ''}}
      // 但是应该发一个这样的对象  {username：'', module: ''}

      //延时多长时间
      console.log(111);
      GetSms(requestDate)
        .then((response) => {
          let data = response.data;
          root.$message({
            message: data.message,
            type: "success",
          });
          //启用登录/注册按钮
          loginButtonStatus.value = false;
          //调定时器，倒计时
          countDown(60);
          codeButtonStatus.status = true;
        })
        .catch((error) => {
          console.log(error);
        });
    });
    /**
     * 提交表单
     */

    const submitForm = (formName) => {
      refs[formName].validate((valid) => {
        //表单验证通过
        if (valid) {
          model.value === "login" ? login() : register();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    };
    /**
     * 登录
     */
    const login = () => {
      let repuestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.password),
        code: ruleForm.code,
      };
      Login(repuestData)
        .then((response) => {
          console.log("登入成功");
          console.log(response);
        })
        .catch((error) => {});
    };
    /**
     * 注册
     */

    const register = () => {
      let resultData = {
        username: ruleForm.username,
        password: sha1(ruleForm.password),
        code: ruleForm.code,
        model: "register",
      };
      //注册接口
      Register(resultData)
        .then((response) => {
          let data = response.dataroot.$message({
            message: data.message,
            typa: "success",
          });
          //模拟注册成功
          toggleMneu(menuTab[0]);
          clearCountDown();
        })
        .catch((error) => {
          //失败时执行的代码
        });
    };
    /**
     * 倒计时
     */
    const countDown = (number) => {
      //判断定时器是否存在，存在就清除
      if (timer.value) {
        clearInterval(timer.value);
        console.log(222);
      }
      //60和0不见了，故意留BUG
      //setTimeout:clearTimeuot(变量) 只执行一次
      //setInterval:clearInterval(变量) 一直执行，需要条件才会停止
      let time = number;
      timer.value = setInterval(() => {
        time--;
        if (time === 0) {
          clearInterval(timer.value);
         updataButtonStatus({
        status: false,
        text: "再次获取",
      });

        } else {
          codeButtonStatus.text = `倒计时${time}秒`;
        }
      }, 1000);
    };
    /**
     * 清除倒计时
     */
    const clearCountDown = () => {
      //还原验证码按钮默认状态
      updataButtonStatus({
        status: false,
        text: "获取验证码",
      });

      
      //清楚倒计时
      clearInterval(timer.value);

      // const codeButtonStatus = reactive({
      //   status: false,
      //   text: "获取验证码",
      // });
    };
    /**
     * 生命周期
     */
    //挂载完成后
    onMounted(() => {});
    return {
      menuTab,
      ruleForm,
      rules,
      model,
      toggleMneu,
      submitForm,
      getSms,
      loginButtonStatus,
      codeButtonStatus,
    };
  },
};
</script>
<style lang="scss">
#login {
  height: 100vh;
  background-color: #4aadad;
}
.login-wrap {
  width: 330px;
  margin: auto;
}
.menu-tab {
  text-align: center;
  li {
    display: inline-block;
    width: 88px;
    line-height: 36px;
    font-size: 14px;
    color: #fff;
    border-radius: 2px;
    cursor: pointer;
  }
  .current {
    background-color: rgba(0, 0, 0, 0.1);
  }
}
.login-form {
  margin-top: 29px;
  label {
    display: block;
    font-size: 14px;
    color: #fff;
    margin-bottom: 3px;
  }
  .item-form {
    margin-bottom: 13px;
  }
  .block {
    width: 100%;
    display: block;
  }
  .login-btn {
    margin-top: 19px;
  }
}
</style>