import request from '@/utils/request'

export function pageQuery(query) {
    return request({
        url: '/orderAccountAgencyAccount/pageQuery',
        method: 'get',
        params: query
    })
}

export function detail(id) {
    return request({
        url: `/orderAccountAgencyAccount/${id}`,
        method: 'get'
    })
}

export function getOrderAccountAgencyDetailsByOrderId(query) {
    return request({
        url: '/orderAccountAgencyAccount/getOrderAccountAgencyDetailsByOrderId',
        method: 'get',
        params: query
    })
}