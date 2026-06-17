<template>
  <div class="page-settings">
    <el-card shadow="never">
      <template #header><h3>系统设置</h3></template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础设置" name="basic">
          <el-form :model="settings" label-width="120px" style="max-width: 600px">
            <el-form-item label="站点名称">
              <el-input v-model="settings.site_name" />
            </el-form-item>
            <el-form-item label="站点描述">
              <el-input v-model="settings.site_description" type="textarea" :rows="2" />
            </el-form-item>
            <el-form-item label="客服邮箱">
              <el-input v-model="settings.service_email" />
            </el-form-item>
            <el-form-item label="订单超时(分)">
              <el-input-number v-model="settings.order_timeout" :min="5" :max="120" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="邮件配置" name="email">
          <el-form :model="settings" label-width="120px" style="max-width: 600px">
            <el-form-item label="SMTP主机">
              <el-input v-model="settings.smtp_host" />
            </el-form-item>
            <el-form-item label="SMTP端口">
              <el-input-number v-model="settings.smtp_port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="SMTP用户">
              <el-input v-model="settings.smtp_user" />
            </el-form-item>
            <el-form-item label="SMTP密码">
              <el-input v-model="settings.smtp_pass" type="password" show-password />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="支付配置" name="payment">
          <el-form :model="settings" label-width="140px" style="max-width: 640px">
            <el-divider content-position="left">易支付（推荐）</el-divider>
            <el-form-item label="商户 PID">
              <el-input v-model="settings.epay_pid" placeholder="例如：10001" />
            </el-form-item>
            <el-form-item label="商户密钥 (key)">
              <el-input v-model="settings.epay_key" type="password" show-password placeholder="登录易支付后台查看" />
            </el-form-item>
            <el-form-item label="网关地址">
              <el-input v-model="settings.epay_gateway" placeholder="例如：https://pay.example.com" />
            </el-form-item>
            <el-form-item label=" ">
              <el-button type="primary" @click="testEpay" :loading="testing">测试网关连通</el-button>
              <span v-if="testMsg" style="margin-left: 12px">{{ testMsg }}</span>
            </el-form-item>

            <el-divider content-position="left">异步回调地址</el-divider>
            <el-form-item label="通知地址 (notify)">
              <el-input :model-value="siteUrl + '/api/payments/notify'" readonly />
            </el-form-item>
            <el-form-item label="回跳地址 (return)">
              <el-input :model-value="siteUrl + '/api/payments/return'" readonly />
            </el-form-item>
            <el-form-item label=" ">
              <div class="form-hint">
                将以上两个地址填入易支付后台的「异步通知 URL / 同步回跳 URL」。
                <br/>站点根地址来自后端 .env 中的 <code>SITE_URL</code>。
              </div>
            </el-form-item>

            <el-divider content-position="left">支付宝 / 微信官方直连（可选，未实现）</el-divider>
            <el-form-item label="支付宝 AppID">
              <el-input v-model="settings.alipay_appid" />
            </el-form-item>
            <el-form-item label="支付宝密钥">
              <el-input v-model="settings.alipay_key" type="password" show-password />
            </el-form-item>
            <el-form-item label="微信商户号">
              <el-input v-model="settings.wechat_mchid" />
            </el-form-item>
            <el-form-item label="微信密钥">
              <el-input v-model="settings.wechat_key" type="password" show-password />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div style="margin-top: 24px">
        <el-button type="primary" @click="handleSave" :loading="saving">保存设置</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getSettings, updateSettings, testPaymentConnection } from '@/api'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')
const saving = ref(false)
const testing = ref(false)
const testMsg = ref('')
const siteUrl = String((import.meta as any).env?.VITE_SITE_URL || window.location.origin)

const settings = reactive<Record<string, any>>({
  site_name: '', site_description: '', service_email: '', order_timeout: 30,
  smtp_host: '', smtp_port: 465, smtp_user: '', smtp_pass: '',
  epay_pid: '', epay_key: '', epay_gateway: '',
  alipay_appid: '', alipay_key: '', wechat_mchid: '', wechat_key: '',
})

onMounted(async () => {
  try {
    const result = await getSettings() as any
    Object.assign(settings, result)
  } catch (e) { console.error(e) }
})

async function handleSave() {
  saving.value = true
  try {
    await updateSettings(settings)
    ElMessage.success('设置已保存')
  } catch (e) { console.error(e) } finally { saving.value = false }
}

async function testEpay() {
  testing.value = true
  testMsg.value = ''
  try {
    const data = await testPaymentConnection() as any
    testMsg.value = data?.success ? '✓ ' + (data.message || '连通成功') : '✗ ' + (data.message || '失败')
  } catch (e: any) {
    testMsg.value = '✗ ' + (e.message || '请求失败')
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.form-hint {
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
}
.form-hint code {
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
}
</style>
