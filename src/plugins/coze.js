import useUserStore from '@/store/modules/user'

export default {
    initCozeClient() {
        const userStore = useUserStore()
        new CozeWebSDK.WebChatClient({
            config: {
                bot_id: '7484471279018622976',
                type: 'bot',
                isIframe: false
            },
            auth: {
                type: 'token',
                token: userStore.cozeAccessToken, // 从vuex中获取token,
                onRefreshToken: function () {
                    return userStore.cozeAccessToken
                }
            },
            userInfo: { // 从vuex中获取用户信息, 用于展示用户头像和昵称, 不填则展示默认头像和昵称
                id: userStore.id,
                url: userStore.avatar,
                nickName: userStore.nickName, // 昵称, 不填则展示默认昵称
            },
            ui: {
                base: {
                    icon: 'https://aka-noodle.obs.cn-east-3.myhuaweicloud.com/output_20250418_a7XmF6RN.png'
                },
                header: {
                    isShow: true,
                },
                footer: {
                    isShow: true,
                    expressionText: 'Powered by {{name}} Technology Co., Ltd.',
                    linkvars: {
                        name: {
                            text: '博卓企服',
                            link: 'https://zhaokai.xyz'
                        }
                    }
                },
                chatBot: {
                    title: '会话' // 机器人名称, 不填则展示默认名称
                }
            }
        });
    },
}