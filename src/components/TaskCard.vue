<template>
  <div class="task">
    <template v-if="mode === 'listItem'">
       <IonItemSliding>
        <IonItemOptions
          v-if="!task.isCompleted"
          side="start"
        >
          <IonItemOption @click="doneTask(task)">Сделано</IonItemOption>
        </IonItemOptions>
        <IonItem
          :class="{ 'is-completed': task.completed }"
        >
          <IonLabel>
            {{ task.title }}
          </IonLabel>
          <IonReorder slot="end"></IonReorder>
          <IonButton
            color="warning"
            slot="end"
            @click="removeTask(index)"
          >
            <IonIcon slot="icon-only" :icon="closeIcon"></IonIcon>
          </IonButton>
        </IonItem>
      </IonItemSliding>
    </template>
  </div>
</template>

<script setup>
import {
  IonItem, IonItemOption, IonItemOptions, IonItemSliding,
  IonIcon,
  IonLabel,
  IonButton,
  IonReorder
} from '@ionic/vue'

const props = defineProps({
    mode: {
      type: String,
      default: 'listItem'
    },
    active: {
      type: Boolean,
      default: false
    },
    completed: {
      type: Boolean,
      default: false
    },
    expired: {
      type: Boolean,
      default: false
    },
    burning: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    tags: {
      type: Array,
      default: () => []
    },
    createdAt: {
      type: String,
      required: true
    },
});
</script>