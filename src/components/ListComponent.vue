<script setup lang="ts">
import { VNumberInput } from "vuetify/labs/VNumberInput";
import { onMounted, ref } from "vue";

const suites = ref<Suite[]>([]);
const nbRooms = ref(null);
const surface = ref(null);
const nbWindows = ref(null);
const price = ref(null);

interface Suite {
  id: number;
  nbRooms: number;
  surface: number;
  nbWindows: number;
  price: number;
}

const getSuitesList = async () => {
  try {
    const response = await fetch("http://127.0.0.1:3002/suites");
    suites.value = await response.json();
  } catch (e) {
    console.error(e);
  }
};

const resetForm = () => {
  nbRooms.value = null;
  surface.value = null;
  nbWindows.value = null;
  price.value = null;
};

onMounted(async () => {
  await getSuitesList();
});

const handleCreateSuite = async () => {
  const newSuite = {
    nbRooms: nbRooms.value,
    surface: surface.value,
    nbWindows: nbWindows.value,
    price: price.value,
  };

  try {
    await fetch("http://127.0.0.1:3002/suites", {
      method: "POST",
      body: JSON.stringify(newSuite),
      headers: {
        "Content-Type": "application/json",
      },
    });

    resetForm();
    await getSuitesList();
  } catch (e) {
    console.error(e);
  }
};

const handleDeleteSuite = (suite: Suite) => {
  console.log(`TODO : delete suite ${suite.id}`);
};

const handleEditSuite = (suite: Suite) => {
  console.log(`TODO : edit suite ${suite.id}`);
};
</script>

<template>
  <h3>Ajouter un appartement</h3>
  <v-sheet class="mx-auto" width="300">
    <v-form fast-fail @submit.prevent>
      <v-number-input
        v-model="nbRooms"
        label="Nombre de chambre"
      ></v-number-input>

      <v-number-input v-model="surface" label="Surface"></v-number-input>

      <v-number-input
        v-model="nbWindows"
        label="Nombre de fenêtres"
      ></v-number-input>

      <v-number-input v-model="price" label="Prix"></v-number-input>

      <v-btn
        class="mt-2"
        type="submit"
        block
        variant="tonal"
        color="green"
        @click="handleCreateSuite()"
        >Ajouter</v-btn
      >
    </v-form>
  </v-sheet>
  <h3>Liste d'appartements</h3>
  <v-table>
    <thead>
      <tr>
        <th class="text-center">ID</th>
        <th class="text-center">Nombre de chambres</th>
        <th class="text-center">Surface</th>
        <th class="text-center">Nombre de fenêtres</th>
        <th class="text-center">Prix</th>
        <th class="text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="suite in suites" :key="suite.id">
        <td class="text-center">{{ suite.id }}</td>
        <td class="text-center">{{ suite.nbRooms }}</td>
        <td class="text-center">{{ suite.surface }}</td>
        <td class="text-center">{{ suite.nbWindows }}</td>
        <td class="text-center">{{ suite.price }}</td>
        <td class="text-center">
          <v-btn
            variant="tonal"
            color="orange"
            class="mr-2"
            @click="handleEditSuite(suite)"
            >Éditer</v-btn
          >
          <v-btn variant="tonal" color="red" @click="handleDeleteSuite(suite)"
            >Supprimer</v-btn
          >
        </td>
      </tr>
    </tbody>
  </v-table>
</template>
