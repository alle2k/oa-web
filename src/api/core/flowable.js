import request from '@/utils/request'

export function audit(data) {
    return request({
        url: '/flowable/audit',
        method: 'post',
        data: data
    })
}

export function rollback(data) {
    return request({
        url: '/flowable/rollback',
        method: 'post',
        data: data
    })
}
