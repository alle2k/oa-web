import request from '@/utils/request'

export function pageQuery(query) {
    return request({
        url: '/order/pageQuery',
        method: 'get',
        params: query
    })
}

export function save(data) {
    return request({
        url: '/order',
        method: 'post',
        data: data
    })
}

export function modify(data) {
    return request({
        url: '/order',
        method: 'put',
        data: data
    })
}

export function delOrder(data) {
    return request({
        url: '/order',
        method: 'delete',
        data: data
    })
}