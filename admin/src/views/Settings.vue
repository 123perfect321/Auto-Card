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
          <el-form :model="settings" label-width="120px" style="max-width: 600px">
            <el-form-item label="支付宝AppID">
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
import { getSettings, updateSettings } from '@/api'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')
const saving = ref(false)
const settings = reactive<Record<string, any>>({
  site_name: '', site_description: '', service_email: '', order_timeout: 30,
  smtp_host: '', smtp_port: 465, smtp_user: '', smtp_pass: '',
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
</script>
