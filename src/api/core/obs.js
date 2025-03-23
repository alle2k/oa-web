import request from '@/utils/request'

export function upload(data, config) {
    return request({
        url: '/obs/upload',
        method: 'post',
        headers: { 'Content-Type': 'multipart/form-data' },
        data: data,
        ...config,
    })
}