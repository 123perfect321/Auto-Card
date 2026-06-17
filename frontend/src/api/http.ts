import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

http.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code === 0) {
      return data.data
    }
    return Promise.reject(new Error(data.msg || '请求失败'))
  },
  (error) => {
    const msg = error.response?.data?.msg || error.message || '网络错误'
    return Promise.reject(new Error(msg))
  }
)

export default http
