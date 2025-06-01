import request from '@/utils/request'

export function add(data) {
    return request({
        url: '/accountAgency',
        method: 'post',
        data: data
    })
}

export function del(id) {
    return request({
        url: `/accountAgency/${id}`,
        method: 'delete'
    })
}

export function delBatch(ids) {
    return request({
        url: `/accountAgency`,
        method: 'delete',
        data: ids
    })
}

export function pageQuery(query) {
    return request({
        url: '/accountAgency/pageQuery',
        method: 'get',
        params: query
    })
}

export function modify(data) {
    return request({
        url: '/accountAgency',
        method: 'put',
        data: data
    })
}

export function detail(id) {
    return request({
        url: `/accountAgency/${id}`,
        method: 'get'
    })
}