<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Текущая задача</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content fullscreen>
      <IonGrid>
        <IonRow class="ion-align-items-center">
          <IonCol>
            <IonCard v-if="active" class="activeTask">
              <IonCardTitle class="activeTask__title">{{ active.title }}</IonCardTitle>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from 'vue'
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol,
  IonCard, IonCardTitle
} from '@ionic/vue'

export default  {
  name: 'ActiveView',
  components: { 
    IonHeader, IonToolbar, IonTitle, IonContent, IonPage,
    IonGrid, IonRow, IonCol,
    IonCard, IonCardTitle
  },
  setup() {
    const activeData = JSON.parse(localStorage.getItem('active')) || {}
    const active = ref(activeData)

    console.log(active.value)

    return {
      active
    }
  }
}
</script>

<style lang="scss" scoped>
.activeTask {
  padding: 1.5rem;
  margin: 100px 21%;

  &__title {
    font-size: 1.8rem;
  }
}
</style>