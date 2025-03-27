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
            componentProps: {
                title: 'Coze',
            },
            auth: {
                type: 'token',
                token: userStore.cozeAccessToken, // 从vuex中获取token,
                onRefreshToken: function () {
                    return userStore.cozeAccessToken
                }
            }
        });
    },
}