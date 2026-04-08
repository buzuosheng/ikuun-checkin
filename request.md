## 4.8新的登录请求抓取
curl 'https://ikuuu.fyi/auth/login' \
  -H 'accept: application/json, text/javascript, */*; q=0.01' \
  -H 'accept-language: zh-CN,zh;q=0.9' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'origin: https://ikuuu.fyi' \
  -H 'pragma: no-cache' \
  -H 'priority: u=1, i' \
  -H 'referer: https://ikuuu.fyi/auth/login' \
  -H 'sec-ch-ua: "Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36' \
  -H 'x-requested-with: XMLHttpRequest' \
  --data-raw 'host=ikuuu.fyi&email=1015350043%40qq.com&passwd=w1015350043&code=&captcha_result%5Blot_number%5D=1f5c19b680d041d6957279e3d539a37b&captcha_result%5Bcaptcha_output%5D=p7QhSpSWt9IU8JangMB3EPQGUdcMQkXCwJRfmLGCXaIfxrskw0vbc5-LMkIzshpWr_YPbLyC0a0B5Z4d3whxAkonJXfwJ5I4Zaq-LZJPjkfW467z-T4SoSc6r02TAzzhLiWQ8IOfQfLdSmqlGSmqcCU3aIb7BMQzc5U7-p7pVm0M-DQ1NBTAVuW8h45y_-aVb2FuBleey8dO5AttX-P0gdC_A2oOdPTNKCKzFXF6uBPdI_bOePPuf7v-CC2jI5lGILX6Rs5QTgyeoG5YjN8Gy1JwlB-V5I0BdEQMETBnsbEeT9NkwPcRrJJWFMlMb1SiVqbr46Hz2WRpeFqQjWyeNrIHXAEWbW5puxTnoFxEENwXfb-7GQW--_zcYzVwqWeAHyuAW3Okv8eBdhuqNYdpkX99HSsIQIgWPEWlgIWYQd7YEviXIAq2-brbO496rMs6&captcha_result%5Bpass_token%5D=d4162a1a3540e0027e73365ea0ee0d963603739c9546db51a4aafcdc5cb9637b&captcha_result%5Bgen_time%5D=1775641445&pageLoadedAt=1775641445046'


## 登录表单组件
``` html
<form action="javascript:void(0);" method="POST" class="needs-validation" novalidate="">

  <div class="card-body">
    <div class="form-group login-form-item">
      <label for="email">邮箱</label>
      <input id="email" type="email" class="form-control" name="email" tabindex="1" required="" autofocus="">
        <div class="invalid-feedback">
          请填写邮箱
        </div>
    </div>

    <div class="form-group login-form-item">
      <div class="d-block">
        <label for="password" class="control-label">密码</label>
        <div class="float-right">
          <a href="/password/reset" class="text-small">
            忘记密码？
          </a>
        </div>
      </div>
      <input id="password" type="password" class="form-control" name="password" tabindex="2" required="">
        <div class="invalid-feedback">
          请填写密码
        </div>
    </div>

    <div id="2fa-form" class="form-group" style="display: none;">
      <label for="2fa-code">二步验证</label>
      <input id="2fa-code" type="number" class="form-control" name="2fa-code" tabindex="1" maxlength="6" placeholder="请输入6位验证码" required="">
        <div class="invalid-feedback">
          请输入验证码
        </div>
    </div>

    <div class="form-group">
      <div class="form-group">
        <div class="embed-captcha"><div class="geetest_captcha_4978d6c9 geetest_captcha geetest_float geetest_customTheme geetest_nextReady"><div class="geetest_holder_4978d6c9 geetest_holder" style="width: 100%;"><svg class="geetest_btn_svg_4978d6c9 geetest_btn_svg"><path class="geetest_path_top_4978d6c9 geetest_path_top geetest_svg_default geetest_svg_animate" d="M0,25 L0.0,4.0 Q0,0,4.0,0.0 L296.0,0.0 Q300,0,300.0,4.0 L300,25" stroke-dasharray="350, 350" stroke-dashoffset="350" stroke-width="2"></path><path class="geetest_path_bottom_4978d6c9 geetest_path_bottom geetest_svg_default geetest_svg_animate" d="M0,25 L0.0,46.0 Q0,50,4.0,50.0 L296.0,50.0 Q300,50,300.0,46.0 L300,25" stroke-dasharray="350, 350" stroke-dashoffset="350" stroke-width="2"></path></svg><div class="geetest_btn_click_4978d6c9 geetest_btn_click" aria-label="点击按钮开始验证" tabindex="0"></div><div class="geetest_mask_4978d6c9 geetest_mask"><div class="geetest_mask_layer_4978d6c9 geetest_mask_layer"></div></div><div class="geetest_content_4978d6c9 geetest_content"><div class="geetest_gradient_bar_4978d6c9 geetest_gradient_bar"></div><div class="geetest_tip_container_4978d6c9 geetest_tip_container"><div class="geetest_tips_wrap_4978d6c9 geetest_tips_wrap"><div class="geetest_err_tips_4978d6c9 geetest_err_tips"></div><div class="geetest_tip_4978d6c9 geetest_tip">点我开始验证</div></div><a class="geetest_logo_4978d6c9 geetest_logo" href="https://www.geetest.com/first_page" target="_blank" tabindex="-1" aria-label="Geetest"></a></div><div class="geetest_err_code_4978d6c9 geetest_err_code"></div></div><div class="geetest_box_wrap_4978d6c9 geetest_box_wrap"><div class="geetest_box_4978d6c9 geetest_box"><div class="geetest_header_4978d6c9 geetest_header"><div class="geetest_title_4978d6c9 geetest_title"><div class="geetest_text_tips_4978d6c9 geetest_text_tips"><span class="geetest_strong_4978d6c9 geetest_strong"></span></div><div class="geetest_ques_tips_4978d6c9 geetest_ques_tips"></div></div><div class="geetest_status_bar_4978d6c9 geetest_status_bar"></div></div><div class="geetest_container_4978d6c9 geetest_container"><div class="geetest_wrap_4978d6c9 geetest_wrap"><div class="geetest_result_tips_4978d6c9 geetest_result_tips"></div></div></div><div class="geetest_footer_4978d6c9 geetest_footer"><div class="geetest_footer_left_4978d6c9 geetest_footer_left"><button class="geetest_close_4978d6c9 geetest_close" aria-label="关闭验证" role="button" type="button" tabindex="0"><div class="geetest_close_tips_4978d6c9 geetest_close_tips geetest_small_tip" tabindex="-1" aria-hidden="true">关闭验证</div></button><button class="geetest_refresh_4978d6c9 geetest_refresh" aria-label="刷新验证" role="button" type="button" tabindex="0"><div class="geetest_refresh_tips_4978d6c9 geetest_refresh_tips geetest_small_tip" tabindex="-1" aria-hidden="true">刷新验证</div></button><a class="geetest_feedback_4978d6c9 geetest_feedback" href="https://www.geetest.com/en/Helper" target="_blank" aria-label="帮助反馈" role="button" tabindex="-1"><div class="geetest_feedback_tips_4978d6c9 geetest_feedback_tips geetest_small_tip" tabindex="-1" aria-hidden="true">帮助反馈</div></a><button class="geetest_voice_4978d6c9 geetest_voice geetest_hide" aria-label="视觉障碍" role="button" type="button" tabindex="0"><div class="geetest_voice_icon_tips_4978d6c9 geetest_voice_icon_tips geetest_small_tip" tabindex="-1" aria-hidden="true">视觉障碍</div></button><button class="geetest_back_4978d6c9 geetest_back geetest_hide" aria-label="返回" role="button" type="button" tabindex="0"><div class="geetest_back_tips_4978d6c9 geetest_back_tips geetest_small_tip" tabindex="-1" aria-hidden="true">返回</div></button></div><div class="geetest_footer_right_4978d6c9 geetest_footer_right"><div class="geetest_progress_4978d6c9 geetest_progress"></div><a class="geetest_box_logo_4978d6c9 geetest_box_logo" href="https://www.geetest.com/first_page" target="_blank" tabindex="-1" aria-label="Geetest"></a></div></div><div class="geetest_ai_detect_4978d6c9 geetest_ai_detect"></div><div class="geetest_ai_grid_4978d6c9 geetest_ai_grid"></div></div><div class="geetest_box_layer_4978d6c9 geetest_box_layer"><div class="geetest_box_btn_4978d6c9 geetest_box_btn" style="width: 300px;"></div></div></div></div><div class="geetest_popup_ghost_4978d6c9 geetest_popup_ghost"></div></div></div>
        <div class="geetest-onloading-placeholder" style="display: none;">
          验证码正在加载，请稍等...
          <div>一直有问题？邮箱联系管理员：<br>ikuuu-complain@tuta.io （请一并发送故障截图）</div>
        </div>
        <div class="geetest-error-message" style="display: none; color: #dc3545;">
          <div>一直有问题？邮箱联系管理员：<br>ikuuu-complain@tuta.io （请一并发送故障截图）</div>
        </div>
      </div>

      <script src="/gt4.js"></script>

      <style>
    /* geetest 标志会跳转到 geetest 官网，大量用户误触，隐藏它以提升用户体验 */
        .geetest_logo {
          display: none;
    }
      </style>

      <script>
        var geetestV4Handler = null;
        var geetestV4Result = null;
        var geetestV4Loaded = false;
        var geetestV4Error = null;

        /**
         * 通用验证码接口 - Geetest V4 实现
         * 包含用户友好性功能
         */
        window.Captcha = {
          /**
           * 重置验证码
           */
          reset: function() {
        if (geetestV4Handler) {
          geetestV4Handler.reset();
        }
        geetestV4Result = null;
    },

        /**
         * 获取验证码响应
         * @returns Object 返回 captcha_result 对象
         */
        getResponse: function() {
        if (!geetestV4Result) {
            return { };
        }

        return {
          lot_number: geetestV4Result.lot_number,
        captcha_output: geetestV4Result.captcha_output,
        pass_token: geetestV4Result.pass_token,
        gen_time: geetestV4Result.gen_time
        };
    },

        /**
         * 验证是否已完成
         * @returns boolean
         */
        isReady: function() {
        return geetestV4Result !== null && geetestV4Result.lot_number;
    },

        /**
         * 获取提供商名称
         * @returns string
         */
        getProvider: function() {
        return 'geetest_v4';
    },

        /**
         * 检查验证码是否已加载完成
         * @returns boolean
         */
        isLoaded: function() {
        return geetestV4Loaded;
    },

        /**
         * 获取错误信息
         * @returns string or null
         */
        getError: function() {
        return geetestV4Error;
    },

        /**
         * 隐藏加载提示（内部方法）
         */
        _hideLoading: function() {
        const elements = document.querySelectorAll('.geetest-onloading-placeholder');
        elements.forEach((el) => {
          el.style.display = 'none';
        });
    },

        /**
         * 显示加载提示（内部方法）
         */
        _showLoading: function() {
        const elements = document.querySelectorAll('.geetest-onloading-placeholder');
        elements.forEach((el) => {
          el.style.display = 'block';
        });
    },

        /**
         * 显示错误消息（内部方法）
         */
        _showErrorMessage: function(message) {
        const elements = document.querySelectorAll('.geetest-error-message');
        elements.forEach((el) => {
          el.innerHTML = message + '<div>一直有问题？邮箱联系管理员：<br>ikuuu-complain@tuta.io （请一并发送故障截图）</div>';
        el.style.display = 'block';
        });
    },

        /**
         * 隐藏错误消息（内部方法）
         */
        _hideErrorMessage: function() {
        const elements = document.querySelectorAll('.geetest-error-message');
        elements.forEach((el) => {
          el.style.display = 'none';
        el.innerHTML = '';
        });
    },

        /**
         * 设置就绪回调
         * @param Function callback
         */
        onReady: function(callback) {
        if (geetestV4Handler) {
          geetestV4Handler.onReady(callback);
        }
    },

        /**
         * 设置成功回调
         * @param Function callback
         */
        onSuccess: function(callback) {
        if (geetestV4Handler) {
          geetestV4Handler.onSuccess(callback);
        }
    },

        /**
         * 设置错误回调
         * @param Function callback
         */
        onError: function(callback) {
        if (geetestV4Handler) {
          geetestV4Handler.onError(callback);
        } else if (geetestV4Error && callback) {
          callback(geetestV4Error);
        }
    },

        /**
         * 设置失败回调
         * @param Function callback
         */
        onFail: function(callback) {
        if (geetestV4Handler && geetestV4Handler.onFail) {
          geetestV4Handler.onFail(callback);
        }
    }
};

        // 初始化 Geetest V4
        try {
          initGeetest4({
            captchaId: 'cc96d05ba8b60f9112f76e18526fcb73',
            nativeButton: {
              width: '100%',
            }
          }, function (captcha) {
            geetestV4Handler = captcha;
            geetestV4Loaded = true;

            captcha.appendTo(".embed-captcha");

            // 验证码准备完毕，隐藏加载提示
            captcha.onReady(function () {
              window.Captcha._hideLoading();

              // 修改验证按钮文字
              // 用户不知道“按钮”指的是什么，改成“点我”更友好
              // 因为用户可能点击后取消验证，按钮会被刷新，所以要持续监测这段文字
              setInterval(function () {
                var tipElements = document.querySelectorAll('.geetest_tip');
                tipElements.forEach(function (el) {
                  if (el.textContent === '点击按钮开始验证') {
                    el.textContent = '点我开始验证';
                  }
                });
              }, 200);
            });

            captcha.onSuccess(function () {
              geetestV4Result = captcha.getValidate();
              // 验证成功时的回调，隐藏所有错误提示
              window.Captcha._hideErrorMessage();
            });

            // 验证失败时的回调（用户未通过验证）
            captcha.onFail(function (failObj) {
              window.Captcha._showErrorMessage('验证失败，请重试。' + JSON.stringify(failObj));
            });

            // 验证加载或初始化错误时的回调
            captcha.onError(function (error) {
              let errorMessage = '验证码加载失败, ' + JSON.stringify(error);
              window.Captcha._showErrorMessage(errorMessage);
            });
          });
} catch (error) {
          geetestV4Error = '验证码初始化失败: ' + error.message;
        window.Captcha._hideLoading();
        window.Captcha._showErrorMessage(geetestV4Error);
}
      </script>
    </div>

    <div class="form-group login-form-item">
      <div class="custom-control custom-checkbox">
        <input type="checkbox" name="remember" class="custom-control-input" tabindex="3" id="remember-me">
          <label class="custom-control-label" for="remember-me">记住我</label>
      </div>
    </div>

    <div class="form-group">
      <button type="submit" class="btn btn-primary btn-lg btn-block login" tabindex="4">
        登录
      </button>
    </div>

    <div class="text-center mt-4 mb-3 login-form-item">
      <div class="text-job text-muted">或</div>
    </div>
    <div class="form-group login-form-item">
      <button data-toggle="modal" id="telegram-login-button" data-target="#telegram-modal" class="btn btn-info btn-lg btn-block" tabindex="4" style="box-shadow:none;">
        <i class="fab fa-telegram-plane"></i> 使用 Telegram 登录
      </button>
    </div>

  </div>
</form>
```
