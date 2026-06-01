<template>
  <div id="user-mgmt-content">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-2xl font-semibold text-gray-900">User Management</h3>
      <div class="flex items-center space-x-4">
        <button
          @click="exportAll"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <i class="fas fa-download mr-2"></i>Export All
        </button>
      </div>
    </div>

    <!-- Batch Action + Search + Event Filter -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
      <!-- 左侧：事件筛选 + 搜索框 -->
      <div class="flex items-center gap-2 flex-wrap md:flex-nowrap">
        <select
          v-model="selectedEvent"
          class="h-10 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Events</option>
          <option v-for="e in eventsList" :key="e" :value="e">{{ e }}</option>
        </select>

        <input
          v-model="searchName"
          type="text"
          placeholder="Search by Name..."
          class="h-10 px-4 border border-gray-300 rounded-lg text-sm"
        />

        <button
          @click="applySearch"
          class="h-10 px-4 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center"
        >
          <i class="fas fa-search text-gray-600 mr-1"></i>Search
        </button>
      </div>

      <!-- 右侧：选中数量 + 发送邮件 -->
      <div class="flex items-center gap-2 mt-2 md:mt-0">
        <span class="text-gray-600">Selected: {{ selectedUsers.length }}</span>
        <button
          :disabled="selectedUsers.length === 0"
          @click="openEmailModal"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i class="fas fa-envelope mr-2"></i>Send Email
        </button>
      </div>
    </div>

    <!-- 加载动画 -->
    <div v-if="loading" class="col-span-full flex justify-center items-center py-20">
      <svg
        class="animate-spin h-10 w-10 text-primary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
        ></path>
      </svg>
      <span class="ml-2 text-gray-700">Loading events...</span>
    </div>

    <!-- PrimeVue DataTable -->
    <DataTable
      v-if="!loading"
      v-model:selection="selectedUsers"
      :value="filteredUsers"
      selectionMode="multiple"
      :paginator="true"
      :rows="10"
      :sortField="sortField"
      :sortOrder="sortOrder"
      @sort="onSort"
      responsiveLayout="scroll"
    >
      <!-- 选择列 -->
      <Column selectionMode="multiple" headerStyle="width: 3em"></Column>

      <!-- Name + Avatar -->
      <Column field="name" header="Name" sortable>
        <template #body="slotProps">
          <div class="flex items-center">
            <img
              class="h-10 w-10 rounded-full object-cover"
              :src="slotProps.data.avatar || 'https://via.placeholder.com/40'"
              :alt="'Avatar of ' + slotProps.data.name"
            />
            <div class="ml-3">
              <div class="text-sm font-medium text-gray-900">{{ slotProps.data.name }}</div>
            </div>
          </div>
        </template>
      </Column>

      <!-- Email Column -->
      <Column field="email" header="Email" sortable>
        <template #body="slotProps">
          <span>{{ slotProps.data.email || '-' }}</span>
        </template>
      </Column>

      <!-- Gender Column -->
      <Column field="gender" header="Gender" sortable>
        <template #body="slotProps">
          <span>{{ slotProps.data.gender || '-' }}</span>
        </template>
      </Column>

      <!-- Events Column -->
      <Column field="events" header="Events">
        <template #body="slotProps">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="(event, index) in slotProps.data.events"
              :key="index"
              class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {{ event }}
            </span>
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Email Modal -->
    <Dialog
      v-model:visible="showEmailModal"
      header="Send Email"
      modal
      :closable="false"
      :style="{ width: '400px' }"
    >
      <div class="mb-4">
        <textarea
          v-model="emailContent"
          rows="5"
          placeholder="Write your email here..."
          class="w-full border border-gray-300 rounded-lg p-2"
        ></textarea>
      </div>
      <div class="mb-4">
        <label class="block">
          <span class="text-gray-700 mb-1">Attachment (PDF or Image, max 10MB)</span>
          <input
            type="file"
            accept=".pdf,image/*"
            @change="handleFileUpload"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
        </label>
        <div v-if="attachment" class="mt-2 text-sm text-gray-700">
          Selected File: {{ attachment.name }} ({{ attachment.type || 'unknown type' }})
        </div>
      </div>

      <div class="flex justify-end space-x-2">
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="sendingEmail"
          @click="sendBatchEmail"
        >
          <svg
            v-if="sendingEmail"
            class="animate-spin h-5 w-5 mr-2 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            ></path>
          </svg>
          <span>{{ sendingEmail ? 'Sending...' : 'Send' }}</span>
        </button>
        <Button label="Cancel" class="p-button-secondary" @click="closeEmailModal" />
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { EventService } from '@/api/event'
import { getErrorMessage } from '@/utils/error'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { MailService } from '@/api/mail'
const alert = inject('alert')

defineOptions({
  name: 'ParticipantTable',
})

const auth = getAuth()
const uid = ref(null)
const users = ref([])
const filteredUsers = ref([])
const selectedUsers = ref([])
const selectedEvent = ref('all')
const searchName = ref('')
const eventsList = ref([]) // 动态事件名列表
const loading = ref(false)
const sendingEmail = ref(false)

// 排序状态
const sortField = ref(null)
const sortOrder = ref(null)
function onSort(e) {
  sortField.value = e.sortField
  sortOrder.value = e.sortOrder
}

// 邮件弹窗
const showEmailModal = ref(false)
const emailContent = ref('')
const attachment = ref(null)
function openEmailModal() {
  showEmailModal.value = true
}
function closeEmailModal() {
  showEmailModal.value = false
  emailContent.value = ''
  attachment.value = null
}

// 发送批量邮件
async function sendBatchEmail() {
  if (!selectedUsers.value.length) {
    alert.value.show('No users selected!', 'warning')
    return
  }
  sendingEmail.value = true
  const emailSet = new Set(selectedUsers.value.map((u) => u.email))
  const emails = Array.from(emailSet)

  let mailPayload = {
    recipients: emails,
    subject: 'Notification from Event Admin',
    content: emailContent.value,
  }

  if (attachment.value) {
    const file = attachment.value
    mailPayload.attachmentName = file.name
    mailPayload.attachment = await readFileAsBase64(file)
  }

  try {
    await MailService.send(mailPayload)
    alert.value.show('Email sent successful!', 'success')
    closeEmailModal()
  } catch (err) {
    console.error('Failed to send batch email:', err)
    alert.value.show(getErrorMessage(err, 'Failed to send email'), 'error')
  } finally {
    sendingEmail.value = false
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1] // 去掉 data:*/*;base64,
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // 文件类型校验
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    alert.value.show('Only PDF or images are allowed', 'warning')
    event.target.value = ''
    return
  }

  // 文件大小校验 (< 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert.value.show('File size must be less than 10MB', 'warning')
    event.target.value = ''
    return
  }

  attachment.value = file
}

// 应用搜索
function applySearch() {
  filteredUsers.value = users.value.filter((u) => {
    const matchesEvent = selectedEvent.value === 'all' || u.events.includes(selectedEvent.value)
    const matchesName = u.name.toLowerCase().includes(searchName.value.toLowerCase())
    return matchesEvent && matchesName
  })
  selectedUsers.value = []
}

// 获取用户数据
async function loadUsers() {
  if (!uid.value || loading.value) return
  loading.value = true
  try {
    const result = await EventService.getEventParticipants(uid.value)
    users.value = result.map((u) => ({
      uid: u.uid,
      avatar: u.avatar || '',
      name: u.name || '',
      email: u.email || '',
      gender: u.gender || '',
      events: u.events || [],
    }))
    filteredUsers.value = [...users.value]

    // 动态生成事件列表
    const eventSet = new Set()
    users.value.forEach((u) => u.events.forEach((e) => eventSet.add(e)))
    eventsList.value = Array.from(eventSet)
  } catch (err) {
    console.error('Failed to load participant data:', err)
    alert.value.show(getErrorMessage(err, 'Failed to load participant data'), 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    uid.value = user?.uid ?? null
    if (uid.value) loadUsers()
  })
})

// watch 筛选事件 + 搜索
watch([selectedEvent, searchName], () => applySearch())

// 导出示例
// 导出选中用户为 CSV
function exportAll() {
  // 假设 filteredUsers 是筛选后的数据数组
  if (!filteredUsers.value || !filteredUsers.value.length) {
    alert.value.show('No users to export!', 'warning')
    return
  }

  const headers = ['Name', 'Email', 'Gender']
  const rows = filteredUsers.value.map((u) => [u.name || '', u.email || '', u.gender || ''])

  // 拼接 CSV 字符串
  let csvContent = ''
  csvContent += headers.join(',') + '\n'
  rows.forEach((row) => {
    const safeRow = row.map((field) =>
      typeof field === 'string' && (field.includes(',') || field.includes('\n'))
        ? `"${field.replace(/"/g, '""')}"`
        : field,
    )
    csvContent += safeRow.join(',') + '\n'
  })

  // 创建 Blob 并下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'users_export.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
