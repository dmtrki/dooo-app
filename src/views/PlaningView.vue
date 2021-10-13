<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Планирование</ion-title>
      </ion-toolbar>
    </ion-header>
    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol size="7">
            <ion-reorder-group 
              @ionItemReorder="doReorder($event)" 
              :disabled="false"
            >
              <template
                v-for="(task, index) in tasksFlat"
                :key="index"
              >
                <IonListHeader v-if="task.isHeader" lines="inset">
                  <IonLabel v-if="task.dateKey === todayKey" color="primary">Сегодня</IonLabel>
                  <IonLabel v-else>{{ task.title }}</IonLabel>
                </IonListHeader>

                <IonItemSliding
                  v-else-if="!task.isCompleted || settings.showCompleted"
                >
                  <ion-item-options
                    v-if="!task.isCompleted"
                    side="start"
                  >
                    <ion-item-option @click="doneTask(task)">Сделано</ion-item-option>
                  </ion-item-options>
                  <ion-item
                    :class="{ 'is-completed': task.completed }"
                  >
                    <ion-label>
                      {{ task.title }}
                    </ion-label>
                    <ion-reorder slot="end"></ion-reorder>
                    <ion-button
                      color="warning"
                      slot="end"
                      @click="removeTask(index)"
                    >
                      <ion-icon slot="icon-only" :icon="closeIcon"></ion-icon>
                    </ion-button>
                  </ion-item>
                </IonItemSliding>

              </template>
            </ion-reorder-group>
            <h4 v-if="tasksFlat.length === 0">Ничего нет.</h4>
          </IonCol>
          <IonCol>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Добавление задачи</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <form @submit.prevent="addTask()">
                  <input
                    v-model.trim="newTask.title"
                    name="newTaskTitle"
                    autocomplete="off"
                  >
                  <IonDatetime
                    :min="now" 
                    max="2033" 
                    v-model="newTask.date"
                    display-format="DD MMM"
                    :month-short-names="monthes"
                  ></IonDatetime>
                  <IonButton
                    type="submit"
                    color="success"
                    size="large"
                  >
                    <IonIcon :icon="addIcon" slot="icon-only"/>
                  </IonButton>
                </form>
              </IonCardContent>
            </IonCard>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Управление</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonRow>
                  <IonCol>
                    <IonItem>
                      <IonToggle v-model="settings.showCompleted" />
                      <IonLabel>
                        Показывать выполненные
                      </IonLabel>
                    </IonItem>
                  </IonCol>
                  <IonCol>
                    <IonButton
                      color="danger"
                      size="large"
                      @click="removeCompletedTasks"
                    >
                      Удалить выполненные
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  </ion-page>
</template>

<script>
import { ref, reactive } from 'vue'
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonIcon,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonCol, IonGrid, IonRow,
  IonListHeader,
  IonItem, IonItemOption, IonItemOptions, IonItemSliding,
  IonLabel,
  IonButton,
  IonReorder, IonReorderGroup,
  IonDatetime, IonToggle
} from '@ionic/vue'
import { 
  closeSharp as closeIcon,
  addOutline as addIcon
} from 'ionicons/icons'

import { url_slug as Slugify } from 'cyrillic-slug'

export default  {
  name: 'PlaningView',
  components: { 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    IonIcon,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonCol, IonGrid, IonRow,
    IonListHeader,
    IonItem, IonItemOption, IonItemOptions, IonItemSliding,
    IonLabel,
    IonButton,
    IonReorder, IonReorderGroup,
    IonDatetime, IonToggle
  },
  setup () {
    const settingsDefault = {
      showCompleted: true,
    }
    const settingsData = JSON.parse(localStorage.getItem('settings')) || settingsDefault
    const settings = reactive(settingsData)

    const newTask = reactive({
      title: '',
      date: new Date().toISOString()
    })

    const tasksData = JSON.parse(localStorage.getItem('tasks')) || {}
    const tasks = reactive(tasksData)

    const tagsData = JSON.parse(localStorage.getItem('tags')) || []
    const tags = ref(tagsData)
    
    const monthes = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    const now = new Date().toISOString()
    const getDateKeyFromDate = (date) => date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear()
    const todayKey = getDateKeyFromDate(new Date())


    const removeEmptyDates = () => {
      for (let groupKey in tasks) {
        if(!tasks.hasOwnProperty(groupKey)) continue
        if (tasks[groupKey].tasks.length === 0) delete tasks[groupKey]
      }
    }

    removeEmptyDates()

    const getFlatTasks = () => {
      let tasksFlatAccumulator = []

      for (let groupKey in tasks) {
        if(!tasks.hasOwnProperty(groupKey)) continue
        const taskGroup = tasks[groupKey]
        tasksFlatAccumulator.push({
          isHeader: true, 
          title: taskGroup.title, 
          dateKey: taskGroup.dateKey, 
          date: taskGroup.date,
          count: taskGroup.count
        }, ...taskGroup.tasks)
      }
      return tasksFlatAccumulator
    }

    const tasksFlat = ref(getFlatTasks())

    const getGroupedFromFlat = () => {
      let tasksGrouped = {}
      const flat = tasksFlat.value

      flat.forEach(it => {
        if (it.isHeader === true) {
          tasksGrouped[it.dateKey] = {
            title: it.title,
            date: it.date,
            dateKey: it.dateKey,
            count: it.count,
            tasks: []
          }
        } else {
          const parent = tasksGrouped[Object.keys(tasksGrouped)[Object.keys(tasksGrouped).length - 1]]
          it.date = parent.date
          it.dateKey = parent.dateKey
          parent.tasks.push(it)
        }
      })

      console.groupEnd()

      return tasksGrouped
    }

    const saveTasks =  () => {
      const tasksGrouped = getGroupedFromFlat()
      const storageData = JSON.stringify(tasksGrouped)
      localStorage.setItem('tasks', storageData)

      if (tasksGrouped[todayKey]) {
        const activeTask = tasksGrouped[todayKey].tasks.length ? tasksGrouped[todayKey].tasks[0] : false
        console.log(JSON.stringify(activeTask))
        localStorage.setItem('active', JSON.stringify(activeTask))
      }
    }

    const doReorder = (event) => {
      if (event.detail.to === 0) return event.detail.complete(false)
      tasksFlat.value = event.detail.complete(tasksFlat.value)
      saveTasks()
    }

    const addTask = () => {
        if (newTask.title !== '') {
          const date = new Date(newTask.date),
                dateTitle = date.getDate() + ' ' + monthes[date.getMonth()],
                dateKey = date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear(),
                hashTagRegex = /(?:[#]+)([A-Za-z0-9А-яа-я_]+)/g,
                tagsMatched = [...newTask.title.matchAll(hashTagRegex)]

          let taskTags = []

          if (tagsMatched.length !== 0) {
            const tagsExistsBeforeParseCount = tags.value.length
            tagsMatched.forEach(tag => {
              const tagSlug = Slugify(tag[1])
              const tagO = {
                title: tag[1],
                slug: tagSlug,
                color: Math.floor(Math.random() * 16777215).toString(16)
              }
              if (!tags.value.find(it => it.slug === tagSlug)) {
                tags.value.push(tagO)
              }
              taskTags.push(tagO.slug)
            })
            if (tags.value.length !== tagsExistsBeforeParseCount) localStorage.setItem('tags', JSON.stringify(tags.value))
          }
          
          if (!tasks[dateKey]) tasks[dateKey] = {
                                                  title: dateTitle,
                                                  date: date,
                                                  dateKey: dateKey,
                                                  count: 1,
                                                  tasks: []
                                                }
          
          tasks[dateKey].tasks.push({
              completed: false,
              title: newTask.title.replace(hashTagRegex, ''),
              date: newTask.date,
              dateTitle: dateTitle,
              dateKey: dateKey,
              createdAt: new Date().toISOString(),
              tags: taskTags
          })
          tasksFlat.value = getFlatTasks()

          newTask.title = ''
          saveTasks()
        }
    }

    const doneTask = (task) => {
        task.completed = !task.completed
        saveTasks()
    }

    const removeTask = (index) => {
        tasksFlat.value.splice(index, 1)
        saveTasks()
    }

    const removeCompletedTasks = () => {
      tasksFlat.value.forEach((it, index) => {
        if (it.completed) tasksFlat.value.splice(index, 1)
      })
      saveTasks()
    }

    const saveSettings =  () => {
      const storageData = JSON.stringify(settings)
      localStorage.setItem('settings', storageData)
    }

    const toggleShowCompletedSetting = () => {
      settings.showCompleted = !settings.showCompleted
      saveSettings()
    }

    return {
      // static
      monthes,
      now,
      todayKey,
      // reactive
      settings,
      newTask,
      tasks,
      tasksFlat,
      // functions
      saveTasks,
      doReorder,
      addTask,
      doneTask,
      removeTask,
      removeCompletedTasks,
      toggleShowCompletedSetting,
      // icons
      closeIcon,
      addIcon
    }
  }
}
</script>

<style lang="scss">
.is-completed {
  opacity: .5;
}
</style>