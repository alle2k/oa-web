import request from '@/utils/request'

export function getBizDetailByBizIdAndAuditType(query) {
    return request({
        url: '/approvalSubmissionRecord/getBizDetailByBizIdAndAuditType',
        method: 'get',
        params: query
    })
}