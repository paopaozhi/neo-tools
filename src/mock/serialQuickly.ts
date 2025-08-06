import {MockMethod} from 'vite-plugin-mock'

export default [
    {
        url: '/api/quickly-info',
        method: 'get',
        response: () => {
            return {
                code: 200,
                data: ["AT+OK"],
            }
        },
    }
] as MockMethod[]